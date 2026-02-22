import { contextBridge, ipcRenderer } from 'electron';

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Menu event listeners
  onMenuAction: (callback: (action: string, data?: any) => void) => {
    const actions = [
      'menu:new-workspace',
      'menu:open-file',
      'menu:save',
      'menu:save-as',
      'menu:export',
      'menu:undo',
      'menu:redo',
      'menu:toggle-grid',
      'menu:toggle-rulers',
      'menu:zoom-fit',
      'menu:preferences',
      'prompt:api-key',
    ];
    actions.forEach((action) => {
      ipcRenderer.on(action, (_event, data) => callback(action, data));
    });
  },

  // API key management
  saveApiKey: (key: string) => ipcRenderer.invoke('save-api-key', key),
  getEnvPath: () => ipcRenderer.invoke('get-env-path'),

  // File system operations
  readFile: (filePath: string) => ipcRenderer.invoke('fs:read-file', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:write-file', filePath, content),

  // Platform info
  platform: process.platform,
  isMac: process.platform === 'darwin',
});

// Type declaration for renderer
declare global {
  interface Window {
    electronAPI?: {
      onMenuAction: (callback: (action: string, data?: any) => void) => void;
      saveApiKey: (key: string) => Promise<boolean>;
      getEnvPath: () => Promise<string>;
      readFile: (filePath: string) => Promise<string>;
      writeFile: (filePath: string, content: string) => Promise<void>;
      platform: string;
      isMac: boolean;
    };
  }
}
