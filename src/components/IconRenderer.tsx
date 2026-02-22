'use client';

import * as LucideIcons from 'lucide-react';

interface IconRendererProps {
  iconName: string;
  color?: string;
  size?: number;
}

// Convert kebab-case to PascalCase: "arrow-right" -> "ArrowRight"
function kebabToPascal(str: string): string {
  return str
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function IconRenderer({ iconName, color = '#ffffff', size = 24 }: IconRendererProps) {
  // Try to find the icon component dynamically
  const pascalName = kebabToPascal(iconName);
  const IconComponent = (LucideIcons as any)[pascalName] || LucideIcons.HelpCircle;

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ color }}>
      <IconComponent size={size} strokeWidth={2} />
    </div>
  );
}
