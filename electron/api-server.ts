import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { app as electronApp } from 'electron';

// NOTE: Route imports are dynamic (below) so dotenv loads the API key FIRST

let server: any = null;

export async function startApiServer(port: number): Promise<void> {
  // Load .env — check multiple locations for packaged app compatibility
  const envPaths = [
    // 1. App's userData folder (~/Library/Application Support/Bivvy/.env)
    path.join(electronApp.getPath('userData'), '.env'),
    // 2. User's home directory (~/.bivvy.env)
    path.join(electronApp.getPath('home'), '.bivvy.env'),
    // 3. Bundled in extraResources
    path.join(process.resourcesPath || '', '.env'),
    // 4. Next to the .app bundle
    path.join(electronApp.getAppPath(), '..', '..', '.env'),
    // 5. Dev mode: project root
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '.env.local'),
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', '.env.local'),
  ];
  
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      console.log(`[API] Loaded env from ${envPath}`);
      break;
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[API] ⚠️  ANTHROPIC_API_KEY not found. AI features will not work.');
    console.warn('[API] Create a .env file with: ANTHROPIC_API_KEY=sk-ant-your-key-here');
  } else {
    console.log('[API] ✓ ANTHROPIC_API_KEY loaded');
  }

  // Dynamic require — routes now see the env vars when they initialize
  const { handleAIUpdate } = require('./routes/ai-update');
  const { handleAIVariations } = require('./routes/ai-variations');
  const { handleExtractTokens } = require('./routes/extract-tokens');

  const app = express();

  // Middleware
  app.use(cors({ origin: true })); // Allow all origins including file://
  app.use(express.json({ limit: '50mb' }));

  // Health check
  app.get('/api/health', (_req: express.Request, res: express.Response) => {
    res.json({ 
      status: 'ok', 
      hasApiKey: !!process.env.ANTHROPIC_API_KEY,
      version: '1.0.0',
    });
  });

  // AI Routes
  app.post('/api/ai-update', handleAIUpdate);
  app.post('/api/ai-variations', handleAIVariations);
  app.post('/api/extract-tokens', handleExtractTokens);

  // Error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[API] Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return new Promise((resolve) => {
    server = app.listen(port, '127.0.0.1', () => {
      console.log(`[API] Server listening on http://127.0.0.1:${port}`);
      resolve();
    });
  });
}

export function stopApiServer(): void {
  if (server) {
    server.close();
    server = null;
    console.log('[API] Server stopped');
  }
}
