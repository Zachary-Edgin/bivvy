// Component Library - Comprehensive collection based on Material Design 3, shadcn/ui, and modern design systems

interface ComponentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  component: ComponentElement;
}

interface ComponentElement {
  id: string;
  type: 'div' | 'button' | 'input' | 'text' | 'image';
  content?: string;
  styles: Record<string, string>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  children?: ComponentElement[];
}

export const componentLibrary: ComponentTemplate[] = [
  // BUTTONS (Expanded)
  {
    id: 'btn-primary',
    name: 'Primary Button',
    category: 'Buttons',
    description: 'Main call-to-action',
    thumbnail: '🔵',
    component: {
      id: 'comp-' + Date.now(),
      type: 'button',
      content: 'Primary',
      position: { x: 50, y: 50 },
      size: { width: 120, height: 40 },
      styles: {
        backgroundColor: '#1976d2',
        color: '#ffffff',
        padding: '10px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }
    }
  },
  {
    id: 'btn-secondary',
    name: 'Secondary Button',
    category: 'Buttons',
    description: 'Secondary action',
    thumbnail: '⚪',
    component: {
      id: 'comp-' + Date.now(),
      type: 'button',
      content: 'Secondary',
      position: { x: 50, y: 50 },
      size: { width: 120, height: 40 },
      styles: {
        backgroundColor: 'transparent',
        color: '#1976d2',
        padding: '10px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        border: '2px solid #1976d2',
        cursor: 'pointer',
      }
    }
  },
  {
    id: 'btn-outlined',
    name: 'Outlined Button',
    category: 'Buttons',
    description: 'Medium emphasis',
    thumbnail: '🔲',
    component: {
      id: 'comp-' + Date.now(),
      type: 'button',
      content: 'Outlined',
      position: { x: 50, y: 50 },
      size: { width: 120, height: 40 },
      styles: {
        backgroundColor: 'transparent',
        color: '#333',
        padding: '10px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        border: '1px solid #d0d0d0',
        cursor: 'pointer',
      }
    }
  },
  {
    id: 'btn-text',
    name: 'Text Button',
    category: 'Buttons',
    description: 'Minimal text button',
    thumbnail: '📝',
    component: {
      id: 'comp-' + Date.now(),
      type: 'button',
      content: 'Text',
      position: { x: 50, y: 50 },
      size: { width: 80, height: 36 },
      styles: {
        backgroundColor: 'transparent',
        color: '#1976d2',
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
      }
    }
  },
  {
    id: 'btn-icon',
    name: 'Icon Button',
    category: 'Buttons',
    description: 'Icon only button',
    thumbnail: '⚙️',
    component: {
      id: 'comp-' + Date.now(),
      type: 'button',
      content: '⚙️',
      position: { x: 50, y: 50 },
      size: { width: 40, height: 40 },
      styles: {
        backgroundColor: '#f5f5f5',
        color: '#333333',
        padding: '8px',
        borderRadius: '50%',
        fontSize: '20px',
        border: 'none',
        cursor: 'pointer',
      }
    }
  },
  {
    id: 'btn-danger',
    name: 'Danger Button',
    category: 'Buttons',
    description: 'Destructive action',
    thumbnail: '🔴',
    component: {
      id: 'comp-' + Date.now(),
      type: 'button',
      content: 'Delete',
      position: { x: 50, y: 50 },
      size: { width: 100, height: 40 },
      styles: {
        backgroundColor: '#d32f2f',
        color: '#ffffff',
        padding: '10px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(211,47,47,0.3)',
      }
    }
  },
  {
    id: 'btn-success',
    name: 'Success Button',
    category: 'Buttons',
    description: 'Positive action',
    thumbnail: '✅',
    component: {
      id: 'comp-' + Date.now(),
      type: 'button',
      content: 'Confirm',
      position: { x: 50, y: 50 },
      size: { width: 110, height: 40 },
      styles: {
        backgroundColor: '#2e7d32',
        color: '#ffffff',
        padding: '10px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(46,125,50,0.3)',
      }
    }
  },
  {
    id: 'btn-large',
    name: 'Large Button',
    category: 'Buttons',
    description: 'Prominent action',
    thumbnail: '🔷',
    component: {
      id: 'comp-' + Date.now(),
      type: 'button',
      content: 'Get Started',
      position: { x: 50, y: 50 },
      size: { width: 160, height: 52 },
      styles: {
        backgroundColor: '#1976d2',
        color: '#ffffff',
        padding: '14px 32px',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '700',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
      }
    }
  },

  // CARDS (Expanded)
  {
    id: 'card-basic',
    name: 'Basic Card',
    category: 'Cards',
    description: 'Simple card container',
    thumbnail: '📄',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      position: { x: 50, y: 50 },
      size: { width: 300, height: 200 },
      styles: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
      children: [
        {
          id: 'comp-title',
          type: 'text',
          content: 'Card Title',
          position: { x: 0, y: 0 },
          size: { width: 252, height: 30 },
          styles: {
            fontSize: '20px',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '12px',
          }
        },
        {
          id: 'comp-body',
          type: 'text',
          content: 'Card content goes here with helpful information.',
          position: { x: 0, y: 42 },
          size: { width: 252, height: 110 },
          styles: {
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#666666',
          }
        }
      ]
    }
  },
  {
    id: 'card-elevated',
    name: 'Elevated Card',
    category: 'Cards',
    description: 'Card with strong shadow',
    thumbnail: '📋',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      position: { x: 50, y: 50 },
      size: { width: 320, height: 180 },
      styles: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      },
      children: [
        {
          id: 'comp-title',
          type: 'text',
          content: 'Elevated Card',
          position: { x: 0, y: 0 },
          size: { width: 264, height: 28 },
          styles: {
            fontSize: '22px',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '16px',
          }
        },
        {
          id: 'comp-body',
          type: 'text',
          content: 'Stands out with prominent shadow.',
          position: { x: 0, y: 44 },
          size: { width: 264, height: 80 },
          styles: {
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#555555',
          }
        }
      ]
    }
  },
  {
    id: 'card-product',
    name: 'Product Card',
    category: 'Cards',
    description: 'E-commerce product card',
    thumbnail: '🛍️',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      position: { x: 50, y: 50 },
      size: { width: 280, height: 360 },
      styles: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e0e0e0',
      },
      children: [
        {
          id: 'comp-image',
          type: 'div',
          content: '🖼️',
          position: { x: 0, y: 0 },
          size: { width: 248, height: 200 },
          styles: {
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            fontSize: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }
        },
        {
          id: 'comp-title',
          type: 'text',
          content: 'Product Name',
          position: { x: 0, y: 216 },
          size: { width: 248, height: 24 },
          styles: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '8px',
          }
        },
        {
          id: 'comp-price',
          type: 'text',
          content: '$99.99',
          position: { x: 0, y: 248 },
          size: { width: 248, height: 28 },
          styles: {
            fontSize: '22px',
            fontWeight: '700',
            color: '#1976d2',
            marginBottom: '12px',
          }
        },
        {
          id: 'comp-button',
          type: 'button',
          content: 'Add to Cart',
          position: { x: 0, y: 288 },
          size: { width: 248, height: 40 },
          styles: {
            backgroundColor: '#1976d2',
            color: '#ffffff',
            padding: '10px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            border: 'none',
            width: '100%',
          }
        }
      ]
    }
  },
  {
    id: 'card-profile',
    name: 'Profile Card',
    category: 'Cards',
    description: 'User profile card',
    thumbnail: '👤',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      position: { x: 50, y: 50 },
      size: { width: 300, height: 280 },
      styles: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        textAlign: 'center',
      },
      children: [
        {
          id: 'comp-avatar',
          type: 'div',
          content: '👤',
          position: { x: 88, y: 0 },
          size: { width: 80, height: 80 },
          styles: {
            backgroundColor: '#e3f2fd',
            borderRadius: '50%',
            fontSize: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            margin: '0 auto 16px',
          }
        },
        {
          id: 'comp-name',
          type: 'text',
          content: 'John Doe',
          position: { x: 0, y: 96 },
          size: { width: 236, height: 28 },
          styles: {
            fontSize: '22px',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '8px',
            textAlign: 'center',
          }
        },
        {
          id: 'comp-role',
          type: 'text',
          content: 'Product Designer',
          position: { x: 0, y: 132 },
          size: { width: 236, height: 20 },
          styles: {
            fontSize: '14px',
            color: '#666666',
            marginBottom: '20px',
            textAlign: 'center',
          }
        },
        {
          id: 'comp-button',
          type: 'button',
          content: 'View Profile',
          position: { x: 68, y: 172 },
          size: { width: 100, height: 36 },
          styles: {
            backgroundColor: '#1976d2',
            color: '#ffffff',
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            border: 'none',
          }
        }
      ]
    }
  },

  // INPUTS (Expanded)
  {
    id: 'input-text',
    name: 'Text Input',
    category: 'Inputs',
    description: 'Standard text field',
    thumbnail: '📝',
    component: {
      id: 'comp-' + Date.now(),
      type: 'input',
      content: 'Enter text...',
      position: { x: 50, y: 50 },
      size: { width: 300, height: 44 },
      styles: {
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        border: '1px solid #d0d0d0',
      }
    }
  },
  {
    id: 'input-search',
    name: 'Search Input',
    category: 'Inputs',
    description: 'Search field with icon',
    thumbnail: '🔍',
    component: {
      id: 'comp-' + Date.now(),
      type: 'input',
      content: '🔍 Search...',
      position: { x: 50, y: 50 },
      size: { width: 320, height: 40 },
      styles: {
        backgroundColor: '#f5f5f5',
        color: '#666666',
        padding: '10px 16px 10px 40px',
        borderRadius: '20px',
        fontSize: '14px',
        border: 'none',
      }
    }
  },
  {
    id: 'input-email',
    name: 'Email Input',
    category: 'Inputs',
    description: 'Email address field',
    thumbnail: '📧',
    component: {
      id: 'comp-' + Date.now(),
      type: 'input',
      content: 'email@example.com',
      position: { x: 50, y: 50 },
      size: { width: 300, height: 44 },
      styles: {
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        border: '1px solid #d0d0d0',
      }
    }
  },
  {
    id: 'input-password',
    name: 'Password Input',
    category: 'Inputs',
    description: 'Password field',
    thumbnail: '🔒',
    component: {
      id: 'comp-' + Date.now(),
      type: 'input',
      content: '••••••••',
      position: { x: 50, y: 50 },
      size: { width: 300, height: 44 },
      styles: {
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        border: '1px solid #d0d0d0',
      }
    }
  },

  // NAVIGATION (Expanded)
  {
    id: 'nav-header',
    name: 'Header Nav',
    category: 'Navigation',
    description: 'Top navigation bar',
    thumbnail: '🧭',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      position: { x: 0, y: 0 },
      size: { width: 1200, height: 64 },
      styles: {
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      },
      children: [
        {
          id: 'comp-logo',
          type: 'text',
          content: 'Logo',
          position: { x: 0, y: 16 },
          size: { width: 100, height: 32 },
          styles: {
            fontSize: '20px',
            fontWeight: '700',
            color: '#1976d2',
          }
        },
        {
          id: 'comp-nav1',
          type: 'text',
          content: 'Home',
          position: { x: 400, y: 20 },
          size: { width: 60, height: 24 },
          styles: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#1a1a1a',
          }
        },
        {
          id: 'comp-nav2',
          type: 'text',
          content: 'About',
          position: { x: 484, y: 20 },
          size: { width: 60, height: 24 },
          styles: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#666666',
          }
        }
      ]
    }
  },
  {
    id: 'nav-sidebar',
    name: 'Sidebar Nav',
    category: 'Navigation',
    description: 'Vertical sidebar menu',
    thumbnail: '📑',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      position: { x: 0, y: 0 },
      size: { width: 240, height: 500 },
      styles: {
        backgroundColor: '#f5f5f5',
        padding: '24px 16px',
        borderRight: '1px solid #e0e0e0',
      },
      children: [
        {
          id: 'comp-item1',
          type: 'div',
          content: '🏠 Dashboard',
          position: { x: 0, y: 0 },
          size: { width: 208, height: 40 },
          styles: {
            backgroundColor: '#1976d2',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
          }
        },
        {
          id: 'comp-item2',
          type: 'div',
          content: '📊 Analytics',
          position: { x: 0, y: 48 },
          size: { width: 208, height: 40 },
          styles: {
            backgroundColor: 'transparent',
            color: '#666666',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
          }
        },
        {
          id: 'comp-item3',
          type: 'div',
          content: '⚙️ Settings',
          position: { x: 0, y: 96 },
          size: { width: 208, height: 40 },
          styles: {
            backgroundColor: 'transparent',
            color: '#666666',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
          }
        }
      ]
    }
  },
  {
    id: 'nav-tabs',
    name: 'Tab Navigation',
    category: 'Navigation',
    description: 'Horizontal tabs',
    thumbnail: '📂',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      position: { x: 50, y: 50 },
      size: { width: 400, height: 48 },
      styles: {
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        gap: '24px',
        padding: '0 16px',
      },
      children: [
        {
          id: 'comp-tab1',
          type: 'text',
          content: 'Overview',
          position: { x: 0, y: 12 },
          size: { width: 80, height: 36 },
          styles: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2',
            borderBottom: '2px solid #1976d2',
            paddingBottom: '12px',
          }
        },
        {
          id: 'comp-tab2',
          type: 'text',
          content: 'Details',
          position: { x: 104, y: 12 },
          size: { width: 60, height: 36 },
          styles: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#666666',
            paddingBottom: '12px',
          }
        },
        {
          id: 'comp-tab3',
          type: 'text',
          content: 'Settings',
          position: { x: 188, y: 12 },
          size: { width: 70, height: 36 },
          styles: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#666666',
            paddingBottom: '12px',
          }
        }
      ]
    }
  },

  // BADGES (Expanded)
  {
    id: 'badge-success',
    name: 'Success Badge',
    category: 'Badges',
    description: 'Success status',
    thumbnail: '✅',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: 'Active',
      position: { x: 50, y: 50 },
      size: { width: 70, height: 24 },
      styles: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    }
  },
  {
    id: 'badge-error',
    name: 'Error Badge',
    category: 'Badges',
    description: 'Error status',
    thumbnail: '❌',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: 'Error',
      position: { x: 50, y: 50 },
      size: { width: 60, height: 24 },
      styles: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    }
  },
  {
    id: 'badge-warning',
    name: 'Warning Badge',
    category: 'Badges',
    description: 'Warning status',
    thumbnail: '⚠️',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: 'Pending',
      position: { x: 50, y: 50 },
      size: { width: 75, height: 24 },
      styles: {
        backgroundColor: '#fff3e0',
        color: '#e65100',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    }
  },
  {
    id: 'badge-info',
    name: 'Info Badge',
    category: 'Badges',
    description: 'Info status',
    thumbnail: 'ℹ️',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: 'New',
      position: { x: 50, y: 50 },
      size: { width: 50, height: 24 },
      styles: {
        backgroundColor: '#e3f2fd',
        color: '#0288d1',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    }
  },

  // HEROES
  {
    id: 'hero-centered',
    name: 'Centered Hero',
    category: 'Heroes',
    description: 'Hero with centered text',
    thumbnail: '🎯',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      position: { x: 0, y: 100 },
      size: { width: 1200, height: 400 },
      styles: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 32px',
        textAlign: 'center',
      },
      children: [
        {
          id: 'comp-title',
          type: 'text',
          content: 'Build Beautiful Interfaces',
          position: { x: 300, y: 80 },
          size: { width: 600, height: 60 },
          styles: {
            fontSize: '48px',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '24px',
            lineHeight: '1.2',
          }
        },
        {
          id: 'comp-subtitle',
          type: 'text',
          content: 'Create stunning UIs faster with AI',
          position: { x: 350, y: 164 },
          size: { width: 500, height: 48 },
          styles: {
            fontSize: '20px',
            color: '#f0f0f0',
            marginBottom: '32px',
            lineHeight: '1.5',
          }
        },
        {
          id: 'comp-cta',
          type: 'button',
          content: 'Get Started',
          position: { x: 520, y: 244 },
          size: { width: 160, height: 48 },
          styles: {
            backgroundColor: '#ffffff',
            color: '#667eea',
            padding: '14px 32px',
            borderRadius: '24px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }
        }
      ]
    }
  },

  // FORMS
  {
    id: 'form-login',
    name: 'Login Form',
    category: 'Forms',
    description: 'User login form',
    thumbnail: '🔐',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      position: { x: 50, y: 50 },
      size: { width: 400, height: 420 },
      styles: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      },
      children: [
        {
          id: 'comp-title',
          type: 'text',
          content: 'Sign In',
          position: { x: 0, y: 0 },
          size: { width: 320, height: 36 },
          styles: {
            fontSize: '28px',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '8px',
          }
        },
        {
          id: 'comp-subtitle',
          type: 'text',
          content: 'Welcome back!',
          position: { x: 0, y: 44 },
          size: { width: 320, height: 24 },
          styles: {
            fontSize: '14px',
            color: '#666666',
            marginBottom: '32px',
          }
        },
        {
          id: 'comp-email',
          type: 'input',
          content: 'Email',
          position: { x: 0, y: 100 },
          size: { width: 320, height: 44 },
          styles: {
            backgroundColor: '#f8f8f8',
            color: '#1a1a1a',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid #e0e0e0',
            marginBottom: '16px',
          }
        },
        {
          id: 'comp-password',
          type: 'input',
          content: 'Password',
          position: { x: 0, y: 160 },
          size: { width: 320, height: 44 },
          styles: {
            backgroundColor: '#f8f8f8',
            color: '#1a1a1a',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid #e0e0e0',
            marginBottom: '24px',
          }
        },
        {
          id: 'comp-submit',
          type: 'button',
          content: 'Sign In',
          position: { x: 0, y: 228 },
          size: { width: 320, height: 48 },
          styles: {
            backgroundColor: '#1976d2',
            color: '#ffffff',
            padding: '14px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '16px',
          }
        },
        {
          id: 'comp-forgot',
          type: 'text',
          content: 'Forgot password?',
          position: { x: 105, y: 292 },
          size: { width: 110, height: 20 },
          styles: {
            fontSize: '14px',
            color: '#1976d2',
            textAlign: 'center',
            cursor: 'pointer',
          }
        }
      ]
    }
  },
  {
    id: 'form-contact',
    name: 'Contact Form',
    category: 'Forms',
    description: 'Contact us form',
    thumbnail: '📧',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      position: { x: 50, y: 50 },
      size: { width: 500, height: 520 },
      styles: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      },
      children: [
        {
          id: 'comp-title',
          type: 'text',
          content: 'Get in Touch',
          position: { x: 0, y: 0 },
          size: { width: 420, height: 36 },
          styles: {
            fontSize: '28px',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '32px',
          }
        },
        {
          id: 'comp-name',
          type: 'input',
          content: 'Your Name',
          position: { x: 0, y: 68 },
          size: { width: 420, height: 44 },
          styles: {
            backgroundColor: '#f8f8f8',
            color: '#1a1a1a',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid #e0e0e0',
            marginBottom: '16px',
          }
        },
        {
          id: 'comp-email',
          type: 'input',
          content: 'your@email.com',
          position: { x: 0, y: 128 },
          size: { width: 420, height: 44 },
          styles: {
            backgroundColor: '#f8f8f8',
            color: '#1a1a1a',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid #e0e0e0',
            marginBottom: '16px',
          }
        },
        {
          id: 'comp-message',
          type: 'div',
          content: 'Your message...',
          position: { x: 0, y: 188 },
          size: { width: 420, height: 120 },
          styles: {
            backgroundColor: '#f8f8f8',
            color: '#666666',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid #e0e0e0',
            marginBottom: '24px',
          }
        },
        {
          id: 'comp-submit',
          type: 'button',
          content: 'Send Message',
          position: { x: 0, y: 332 },
          size: { width: 420, height: 48 },
          styles: {
            backgroundColor: '#1976d2',
            color: '#ffffff',
            padding: '14px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
          }
        }
      ]
    }
  },

  // ===== FEEDBACK =====
  {
    id: 'alert-success',
    name: 'Success Alert',
    category: 'Feedback',
    description: 'Success notification alert',
    thumbnail: '✅',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 400, height: 64 },
      styles: {
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      },
      children: [
        {
          id: 'comp-alert-title',
          type: 'text',
          content: 'Saved.',
          position: { x: 0, y: 0 },
          size: { width: 368, height: 20 },
          styles: { color: '#166534', fontWeight: '700', fontSize: '14px' }
        },
        {
          id: 'comp-alert-desc',
          type: 'text',
          content: 'Your changes have been saved successfully.',
          position: { x: 0, y: 22 },
          size: { width: 368, height: 18 },
          styles: { color: '#15803d', fontSize: '13px' }
        }
      ]
    }
  },
  {
    id: 'alert-danger',
    name: 'Danger Alert',
    category: 'Feedback',
    description: 'Error notification alert',
    thumbnail: '🔴',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 400, height: 64 },
      styles: {
        backgroundColor: '#fef2f2',
        border: '1px solid #fca5a5',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      },
      children: [
        {
          id: 'comp-alert-title',
          type: 'text',
          content: 'Heads up.',
          position: { x: 0, y: 0 },
          size: { width: 368, height: 20 },
          styles: { color: '#991b1b', fontWeight: '700', fontSize: '14px' }
        },
        {
          id: 'comp-alert-desc',
          type: 'text',
          content: 'Something went wrong. Please try again.',
          position: { x: 0, y: 22 },
          size: { width: 368, height: 18 },
          styles: { color: '#b91c1c', fontSize: '13px' }
        }
      ]
    }
  },
  {
    id: 'alert-warning',
    name: 'Warning Alert',
    category: 'Feedback',
    description: 'Warning notification alert',
    thumbnail: '⚠️',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 400, height: 64 },
      styles: {
        backgroundColor: '#fffbeb',
        border: '1px solid #fcd34d',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      },
      children: [
        {
          id: 'comp-alert-title',
          type: 'text',
          content: 'Warning.',
          position: { x: 0, y: 0 },
          size: { width: 368, height: 20 },
          styles: { color: '#92400e', fontWeight: '700', fontSize: '14px' }
        },
        {
          id: 'comp-alert-desc',
          type: 'text',
          content: 'This action cannot be undone.',
          position: { x: 0, y: 22 },
          size: { width: 368, height: 18 },
          styles: { color: '#a16207', fontSize: '13px' }
        }
      ]
    }
  },
  {
    id: 'progress-bar',
    name: 'Progress Bar',
    category: 'Feedback',
    description: 'Linear progress indicator',
    thumbnail: '📊',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 300, height: 10 },
      styles: {
        backgroundColor: '#e5e7eb',
        borderRadius: '999px',
        overflow: 'hidden',
        border: '1px solid #d1d5db',
      },
      children: [
        {
          id: 'comp-progress-fill',
          type: 'div',
          content: '',
          position: { x: 0, y: 0 },
          size: { width: 195, height: 10 },
          styles: {
            background: 'linear-gradient(90deg, #1976d2, #0f9d8a)',
            borderRadius: '999px',
            height: '100%',
          }
        }
      ]
    }
  },

  // ===== DATA =====
  {
    id: 'data-table',
    name: 'Data Table',
    category: 'Data',
    description: 'Table with header and rows',
    thumbnail: '📋',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 500, height: 180 },
      styles: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        overflow: 'hidden',
      },
      children: [
        {
          id: 'comp-thead',
          type: 'div',
          content: '',
          position: { x: 0, y: 0 },
          size: { width: 500, height: 44 },
          styles: {
            display: 'flex',
            backgroundColor: 'rgba(0,0,0,0.02)',
            borderBottom: '1px solid #e5e7eb',
            padding: '12px 16px',
            gap: '0px',
          },
          children: [
            { id: 'th1', type: 'text', content: 'Name', position: { x: 0, y: 0 }, size: { width: 200, height: 20 }, styles: { fontSize: '13px', color: '#6b7280', fontWeight: '600' } },
            { id: 'th2', type: 'text', content: 'Status', position: { x: 200, y: 0 }, size: { width: 150, height: 20 }, styles: { fontSize: '13px', color: '#6b7280', fontWeight: '600' } },
            { id: 'th3', type: 'text', content: 'Amount', position: { x: 350, y: 0 }, size: { width: 118, height: 20 }, styles: { fontSize: '13px', color: '#6b7280', fontWeight: '600' } },
          ]
        },
        {
          id: 'comp-row1',
          type: 'div',
          content: '',
          position: { x: 0, y: 44 },
          size: { width: 500, height: 44 },
          styles: {
            display: 'flex',
            borderBottom: '1px solid #e5e7eb',
            padding: '12px 16px',
          },
          children: [
            { id: 'td1', type: 'text', content: 'Token Hoodie', position: { x: 0, y: 0 }, size: { width: 200, height: 20 }, styles: { fontSize: '14px', color: '#111827', fontWeight: '500' } },
            { id: 'td2', type: 'text', content: 'Active', position: { x: 200, y: 0 }, size: { width: 150, height: 20 }, styles: { fontSize: '14px', color: '#059669' } },
            { id: 'td3', type: 'text', content: '$49.00', position: { x: 350, y: 0 }, size: { width: 118, height: 20 }, styles: { fontSize: '14px', color: '#111827' } },
          ]
        },
        {
          id: 'comp-row2',
          type: 'div',
          content: '',
          position: { x: 0, y: 88 },
          size: { width: 500, height: 44 },
          styles: {
            display: 'flex',
            borderBottom: '1px solid #e5e7eb',
            padding: '12px 16px',
          },
          children: [
            { id: 'td4', type: 'text', content: 'Theme Pack', position: { x: 0, y: 0 }, size: { width: 200, height: 20 }, styles: { fontSize: '14px', color: '#111827', fontWeight: '500' } },
            { id: 'td5', type: 'text', content: 'Pending', position: { x: 200, y: 0 }, size: { width: 150, height: 20 }, styles: { fontSize: '14px', color: '#d97706' } },
            { id: 'td6', type: 'text', content: '$29.00', position: { x: 350, y: 0 }, size: { width: 118, height: 20 }, styles: { fontSize: '14px', color: '#111827' } },
          ]
        },
        {
          id: 'comp-row3',
          type: 'div',
          content: '',
          position: { x: 0, y: 132 },
          size: { width: 500, height: 44 },
          styles: {
            display: 'flex',
            padding: '12px 16px',
          },
          children: [
            { id: 'td7', type: 'text', content: 'Shipping', position: { x: 0, y: 0 }, size: { width: 200, height: 20 }, styles: { fontSize: '14px', color: '#111827', fontWeight: '500' } },
            { id: 'td8', type: 'text', content: 'Completed', position: { x: 200, y: 0 }, size: { width: 150, height: 20 }, styles: { fontSize: '14px', color: '#059669' } },
            { id: 'td9', type: 'text', content: '$5.00', position: { x: 350, y: 0 }, size: { width: 118, height: 20 }, styles: { fontSize: '14px', color: '#111827' } },
          ]
        }
      ]
    }
  },
  {
    id: 'stat-card',
    name: 'Stat Card',
    category: 'Data',
    description: 'KPI metric card',
    thumbnail: '📈',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 180, height: 100 },
      styles: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      },
      children: [
        {
          id: 'comp-stat-label',
          type: 'text',
          content: 'MRR',
          position: { x: 0, y: 0 },
          size: { width: 140, height: 18 },
          styles: { fontSize: '13px', color: '#6b7280' }
        },
        {
          id: 'comp-stat-value',
          type: 'text',
          content: '$18.4k',
          position: { x: 0, y: 24 },
          size: { width: 140, height: 36 },
          styles: { fontSize: '28px', fontWeight: '800', color: '#111827' }
        }
      ]
    }
  },
  {
    id: 'skeleton-loader',
    name: 'Skeleton Loader',
    category: 'Data',
    description: 'Loading placeholder',
    thumbnail: '⬜',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 300, height: 120 },
      styles: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      },
      children: [
        {
          id: 'comp-skel1',
          type: 'div',
          content: '',
          position: { x: 0, y: 0 },
          size: { width: 260, height: 14 },
          styles: { backgroundColor: '#e5e7eb', borderRadius: '8px' }
        },
        {
          id: 'comp-skel2',
          type: 'div',
          content: '',
          position: { x: 0, y: 26 },
          size: { width: 200, height: 14 },
          styles: { backgroundColor: '#e5e7eb', borderRadius: '8px' }
        },
        {
          id: 'comp-skel3',
          type: 'div',
          content: '',
          position: { x: 0, y: 52 },
          size: { width: 140, height: 14 },
          styles: { backgroundColor: '#e5e7eb', borderRadius: '8px' }
        }
      ]
    }
  },

  // ===== LAYOUT =====
  {
    id: 'accordion',
    name: 'Accordion',
    category: 'Layout',
    description: 'Collapsible content sections',
    thumbnail: '📂',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 420, height: 156 },
      styles: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        overflow: 'hidden',
      },
      children: [
        {
          id: 'comp-acc1',
          type: 'div',
          content: '',
          position: { x: 0, y: 0 },
          size: { width: 420, height: 52 },
          styles: { borderBottom: '1px solid #e5e7eb', padding: '16px', backgroundColor: 'rgba(0,0,0,0.01)' },
          children: [
            { id: 'acc-h1', type: 'text', content: 'What is this?', position: { x: 0, y: 0 }, size: { width: 388, height: 20 }, styles: { fontWeight: '800', fontSize: '14px', color: '#111827', cursor: 'pointer' } }
          ]
        },
        {
          id: 'comp-acc2',
          type: 'div',
          content: '',
          position: { x: 0, y: 52 },
          size: { width: 420, height: 52 },
          styles: { borderBottom: '1px solid #e5e7eb', padding: '16px', backgroundColor: 'rgba(0,0,0,0.01)' },
          children: [
            { id: 'acc-h2', type: 'text', content: 'Can I theme everything?', position: { x: 0, y: 0 }, size: { width: 388, height: 20 }, styles: { fontWeight: '800', fontSize: '14px', color: '#111827', cursor: 'pointer' } }
          ]
        },
        {
          id: 'comp-acc3',
          type: 'div',
          content: '',
          position: { x: 0, y: 104 },
          size: { width: 420, height: 52 },
          styles: { padding: '16px', backgroundColor: 'rgba(0,0,0,0.01)' },
          children: [
            { id: 'acc-h3', type: 'text', content: 'Vanilla or Tailwind?', position: { x: 0, y: 0 }, size: { width: 388, height: 20 }, styles: { fontWeight: '800', fontSize: '14px', color: '#111827', cursor: 'pointer' } }
          ]
        }
      ]
    }
  },
  {
    id: 'breadcrumb',
    name: 'Breadcrumb',
    category: 'Layout',
    description: 'Navigation breadcrumb trail',
    thumbnail: '🧭',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: 'Home  /  Library  /  Components',
      position: { x: 50, y: 50 },
      size: { width: 300, height: 28 },
      styles: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#6b7280',
      }
    }
  },
  {
    id: 'pagination',
    name: 'Pagination',
    category: 'Layout',
    description: 'Page navigation controls',
    thumbnail: '⏩',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 300, height: 40 },
      styles: {
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
      },
      children: [
        { id: 'pg-prev', type: 'button', content: 'Prev', position: { x: 0, y: 0 }, size: { width: 60, height: 36 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: '#6b7280', cursor: 'pointer', padding: '8px 12px' } },
        { id: 'pg-1', type: 'button', content: '1', position: { x: 66, y: 0 }, size: { width: 36, height: 36 }, styles: { backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: '#111827', cursor: 'pointer', padding: '8px' } },
        { id: 'pg-2', type: 'button', content: '2', position: { x: 108, y: 0 }, size: { width: 36, height: 36 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: '#6b7280', cursor: 'pointer', padding: '8px' } },
        { id: 'pg-3', type: 'button', content: '3', position: { x: 150, y: 0 }, size: { width: 36, height: 36 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: '#6b7280', cursor: 'pointer', padding: '8px' } },
        { id: 'pg-next', type: 'button', content: 'Next', position: { x: 192, y: 0 }, size: { width: 60, height: 36 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: '#6b7280', cursor: 'pointer', padding: '8px 12px' } },
      ]
    }
  },
  {
    id: 'pill-tabs',
    name: 'Pill Tabs',
    category: 'Layout',
    description: 'Rounded pill-style tab navigation',
    thumbnail: '💊',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 340, height: 44 },
      styles: {
        display: 'flex',
        gap: '6px',
        border: '1px solid #e5e7eb',
        borderRadius: '999px',
        padding: '4px',
        backgroundColor: 'rgba(0,0,0,0.02)',
      },
      children: [
        { id: 'tab-1', type: 'button', content: 'Overview', position: { x: 0, y: 0 }, size: { width: 100, height: 36 }, styles: { backgroundColor: '#ffffff', borderRadius: '999px', fontSize: '13px', fontWeight: '700', color: '#111827', border: 'none', cursor: 'pointer', padding: '8px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' } },
        { id: 'tab-2', type: 'button', content: 'Details', position: { x: 106, y: 0 }, size: { width: 100, height: 36 }, styles: { backgroundColor: 'transparent', borderRadius: '999px', fontSize: '13px', fontWeight: '700', color: '#6b7280', border: 'none', cursor: 'pointer', padding: '8px 16px' } },
        { id: 'tab-3', type: 'button', content: 'History', position: { x: 212, y: 0 }, size: { width: 100, height: 36 }, styles: { backgroundColor: 'transparent', borderRadius: '999px', fontSize: '13px', fontWeight: '700', color: '#6b7280', border: 'none', cursor: 'pointer', padding: '8px 16px' } },
      ]
    }
  },
  {
    id: 'textarea',
    name: 'Textarea',
    category: 'Inputs',
    description: 'Multi-line text input',
    thumbnail: '📝',
    component: {
      id: 'comp-' + Date.now(),
      type: 'input',
      content: 'Type your message here...',
      position: { x: 50, y: 50 },
      size: { width: 340, height: 120 },
      styles: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px 14px',
        fontSize: '14px',
        color: '#6b7280',
        resize: 'vertical',
      }
    }
  },
  {
    id: 'select-dropdown',
    name: 'Select Dropdown',
    category: 'Inputs',
    description: 'Dropdown select input',
    thumbnail: '🔽',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: 'Select an option ▾',
      position: { x: 50, y: 50 },
      size: { width: 240, height: 42 },
      styles: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '14px',
        color: '#111827',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }
    }
  },
  {
    id: 'divider',
    name: 'Divider',
    category: 'Layout',
    description: 'Horizontal divider line',
    thumbnail: '➖',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 400, height: 1 },
      styles: {
        backgroundColor: '#e5e7eb',
        borderRadius: '1px',
      }
    }
  },
  {
    id: 'avatar',
    name: 'Avatar',
    category: 'Data',
    description: 'User avatar placeholder',
    thumbnail: '👤',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: 'ZE',
      position: { x: 50, y: 50 },
      size: { width: 48, height: 48 },
      styles: {
        backgroundColor: '#1976d2',
        borderRadius: '999px',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    }
  },
  {
    id: 'toggle-switch',
    name: 'Toggle Switch',
    category: 'Inputs',
    description: 'On/off toggle switch',
    thumbnail: '🔘',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 48, height: 28 },
      styles: {
        backgroundColor: '#1976d2',
        borderRadius: '999px',
        padding: '3px',
        cursor: 'pointer',
        position: 'relative',
      },
      children: [
        {
          id: 'toggle-knob',
          type: 'div',
          content: '',
          position: { x: 23, y: 0 },
          size: { width: 22, height: 22 },
          styles: {
            backgroundColor: '#ffffff',
            borderRadius: '999px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }
        }
      ]
    }
  },

  // ===== SECTIONS =====
  {
    id: 'hero-section',
    name: 'Hero Section',
    category: 'Sections',
    description: 'Full hero with gradient background',
    thumbnail: '🌅',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 700, height: 360 },
      styles: {
        background: 'linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b)',
        borderRadius: '20px',
        padding: '64px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
      },
      children: [
        {
          id: 'hero-badge',
          type: 'div',
          content: 'New Release',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 26 },
          styles: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 12px',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.2)',
            fontSize: '12px',
            color: '#a5b4fc',
          }
        },
        {
          id: 'hero-title',
          type: 'text',
          content: 'Build beautiful interfaces',
          position: { x: 0, y: 36 },
          size: { width: 572, height: 48 },
          styles: { fontSize: '40px', fontWeight: '900', color: '#ffffff', lineHeight: '1.1' }
        },
        {
          id: 'hero-subtitle',
          type: 'text',
          content: 'Design, prototype, and ship with a library built on tokens and themes.',
          position: { x: 0, y: 96 },
          size: { width: 500, height: 24 },
          styles: { fontSize: '18px', color: '#a5b4fc', lineHeight: '1.5' }
        },
        {
          id: 'hero-cta1',
          type: 'button',
          content: 'Get Started',
          position: { x: 0, y: 140 },
          size: { width: 140, height: 44 },
          styles: { backgroundColor: '#6366f1', color: '#ffffff', borderRadius: '10px', fontSize: '15px', fontWeight: '700', border: 'none', padding: '12px 24px', cursor: 'pointer' }
        },
        {
          id: 'hero-cta2',
          type: 'button',
          content: 'Learn More',
          position: { x: 152, y: 140 },
          size: { width: 130, height: 44 },
          styles: { backgroundColor: 'transparent', color: '#a5b4fc', borderRadius: '10px', fontSize: '15px', fontWeight: '700', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 24px', cursor: 'pointer' }
        }
      ]
    }
  },
  {
    id: 'feature-grid',
    name: 'Feature Grid',
    category: 'Sections',
    description: '3-column feature showcase',
    thumbnail: '🏗️',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 700, height: 120 },
      styles: {
        display: 'flex',
        gap: '16px',
      },
      children: [
        {
          id: 'feat-1',
          type: 'div',
          content: '',
          position: { x: 0, y: 0 },
          size: { width: 222, height: 120 },
          styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px' },
          children: [
            { id: 'f1-title', type: 'text', content: 'Consistent', position: { x: 0, y: 0 }, size: { width: 174, height: 22 }, styles: { fontSize: '16px', fontWeight: '800', color: '#111827' } },
            { id: 'f1-desc', type: 'text', content: 'Tokens enforce the rules.', position: { x: 0, y: 28 }, size: { width: 174, height: 18 }, styles: { fontSize: '13px', color: '#6b7280' } },
          ]
        },
        {
          id: 'feat-2',
          type: 'div',
          content: '',
          position: { x: 238, y: 0 },
          size: { width: 222, height: 120 },
          styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px' },
          children: [
            { id: 'f2-title', type: 'text', content: 'Themeable', position: { x: 0, y: 0 }, size: { width: 174, height: 22 }, styles: { fontSize: '16px', fontWeight: '800', color: '#111827' } },
            { id: 'f2-desc', type: 'text', content: 'Swap palettes instantly.', position: { x: 0, y: 28 }, size: { width: 174, height: 18 }, styles: { fontSize: '13px', color: '#6b7280' } },
          ]
        },
        {
          id: 'feat-3',
          type: 'div',
          content: '',
          position: { x: 476, y: 0 },
          size: { width: 222, height: 120 },
          styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px' },
          children: [
            { id: 'f3-title', type: 'text', content: 'Composable', position: { x: 0, y: 0 }, size: { width: 174, height: 22 }, styles: { fontSize: '16px', fontWeight: '800', color: '#111827' } },
            { id: 'f3-desc', type: 'text', content: 'Sections become templates.', position: { x: 0, y: 28 }, size: { width: 174, height: 18 }, styles: { fontSize: '13px', color: '#6b7280' } },
          ]
        }
      ]
    }
  },
  {
    id: 'footer-section',
    name: 'Footer',
    category: 'Sections',
    description: 'Simple page footer',
    thumbnail: '🦶',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '© 2026 YourApp. All rights reserved.',
      position: { x: 50, y: 50 },
      size: { width: 700, height: 48 },
      styles: {
        padding: '16px 0',
        fontSize: '13px',
        color: '#6b7280',
        borderTop: '1px solid #e5e7eb',
      }
    }
  },

  // ===== TEMPLATES =====
  {
    id: 'tpl-settings',
    name: 'Settings Page',
    category: 'Templates',
    description: 'Sidebar + form settings layout',
    thumbnail: '⚙️',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 780, height: 420 },
      styles: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      },
      children: [
        // Header row
        {
          id: 'set-header',
          type: 'div',
          content: '',
          position: { x: 0, y: 0 },
          size: { width: 780, height: 60 },
          styles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
          children: [
            {
              id: 'set-title-wrap',
              type: 'div',
              content: '',
              position: { x: 0, y: 0 },
              size: { width: 400, height: 60 },
              styles: {},
              children: [
                { id: 'set-title', type: 'text', content: 'Settings', position: { x: 0, y: 0 }, size: { width: 400, height: 32 }, styles: { fontSize: '24px', fontWeight: '800', color: '#111827' } },
                { id: 'set-sub', type: 'text', content: 'Account, preferences, and security.', position: { x: 0, y: 36 }, size: { width: 400, height: 18 }, styles: { fontSize: '14px', color: '#6b7280' } },
              ]
            },
            { id: 'set-btn', type: 'button', content: 'Save', position: { x: 680, y: 10 }, size: { width: 80, height: 40 }, styles: { backgroundColor: '#1976d2', color: '#ffffff', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer', padding: '10px 20px' } },
          ]
        },
        // Content: sidebar + form
        {
          id: 'set-body',
          type: 'div',
          content: '',
          position: { x: 0, y: 80 },
          size: { width: 780, height: 320 },
          styles: { display: 'flex', gap: '20px' },
          children: [
            // Sidebar
            {
              id: 'set-sidebar',
              type: 'div',
              content: '',
              position: { x: 0, y: 0 },
              size: { width: 200, height: 220 },
              styles: { backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '12px' },
              children: [
                { id: 'sn-1', type: 'text', content: 'General', position: { x: 0, y: 0 }, size: { width: 176, height: 36 }, styles: { backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '8px 10px', fontSize: '14px', fontWeight: '700', color: '#111827' } },
                { id: 'sn-2', type: 'text', content: 'Security', position: { x: 0, y: 40 }, size: { width: 176, height: 36 }, styles: { padding: '8px 10px', fontSize: '14px', fontWeight: '700', color: '#6b7280' } },
                { id: 'sn-3', type: 'text', content: 'Billing', position: { x: 0, y: 80 }, size: { width: 176, height: 36 }, styles: { padding: '8px 10px', fontSize: '14px', fontWeight: '700', color: '#6b7280' } },
                { id: 'sn-4', type: 'text', content: 'Notifications', position: { x: 0, y: 120 }, size: { width: 176, height: 36 }, styles: { padding: '8px 10px', fontSize: '14px', fontWeight: '700', color: '#6b7280' } },
              ]
            },
            // Form card
            {
              id: 'set-form',
              type: 'div',
              content: '',
              position: { x: 220, y: 0 },
              size: { width: 540, height: 320 },
              styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
              children: [
                { id: 'sf-title', type: 'text', content: 'General', position: { x: 0, y: 0 }, size: { width: 492, height: 28 }, styles: { fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '16px' } },
                { id: 'sf-l1', type: 'text', content: 'Display name', position: { x: 0, y: 44 }, size: { width: 492, height: 16 }, styles: { fontSize: '13px', color: '#6b7280' } },
                { id: 'sf-i1', type: 'input', content: 'Zach', position: { x: 0, y: 66 }, size: { width: 492, height: 42 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#111827' } },
                { id: 'sf-l2', type: 'text', content: 'Email', position: { x: 0, y: 124 }, size: { width: 492, height: 16 }, styles: { fontSize: '13px', color: '#6b7280' } },
                { id: 'sf-i2', type: 'input', content: 'name@domain.com', position: { x: 0, y: 146 }, size: { width: 492, height: 42 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#111827' } },
                { id: 'sf-save', type: 'button', content: 'Save', position: { x: 0, y: 210 }, size: { width: 80, height: 40 }, styles: { backgroundColor: '#1976d2', color: '#ffffff', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer', padding: '10px 20px' } },
                { id: 'sf-cancel', type: 'button', content: 'Cancel', position: { x: 92, y: 210 }, size: { width: 80, height: 40 }, styles: { backgroundColor: '#ffffff', color: '#111827', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: '1px solid #e5e7eb', cursor: 'pointer', padding: '10px 20px' } },
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'tpl-analytics',
    name: 'Analytics Dashboard',
    category: 'Templates',
    description: 'KPI stats + chart placeholder',
    thumbnail: '📊',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 700, height: 460 },
      styles: { display: 'flex', flexDirection: 'column', gap: '20px' },
      children: [
        // Header
        {
          id: 'an-header',
          type: 'div',
          content: '',
          position: { x: 0, y: 0 },
          size: { width: 700, height: 50 },
          styles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
          children: [
            { id: 'an-title', type: 'text', content: 'Analytics', position: { x: 0, y: 0 }, size: { width: 300, height: 32 }, styles: { fontSize: '24px', fontWeight: '800', color: '#111827' } },
            { id: 'an-btn', type: 'button', content: 'Export', position: { x: 600, y: 0 }, size: { width: 80, height: 40 }, styles: { backgroundColor: '#1976d2', color: '#ffffff', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer', padding: '10px 20px' } },
          ]
        },
        // Stat cards row
        {
          id: 'an-stats',
          type: 'div',
          content: '',
          position: { x: 0, y: 70 },
          size: { width: 700, height: 100 },
          styles: { display: 'flex', gap: '16px' },
          children: [
            {
              id: 'an-s1', type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 222, height: 100 },
              styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
              children: [
                { id: 'as1-l', type: 'text', content: 'MRR', position: { x: 0, y: 0 }, size: { width: 182, height: 16 }, styles: { fontSize: '13px', color: '#6b7280' } },
                { id: 'as1-v', type: 'text', content: '$18.4k', position: { x: 0, y: 22 }, size: { width: 182, height: 32 }, styles: { fontSize: '28px', fontWeight: '800', color: '#111827' } },
              ]
            },
            {
              id: 'an-s2', type: 'div', content: '', position: { x: 238, y: 0 }, size: { width: 222, height: 100 },
              styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
              children: [
                { id: 'as2-l', type: 'text', content: 'Active users', position: { x: 0, y: 0 }, size: { width: 182, height: 16 }, styles: { fontSize: '13px', color: '#6b7280' } },
                { id: 'as2-v', type: 'text', content: '12,090', position: { x: 0, y: 22 }, size: { width: 182, height: 32 }, styles: { fontSize: '28px', fontWeight: '800', color: '#111827' } },
              ]
            },
            {
              id: 'an-s3', type: 'div', content: '', position: { x: 476, y: 0 }, size: { width: 222, height: 100 },
              styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
              children: [
                { id: 'as3-l', type: 'text', content: 'Conversion', position: { x: 0, y: 0 }, size: { width: 182, height: 16 }, styles: { fontSize: '13px', color: '#6b7280' } },
                { id: 'as3-v', type: 'text', content: '4.2%', position: { x: 0, y: 22 }, size: { width: 182, height: 32 }, styles: { fontSize: '28px', fontWeight: '800', color: '#111827' } },
              ]
            },
          ]
        },
        // Chart placeholder
        {
          id: 'an-chart',
          type: 'div',
          content: 'Chart placeholder',
          position: { x: 0, y: 190 },
          size: { width: 700, height: 260 },
          styles: {
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: '#9ca3af',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }
        }
      ]
    }
  },
  {
    id: 'tpl-error404',
    name: 'Error 404 Page',
    category: 'Templates',
    description: 'Not found page with CTA',
    thumbnail: '🚫',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 500, height: 280 },
      styles: {
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '20px',
        padding: '64px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      },
      children: [
        {
          id: '404-badge',
          type: 'div',
          content: '404',
          position: { x: 0, y: 0 },
          size: { width: 48, height: 26 },
          styles: { display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '999px', border: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280' }
        },
        { id: '404-title', type: 'text', content: 'Page not found', position: { x: 0, y: 36 }, size: { width: 372, height: 40 }, styles: { fontSize: '32px', fontWeight: '900', color: '#111827' } },
        { id: '404-desc', type: 'text', content: 'The link exists only in a parallel universe.', position: { x: 0, y: 84 }, size: { width: 372, height: 22 }, styles: { fontSize: '16px', color: '#6b7280' } },
        { id: '404-btn', type: 'button', content: 'Go home', position: { x: 0, y: 120 }, size: { width: 110, height: 42 }, styles: { backgroundColor: '#1976d2', color: '#ffffff', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer', padding: '12px 24px' } },
      ]
    }
  },
  {
    id: 'tpl-pricing',
    name: 'Pricing Cards',
    category: 'Templates',
    description: '3-tier pricing comparison',
    thumbnail: '💰',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 720, height: 300 },
      styles: { display: 'flex', gap: '16px' },
      children: [
        {
          id: 'pr-1', type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 228, height: 300 },
          styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '12px' },
          children: [
            { id: 'pr1-name', type: 'text', content: 'Free', position: { x: 0, y: 0 }, size: { width: 172, height: 20 }, styles: { fontSize: '14px', fontWeight: '700', color: '#6b7280' } },
            { id: 'pr1-price', type: 'text', content: '$0', position: { x: 0, y: 24 }, size: { width: 172, height: 36 }, styles: { fontSize: '32px', fontWeight: '900', color: '#111827' } },
            { id: 'pr1-desc', type: 'text', content: 'For individuals getting started.', position: { x: 0, y: 68 }, size: { width: 172, height: 32 }, styles: { fontSize: '13px', color: '#6b7280', lineHeight: '1.4' } },
            { id: 'pr1-btn', type: 'button', content: 'Get Started', position: { x: 0, y: 116 }, size: { width: 172, height: 40 }, styles: { backgroundColor: '#ffffff', color: '#111827', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: '1px solid #e5e7eb', cursor: 'pointer', padding: '10px' } },
          ]
        },
        {
          id: 'pr-2', type: 'div', content: '', position: { x: 244, y: 0 }, size: { width: 228, height: 300 },
          styles: { backgroundColor: '#1976d2', border: '1px solid #1565c0', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 8px 24px rgba(25,118,210,0.25)' },
          children: [
            { id: 'pr2-name', type: 'text', content: 'Pro', position: { x: 0, y: 0 }, size: { width: 172, height: 20 }, styles: { fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.7)' } },
            { id: 'pr2-price', type: 'text', content: '$29', position: { x: 0, y: 24 }, size: { width: 172, height: 36 }, styles: { fontSize: '32px', fontWeight: '900', color: '#ffffff' } },
            { id: 'pr2-desc', type: 'text', content: 'For growing teams and projects.', position: { x: 0, y: 68 }, size: { width: 172, height: 32 }, styles: { fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' } },
            { id: 'pr2-btn', type: 'button', content: 'Upgrade', position: { x: 0, y: 116 }, size: { width: 172, height: 40 }, styles: { backgroundColor: '#ffffff', color: '#1976d2', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer', padding: '10px' } },
          ]
        },
        {
          id: 'pr-3', type: 'div', content: '', position: { x: 488, y: 0 }, size: { width: 228, height: 300 },
          styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '12px' },
          children: [
            { id: 'pr3-name', type: 'text', content: 'Enterprise', position: { x: 0, y: 0 }, size: { width: 172, height: 20 }, styles: { fontSize: '14px', fontWeight: '700', color: '#6b7280' } },
            { id: 'pr3-price', type: 'text', content: 'Custom', position: { x: 0, y: 24 }, size: { width: 172, height: 36 }, styles: { fontSize: '32px', fontWeight: '900', color: '#111827' } },
            { id: 'pr3-desc', type: 'text', content: 'For large orgs. Custom everything.', position: { x: 0, y: 68 }, size: { width: 172, height: 32 }, styles: { fontSize: '13px', color: '#6b7280', lineHeight: '1.4' } },
            { id: 'pr3-btn', type: 'button', content: 'Contact Sales', position: { x: 0, y: 116 }, size: { width: 172, height: 40 }, styles: { backgroundColor: '#ffffff', color: '#111827', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: '1px solid #e5e7eb', cursor: 'pointer', padding: '10px' } },
          ]
        }
      ]
    }
  },
  {
    id: 'tpl-checkout',
    name: 'Checkout Page',
    category: 'Templates',
    description: 'Two-column checkout with order summary',
    thumbnail: '🛒',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 780, height: 380 },
      styles: { display: 'flex', flexDirection: 'column', gap: '20px' },
      children: [
        {
          id: 'ck-header', type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 780, height: 50 },
          styles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
          children: [
            { id: 'ck-title', type: 'text', content: 'Checkout', position: { x: 0, y: 0 }, size: { width: 300, height: 32 }, styles: { fontSize: '24px', fontWeight: '800', color: '#111827' } },
          ]
        },
        {
          id: 'ck-body', type: 'div', content: '', position: { x: 0, y: 70 }, size: { width: 780, height: 300 },
          styles: { display: 'flex', gap: '20px' },
          children: [
            {
              id: 'ck-form', type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 460, height: 300 },
              styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '12px' },
              children: [
                { id: 'ck-f-title', type: 'text', content: 'Shipping', position: { x: 0, y: 0 }, size: { width: 412, height: 24 }, styles: { fontSize: '18px', fontWeight: '800', color: '#111827' } },
                {
                  id: 'ck-name-row', type: 'div', content: '', position: { x: 0, y: 36 }, size: { width: 412, height: 42 },
                  styles: { display: 'flex', gap: '12px' },
                  children: [
                    { id: 'ck-fn', type: 'input', content: 'First name', position: { x: 0, y: 0 }, size: { width: 200, height: 42 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#9ca3af' } },
                    { id: 'ck-ln', type: 'input', content: 'Last name', position: { x: 212, y: 0 }, size: { width: 200, height: 42 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#9ca3af' } },
                  ]
                },
                { id: 'ck-addr', type: 'input', content: 'Address', position: { x: 0, y: 90 }, size: { width: 412, height: 42 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#9ca3af' } },
                { id: 'ck-pay', type: 'button', content: 'Pay', position: { x: 0, y: 146 }, size: { width: 100, height: 42 }, styles: { backgroundColor: '#1976d2', color: '#ffffff', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer', padding: '12px 24px' } },
              ]
            },
            {
              id: 'ck-summary', type: 'div', content: '', position: { x: 480, y: 0 }, size: { width: 280, height: 200 },
              styles: { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' },
              children: [
                { id: 'ck-s-title', type: 'text', content: 'Order', position: { x: 0, y: 0 }, size: { width: 232, height: 24 }, styles: { fontSize: '18px', fontWeight: '800', color: '#111827' } },
                { id: 'ck-item1', type: 'text', content: 'Tokenized Hoodie — $49', position: { x: 0, y: 36 }, size: { width: 232, height: 18 }, styles: { fontSize: '14px', color: '#111827' } },
                { id: 'ck-item2', type: 'text', content: 'Shipping — $5', position: { x: 0, y: 60 }, size: { width: 232, height: 18 }, styles: { fontSize: '14px', color: '#6b7280' } },
                { id: 'ck-total', type: 'text', content: 'Total: $54', position: { x: 0, y: 90 }, size: { width: 232, height: 22 }, styles: { fontSize: '16px', fontWeight: '800', color: '#111827', borderTop: '1px solid #e5e7eb', paddingTop: '12px' } },
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'tpl-ecommerce',
    name: 'Product Page',
    category: 'Templates',
    description: 'E-commerce product detail page',
    thumbnail: '🛍️',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 720, height: 400 },
      styles: { display: 'flex', gap: '20px' },
      children: [
        {
          id: 'ec-image', type: 'div', content: 'Product image', position: { x: 0, y: 0 }, size: { width: 350, height: 400 },
          styles: { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#9ca3af' }
        },
        {
          id: 'ec-details', type: 'div', content: '', position: { x: 370, y: 0 }, size: { width: 350, height: 400 },
          styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
          children: [
            { id: 'ec-name', type: 'text', content: 'Tokenized Hoodie', position: { x: 0, y: 0 }, size: { width: 294, height: 28 }, styles: { fontSize: '22px', fontWeight: '800', color: '#111827' } },
            { id: 'ec-desc', type: 'text', content: 'Soft. Consistent. Surprisingly defensible in code review.', position: { x: 0, y: 34 }, size: { width: 294, height: 36 }, styles: { fontSize: '14px', color: '#6b7280', lineHeight: '1.4' } },
            {
              id: 'ec-badges', type: 'div', content: '', position: { x: 0, y: 80 }, size: { width: 294, height: 28 },
              styles: { display: 'flex', gap: '8px' },
              children: [
                { id: 'ec-price', type: 'div', content: '$49', position: { x: 0, y: 0 }, size: { width: 48, height: 26 }, styles: { display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '999px', border: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280' } },
                { id: 'ec-stock', type: 'div', content: 'In stock', position: { x: 56, y: 0 }, size: { width: 70, height: 26 }, styles: { display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '999px', border: '1px solid #86efac', fontSize: '12px', color: '#166534' } },
              ]
            },
            { id: 'ec-cart', type: 'button', content: 'Add to cart', position: { x: 0, y: 120 }, size: { width: 130, height: 42 }, styles: { backgroundColor: '#1976d2', color: '#ffffff', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer', padding: '12px 24px' } },
            { id: 'ec-wish', type: 'button', content: 'Wishlist', position: { x: 142, y: 120 }, size: { width: 100, height: 42 }, styles: { backgroundColor: '#ffffff', color: '#111827', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: '1px solid #e5e7eb', cursor: 'pointer', padding: '12px 20px' } },
          ]
        }
      ]
    }
  },
  {
    id: 'tpl-kanban',
    name: 'Kanban Board',
    category: 'Templates',
    description: 'Three-column task board',
    thumbnail: '📌',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 720, height: 340 },
      styles: { display: 'flex', flexDirection: 'column', gap: '20px' },
      children: [
        { id: 'kb-title', type: 'text', content: 'Kanban', position: { x: 0, y: 0 }, size: { width: 300, height: 32 }, styles: { fontSize: '24px', fontWeight: '800', color: '#111827' } },
        {
          id: 'kb-cols', type: 'div', content: '', position: { x: 0, y: 52 }, size: { width: 720, height: 280 },
          styles: { display: 'flex', gap: '16px' },
          children: [
            {
              id: 'kb-todo', type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 228, height: 280 },
              styles: { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
              children: [
                { id: 'kb-t-h', type: 'text', content: 'To do', position: { x: 0, y: 0 }, size: { width: 196, height: 22 }, styles: { fontSize: '15px', fontWeight: '800', color: '#111827' } },
                { id: 'kb-t-1', type: 'div', content: 'Create token map', position: { x: 0, y: 32 }, size: { width: 196, height: 48 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px', fontSize: '14px', color: '#111827', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } },
                { id: 'kb-t-2', type: 'div', content: 'Add icon pack', position: { x: 0, y: 90 }, size: { width: 196, height: 48 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px', fontSize: '14px', color: '#111827', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } },
              ]
            },
            {
              id: 'kb-doing', type: 'div', content: '', position: { x: 244, y: 0 }, size: { width: 228, height: 280 },
              styles: { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
              children: [
                { id: 'kb-d-h', type: 'text', content: 'Doing', position: { x: 0, y: 0 }, size: { width: 196, height: 22 }, styles: { fontSize: '15px', fontWeight: '800', color: '#111827' } },
                { id: 'kb-d-1', type: 'div', content: 'Template archetypes', position: { x: 0, y: 32 }, size: { width: 196, height: 48 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px', fontSize: '14px', color: '#111827', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } },
              ]
            },
            {
              id: 'kb-done', type: 'div', content: '', position: { x: 488, y: 0 }, size: { width: 228, height: 280 },
              styles: { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
              children: [
                { id: 'kb-dn-h', type: 'text', content: 'Done', position: { x: 0, y: 0 }, size: { width: 196, height: 22 }, styles: { fontSize: '15px', fontWeight: '800', color: '#111827' } },
                { id: 'kb-dn-1', type: 'div', content: 'Palettes', position: { x: 0, y: 32 }, size: { width: 196, height: 48 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px', fontSize: '14px', color: '#111827', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } },
                { id: 'kb-dn-2', type: 'div', content: 'Base components', position: { x: 0, y: 90 }, size: { width: 196, height: 48 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px', fontSize: '14px', color: '#111827', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } },
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'tpl-docs',
    name: 'Docs Page',
    category: 'Templates',
    description: 'Documentation sidebar + content layout',
    thumbnail: '📖',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 780, height: 360 },
      styles: { display: 'flex', flexDirection: 'column', gap: '20px' },
      children: [
        { id: 'doc-title', type: 'text', content: 'Docs', position: { x: 0, y: 0 }, size: { width: 300, height: 32 }, styles: { fontSize: '24px', fontWeight: '800', color: '#111827' } },
        {
          id: 'doc-body', type: 'div', content: '', position: { x: 0, y: 52 }, size: { width: 780, height: 300 },
          styles: { display: 'flex', gap: '20px' },
          children: [
            {
              id: 'doc-sidebar', type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 200, height: 260 },
              styles: { backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '12px' },
              children: [
                { id: 'ds-1', type: 'text', content: 'Getting started', position: { x: 0, y: 0 }, size: { width: 176, height: 36 }, styles: { backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '8px 10px', fontSize: '14px', fontWeight: '700', color: '#111827' } },
                { id: 'ds-2', type: 'text', content: 'Tokens', position: { x: 0, y: 40 }, size: { width: 176, height: 36 }, styles: { padding: '8px 10px', fontSize: '14px', fontWeight: '700', color: '#6b7280' } },
                { id: 'ds-3', type: 'text', content: 'Themes', position: { x: 0, y: 80 }, size: { width: 176, height: 36 }, styles: { padding: '8px 10px', fontSize: '14px', fontWeight: '700', color: '#6b7280' } },
                { id: 'ds-4', type: 'text', content: 'Components', position: { x: 0, y: 120 }, size: { width: 176, height: 36 }, styles: { padding: '8px 10px', fontSize: '14px', fontWeight: '700', color: '#6b7280' } },
                { id: 'ds-5', type: 'text', content: 'Templates', position: { x: 0, y: 160 }, size: { width: 176, height: 36 }, styles: { padding: '8px 10px', fontSize: '14px', fontWeight: '700', color: '#6b7280' } },
              ]
            },
            {
              id: 'doc-content', type: 'div', content: '', position: { x: 220, y: 0 }, size: { width: 540, height: 300 },
              styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '12px' },
              children: [
                { id: 'dc-h', type: 'text', content: 'Getting started', position: { x: 0, y: 0 }, size: { width: 484, height: 28 }, styles: { fontSize: '20px', fontWeight: '800', color: '#111827' } },
                { id: 'dc-p', type: 'text', content: 'Include tokens.css + a palette, then set data-theme on your body element.', position: { x: 0, y: 36 }, size: { width: 484, height: 36 }, styles: { fontSize: '14px', color: '#6b7280', lineHeight: '1.5' } },
                { id: 'dc-code', type: 'div', content: '<link rel="stylesheet" href="tokens.css">\n<link rel="stylesheet" href="palettes/aurora_dark.css">\n<body data-theme="aurora_dark">', position: { x: 0, y: 84 }, size: { width: 484, height: 80 }, styles: { backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: '#111827', whiteSpace: 'pre', border: '1px solid #e5e7eb' } },
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'tpl-contact',
    name: 'Contact Page',
    category: 'Templates',
    description: 'Contact form + info two-column layout',
    thumbnail: '📧',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 720, height: 360 },
      styles: { display: 'flex', flexDirection: 'column', gap: '20px' },
      children: [
        { id: 'ct-title', type: 'text', content: 'Contact', position: { x: 0, y: 0 }, size: { width: 300, height: 32 }, styles: { fontSize: '24px', fontWeight: '800', color: '#111827' } },
        {
          id: 'ct-body', type: 'div', content: '', position: { x: 0, y: 52 }, size: { width: 720, height: 300 },
          styles: { display: 'flex', gap: '20px' },
          children: [
            {
              id: 'ct-form', type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 420, height: 300 },
              styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '12px' },
              children: [
                { id: 'ct-f-h', type: 'text', content: 'Send a message', position: { x: 0, y: 0 }, size: { width: 372, height: 24 }, styles: { fontSize: '18px', fontWeight: '800', color: '#111827' } },
                { id: 'ct-name', type: 'input', content: 'Your name', position: { x: 0, y: 36 }, size: { width: 372, height: 42 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#9ca3af' } },
                { id: 'ct-email', type: 'input', content: 'Email', position: { x: 0, y: 90 }, size: { width: 372, height: 42 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#9ca3af' } },
                { id: 'ct-msg', type: 'input', content: 'What are we building?', position: { x: 0, y: 144 }, size: { width: 372, height: 80 }, styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#9ca3af' } },
                { id: 'ct-send', type: 'button', content: 'Send', position: { x: 0, y: 236 }, size: { width: 80, height: 40 }, styles: { backgroundColor: '#1976d2', color: '#ffffff', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer', padding: '10px 20px' } },
              ]
            },
            {
              id: 'ct-info', type: 'div', content: '', position: { x: 440, y: 0 }, size: { width: 280, height: 160 },
              styles: { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' },
              children: [
                { id: 'ct-i-h', type: 'text', content: 'Info', position: { x: 0, y: 0 }, size: { width: 232, height: 24 }, styles: { fontSize: '18px', fontWeight: '800', color: '#111827' } },
                { id: 'ct-i-email', type: 'text', content: 'support@yourapp.com', position: { x: 0, y: 36 }, size: { width: 232, height: 18 }, styles: { fontSize: '14px', color: '#6b7280' } },
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'tpl-maintenance',
    name: 'Maintenance Page',
    category: 'Templates',
    description: 'Maintenance / coming soon page',
    thumbnail: '🔧',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 500, height: 240 },
      styles: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '20px',
        padding: '64px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      },
      children: [
        { id: 'mt-badge', type: 'div', content: 'Maintenance', position: { x: 0, y: 0 }, size: { width: 100, height: 26 }, styles: { display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '999px', border: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280' } },
        { id: 'mt-title', type: 'text', content: "We're polishing the gears", position: { x: 0, y: 36 }, size: { width: 372, height: 40 }, styles: { fontSize: '32px', fontWeight: '900', color: '#111827' } },
        { id: 'mt-desc', type: 'text', content: 'Back soon. Probably before your coffee gets cold.', position: { x: 0, y: 84 }, size: { width: 372, height: 22 }, styles: { fontSize: '16px', color: '#6b7280' } },
      ]
    }
  },
  {
    id: 'tpl-faq',
    name: 'FAQ Page',
    category: 'Templates',
    description: 'Header + accordion FAQ layout',
    thumbnail: '❓',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 600, height: 300 },
      styles: { display: 'flex', flexDirection: 'column', gap: '20px' },
      children: [
        {
          id: 'fq-header', type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 600, height: 50 },
          styles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
          children: [
            { id: 'fq-title', type: 'text', content: 'FAQ', position: { x: 0, y: 0 }, size: { width: 200, height: 32 }, styles: { fontSize: '24px', fontWeight: '800', color: '#111827' } },
          ]
        },
        {
          id: 'fq-acc', type: 'div', content: '', position: { x: 0, y: 70 }, size: { width: 600, height: 216 },
          styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden' },
          children: [
            {
              id: 'fq-i1', type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 600, height: 72 },
              styles: { borderBottom: '1px solid #e5e7eb', padding: '16px 20px' },
              children: [
                { id: 'fq-q1', type: 'text', content: 'Do I own these files?', position: { x: 0, y: 0 }, size: { width: 560, height: 20 }, styles: { fontWeight: '800', fontSize: '14px', color: '#111827' } },
                { id: 'fq-a1', type: 'text', content: 'Bucket 1: yes. Bucket 2: follow licenses.', position: { x: 0, y: 26 }, size: { width: 560, height: 18 }, styles: { fontSize: '13px', color: '#6b7280' } },
              ]
            },
            {
              id: 'fq-i2', type: 'div', content: '', position: { x: 0, y: 72 }, size: { width: 600, height: 72 },
              styles: { borderBottom: '1px solid #e5e7eb', padding: '16px 20px' },
              children: [
                { id: 'fq-q2', type: 'text', content: 'Can I theme everything?', position: { x: 0, y: 0 }, size: { width: 560, height: 20 }, styles: { fontWeight: '800', fontSize: '14px', color: '#111827' } },
                { id: 'fq-a2', type: 'text', content: 'Yep. Palettes override semantic tokens.', position: { x: 0, y: 26 }, size: { width: 560, height: 18 }, styles: { fontSize: '13px', color: '#6b7280' } },
              ]
            },
            {
              id: 'fq-i3', type: 'div', content: '', position: { x: 0, y: 144 }, size: { width: 600, height: 72 },
              styles: { padding: '16px 20px' },
              children: [
                { id: 'fq-q3', type: 'text', content: 'Vanilla or Tailwind?', position: { x: 0, y: 0 }, size: { width: 560, height: 20 }, styles: { fontWeight: '800', fontSize: '14px', color: '#111827' } },
                { id: 'fq-a3', type: 'text', content: 'Both.', position: { x: 0, y: 26 }, size: { width: 560, height: 18 }, styles: { fontSize: '13px', color: '#6b7280' } },
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'tpl-profile',
    name: 'Profile Page',
    category: 'Templates',
    description: 'Profile card with stats sidebar',
    thumbnail: '👤',
    component: {
      id: 'comp-' + Date.now(),
      type: 'div',
      content: '',
      position: { x: 50, y: 50 },
      size: { width: 720, height: 280 },
      styles: { display: 'flex', flexDirection: 'column', gap: '20px' },
      children: [
        { id: 'pf-title', type: 'text', content: 'Profile', position: { x: 0, y: 0 }, size: { width: 300, height: 32 }, styles: { fontSize: '24px', fontWeight: '800', color: '#111827' } },
        {
          id: 'pf-body', type: 'div', content: '', position: { x: 0, y: 52 }, size: { width: 720, height: 220 },
          styles: { display: 'flex', gap: '20px' },
          children: [
            {
              id: 'pf-card', type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 400, height: 220 },
              styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '14px' },
              children: [
                {
                  id: 'pf-row', type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 352, height: 56 },
                  styles: { display: 'flex', gap: '14px', alignItems: 'center' },
                  children: [
                    { id: 'pf-avatar', type: 'div', content: 'ZE', position: { x: 0, y: 0 }, size: { width: 56, height: 56 }, styles: { backgroundColor: '#e5e7eb', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#6b7280' } },
                    {
                      id: 'pf-info', type: 'div', content: '', position: { x: 70, y: 0 }, size: { width: 268, height: 56 },
                      styles: {},
                      children: [
                        { id: 'pf-name', type: 'text', content: 'Zach Edgin', position: { x: 0, y: 0 }, size: { width: 268, height: 24 }, styles: { fontSize: '20px', fontWeight: '900', color: '#111827' } },
                        { id: 'pf-role', type: 'text', content: 'Builder • QA • Imagineer', position: { x: 0, y: 28 }, size: { width: 268, height: 18 }, styles: { fontSize: '13px', color: '#6b7280' } },
                      ]
                    }
                  ]
                },
                { id: 'pf-bio', type: 'text', content: 'Short bio goes here. Keep it crisp, keep it human.', position: { x: 0, y: 80 }, size: { width: 352, height: 18 }, styles: { fontSize: '14px', color: '#6b7280' } },
              ]
            },
            {
              id: 'pf-stats', type: 'div', content: '', position: { x: 420, y: 0 }, size: { width: 300, height: 220 },
              styles: { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' },
              children: [
                { id: 'pfs-h', type: 'text', content: 'Stats', position: { x: 0, y: 0 }, size: { width: 252, height: 24 }, styles: { fontSize: '18px', fontWeight: '800', color: '#111827' } },
                {
                  id: 'pfs-grid', type: 'div', content: '', position: { x: 0, y: 38 }, size: { width: 252, height: 80 },
                  styles: { display: 'flex', gap: '12px' },
                  children: [
                    {
                      id: 'pfs-1', type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 120, height: 80 },
                      styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px' },
                      children: [
                        { id: 'pfs1-l', type: 'text', content: 'Projects', position: { x: 0, y: 0 }, size: { width: 92, height: 16 }, styles: { fontSize: '12px', color: '#6b7280' } },
                        { id: 'pfs1-v', type: 'text', content: '18', position: { x: 0, y: 20 }, size: { width: 92, height: 28 }, styles: { fontSize: '24px', fontWeight: '800', color: '#111827' } },
                      ]
                    },
                    {
                      id: 'pfs-2', type: 'div', content: '', position: { x: 132, y: 0 }, size: { width: 120, height: 80 },
                      styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px' },
                      children: [
                        { id: 'pfs2-l', type: 'text', content: 'Exports', position: { x: 0, y: 0 }, size: { width: 92, height: 16 }, styles: { fontSize: '12px', color: '#6b7280' } },
                        { id: 'pfs2-v', type: 'text', content: '2.1k', position: { x: 0, y: 20 }, size: { width: 92, height: 28 }, styles: { fontSize: '24px', fontWeight: '800', color: '#111827' } },
                      ]
                    }
                  ]
                },
                {
                  id: 'pfs-bar', type: 'div', content: '', position: { x: 0, y: 132 }, size: { width: 252, height: 10 },
                  styles: { backgroundColor: '#e5e7eb', borderRadius: '999px', overflow: 'hidden', border: '1px solid #d1d5db' },
                  children: [
                    { id: 'pfs-fill', type: 'div', content: '', position: { x: 0, y: 0 }, size: { width: 182, height: 10 }, styles: { background: 'linear-gradient(90deg, #1976d2, #0f9d8a)', borderRadius: '999px' } }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
];

