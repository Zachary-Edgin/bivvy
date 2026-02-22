/// <reference types="vite/client" />

declare module '*.svg' {
  const src: string;
  export default src;
}

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
