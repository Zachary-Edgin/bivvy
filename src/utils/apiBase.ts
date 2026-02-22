// In dev mode, Vite proxies /api/* to localhost:3001
// In production (packaged Electron), we need the full URL
export const API_BASE = 
  typeof window !== 'undefined' && window.location.protocol === 'file:' 
    ? 'http://127.0.0.1:3001' 
    : '';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
