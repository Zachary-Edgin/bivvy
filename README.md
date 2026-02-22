# Bivvy — AI Component Design Tool (Desktop)

A desktop application for Mac that lets designers describe problems in natural language and receive AI-generated design variations constrained to exact design system tokens.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up your API key
cp .env.example .env
# Edit .env and add your Anthropic API key

# 3. Run in development mode
npm run electron:dev

# This starts:
#   - Vite dev server on http://localhost:5173 (hot reload)
#   - Local API server on http://localhost:3001 (AI routes)
#   - Electron window loading the Vite dev server
```

## Build for Mac

```bash
# Build the .app and .dmg
npm run electron:build

# Output will be in the release/ directory
```

## Architecture

```
bivvy-desktop/
├── electron/              # Electron main process
│   ├── main.ts            # Window creation, Mac menu, app lifecycle
│   ├── preload.ts         # Safe IPC bridge to renderer
│   ├── api-server.ts      # Express server hosting AI routes locally
│   ├── lib/               # Shared AI/validation libraries
│   │   ├── aiTokenContext.ts
│   │   ├── constraintValidator.ts
│   │   └── serverConstraintValidator.ts
│   └── routes/            # API route handlers (Express)
│       ├── ai-update.ts
│       ├── ai-variations.ts
│       └── extract-tokens.ts
├── src/                   # React renderer (Vite)
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # React entry point
│   ├── globals.css        # Tailwind + global styles
│   ├── components/        # All UI components
│   ├── lib/               # Client-side libraries
│   ├── store/             # Zustand state management
│   └── utils/             # Utility functions
├── public/                # Static assets
├── index.html             # Vite entry HTML
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript config (renderer)
├── tsconfig.electron.json # TypeScript config (main process)
└── package.json           # Dependencies + electron-builder config
```

## How It Works

- **Electron** provides the desktop shell with native Mac integration (traffic lights, menu bar, file dialogs)
- **Vite + React** renders the entire UI in the Electron BrowserWindow
- **Express** runs locally inside the Electron main process, hosting the AI API routes on port 3001
- **Anthropic Claude API** is called from the local Express server (API key stays local, never sent to browser)
- Frontend `fetch('/api/...')` calls are proxied to the local server automatically

## Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server only (no Electron) |
| `npm run electron:dev` | Full development: Vite + Electron + API server |
| `npm run electron:preview` | Build and preview in Electron |
| `npm run electron:build` | Production build → Mac .dmg |
| `npx tsx src/lib/constraintTests.ts` | Run constraint engine test suite (29 tests) |

## Key Technologies

- **Electron** — Desktop shell (Mac-native with `hiddenInset` title bar)
- **Vite** — Build tool + HMR
- **React 18** + **TypeScript 5** — UI framework
- **Zustand** — State management (2,200+ line store)
- **Tailwind CSS** — Styling
- **Claude API** — AI-powered component generation + variation
- **Express** — Local API server for AI routes
