import { app, BrowserWindow, Menu, shell, dialog, nativeTheme, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { startApiServer, stopApiServer } from './api-server';

// Force dark mode to match Bivvy's UI
nativeTheme.themeSource = 'dark';

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
const API_PORT = 3001;

// ═══ API Key Management ═══
function getEnvPath(): string {
  return path.join(app.getPath('userData'), '.env');
}

function hasApiKey(): boolean {
  const envPath = getEnvPath();
  if (!fs.existsSync(envPath)) return false;
  const content = fs.readFileSync(envPath, 'utf8');
  return content.includes('ANTHROPIC_API_KEY=sk-ant-');
}

async function promptForApiKey(): Promise<boolean> {
  const result = await dialog.showMessageBox({
    type: 'info',
    title: 'Bivvy — API Key Required',
    message: 'Bivvy needs an Anthropic API key for AI features.',
    detail: 'Enter your API key (starts with sk-ant-). You can get one at console.anthropic.com.\n\nYou can change this later from Bivvy → Preferences.',
    buttons: ['Enter API Key', 'Skip for Now'],
    defaultId: 0,
  });

  if (result.response === 1) return false; // skipped

  const inputResult = await dialog.showMessageBox({
    type: 'question',
    title: 'Enter Anthropic API Key',
    message: 'Paste your API key below:',
    detail: 'The key will be stored locally in:\n' + getEnvPath(),
    buttons: ['Save', 'Cancel'],
    defaultId: 0,
  });

  // electron doesn't have a text input dialog, so use a workaround via the renderer
  if (mainWindow) {
    mainWindow.webContents.send('prompt:api-key');
    return true;
  }
  return false;
}

function saveApiKey(key: string): void {
  const envPath = getEnvPath();
  const dir = path.dirname(envPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(envPath, `ANTHROPIC_API_KEY=${key}\n`, 'utf8');
  console.log(`[Bivvy] API key saved to ${envPath}`);
}

// IPC handler for API key from renderer
ipcMain.handle('save-api-key', (_event, key: string) => {
  saveApiKey(key);
  return true;
});

ipcMain.handle('get-env-path', () => {
  return getEnvPath();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',       // Native Mac traffic lights inset into content
    trafficLightPosition: { x: 12, y: 10 },
    backgroundColor: '#1a1a1a',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Show when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in dev mode
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ═══ Mac App Menu ═══
function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Preferences…',
          accelerator: 'Cmd+,',
          click: async () => {
            const envPath = getEnvPath();
            const keyExists = hasApiKey();
            const result = await dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'Bivvy Preferences',
              message: keyExists ? 'API key is configured ✓' : 'No API key set',
              detail: `API key location: ${envPath}\n\nTo change your key, edit the .env file at the path above, or click "Set API Key" to enter a new one.`,
              buttons: keyExists ? ['Done', 'Set New API Key', 'Open Config Folder'] : ['Set API Key', 'Open Config Folder', 'Cancel'],
            });
            if (keyExists && result.response === 1) {
              mainWindow?.webContents.send('prompt:api-key');
            } else if (keyExists && result.response === 2) {
              shell.showItemInFolder(envPath);
            } else if (!keyExists && result.response === 0) {
              mainWindow?.webContents.send('prompt:api-key');
            } else if (!keyExists && result.response === 1) {
              shell.showItemInFolder(envPath);
            }
          },
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Workspace',
          accelerator: 'Cmd+N',
          click: () => mainWindow?.webContents.send('menu:new-workspace'),
        },
        {
          label: 'Open…',
          accelerator: 'Cmd+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow!, {
              properties: ['openFile'],
              filters: [{ name: 'Bivvy Projects', extensions: ['bivvy', 'json'] }],
            });
            if (!result.canceled && result.filePaths[0]) {
              mainWindow?.webContents.send('menu:open-file', result.filePaths[0]);
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'Cmd+S',
          click: () => mainWindow?.webContents.send('menu:save'),
        },
        {
          label: 'Save As…',
          accelerator: 'Cmd+Shift+S',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow!, {
              filters: [{ name: 'Bivvy Projects', extensions: ['bivvy'] }],
            });
            if (!result.canceled && result.filePath) {
              mainWindow?.webContents.send('menu:save-as', result.filePath);
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Export…',
          accelerator: 'Cmd+E',
          click: () => mainWindow?.webContents.send('menu:export'),
        },
        { type: 'separator' },
        { role: 'close' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'Cmd+Z',
          click: () => mainWindow?.webContents.send('menu:undo'),
        },
        {
          label: 'Redo',
          accelerator: 'Cmd+Shift+Z',
          click: () => mainWindow?.webContents.send('menu:redo'),
        },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Grid',
          accelerator: 'Cmd+G',
          click: () => mainWindow?.webContents.send('menu:toggle-grid'),
        },
        {
          label: 'Toggle Rulers',
          accelerator: 'Cmd+R',
          click: () => mainWindow?.webContents.send('menu:toggle-rulers'),
        },
        {
          label: 'Zoom to Fit',
          accelerator: 'Cmd+1',
          click: () => mainWindow?.webContents.send('menu:zoom-fit'),
        },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Bivvy Documentation',
          click: () => shell.openExternal('https://bivvy.design/docs'),
        },
        {
          label: 'Report Issue',
          click: () => shell.openExternal('https://github.com/bivvy/bivvy/issues'),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ═══ App Lifecycle ═══

app.whenReady().then(async () => {
  // Start the local API server first
  await startApiServer(API_PORT);
  console.log(`[Bivvy] API server running on port ${API_PORT}`);

  createMenu();
  createWindow();

  // macOS: re-create window when dock icon clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// macOS: keep app running when all windows closed (standard Mac behavior)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopApiServer();
});
