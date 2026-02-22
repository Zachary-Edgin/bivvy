// Asset Library - Provides access to downloaded font assets

interface FontFamily {
  name: string;
  path: string;
  variants: string[];
}

// Available fonts from downloaded assets
export const availableFonts: FontFamily[] = [
  { name: 'Inter', path: '/downloaded_assets/fonts/Inter', variants: ['Regular', 'Medium', 'SemiBold', 'Bold'] },
  { name: 'Manrope', path: '/downloaded_assets/fonts/Manrope', variants: ['Regular', 'Medium', 'SemiBold', 'Bold'] },
  { name: 'Space Grotesk', path: '/downloaded_assets/fonts/Space_Grotesk', variants: ['Regular', 'Medium', 'SemiBold', 'Bold'] },
  { name: 'DM Sans', path: '/downloaded_assets/fonts/DM_Sans', variants: ['Regular', 'Medium', 'Bold'] },
  { name: 'Plus Jakarta Sans', path: '/downloaded_assets/fonts/Plus_Jakarta_Sans', variants: ['Regular', 'Medium', 'SemiBold', 'Bold'] },
  { name: 'Roboto', path: '/downloaded_assets/fonts/Roboto', variants: ['Regular', 'Medium', 'Bold'] },
  { name: 'Poppins', path: '/downloaded_assets/fonts/Poppins', variants: ['Regular', 'Medium', 'SemiBold', 'Bold'] },
  { name: 'Montserrat', path: '/downloaded_assets/fonts/Montserrat', variants: ['Regular', 'Medium', 'SemiBold', 'Bold'] },
  { name: 'Open Sans', path: '/downloaded_assets/fonts/Open_Sans', variants: ['Regular', 'Medium', 'SemiBold', 'Bold'] },
  { name: 'Lato', path: '/downloaded_assets/fonts/Lato', variants: ['Regular', 'Bold'] },
];
