// Dynamic Google Fonts loader
// Injects <link> tags for Google Fonts on demand

const loadedFonts = new Set<string>();

export function loadGoogleFont(fontFamily: string): void {
  // Normalize font name
  const clean = fontFamily
    .replace(/['"]/g, '')
    .replace(/,.*$/, '') // Remove fallback fonts
    .trim();
  
  if (!clean || loadedFonts.has(clean)) return;
  
  // Skip system/generic fonts
  const systemFonts = [
    'system-ui', 'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New',
    'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS',
    '-apple-system', 'BlinkMacSystemFont', 'Segoe UI',
  ];
  if (systemFonts.some(sf => clean.toLowerCase() === sf.toLowerCase())) return;
  
  loadedFonts.add(clean);
  
  // Create link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(clean)}:wght@300;400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

// Extract and load all fonts from a set of style objects
function loadFontsFromStyles(styles: Record<string, any>): void {
  if (styles.fontFamily) {
    // Handle comma-separated font stacks
    const primary = styles.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
    loadGoogleFont(primary);
  }
}

// Scan all components and load any Google Fonts they reference (recursive)
export function loadFontsFromComponents(components: any[]): void {
  for (const comp of components) {
    if (comp.styles) loadFontsFromStyles(comp.styles);
    if (comp.children) {
      loadFontsFromComponents(comp.children);
    }
  }
}
