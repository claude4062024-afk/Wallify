/**
 * Theme Configuration System
 * Maps theme settings to CSS variables and font imports
 */

import type { SiteConfig } from './supabase';

export interface ThemeStyles {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontImport: string | null;
  borderRadius: string;
  cardShadow: string;
}

// Font configurations with Google Fonts imports
const FONT_CONFIGS: Record<string, { family: string; import: string | null }> = {
  inter: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
  roboto: {
    family: "'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
    import: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  },
  poppins: {
    family: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
    import: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  },
  playfair: {
    family: "'Playfair Display', Georgia, serif",
    import: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
  },
  system: {
    family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    import: null,
  },
};

/**
 * Generate theme styles from site configuration
 */
export function generateThemeStyles(config: SiteConfig): ThemeStyles {
  const fontConfig = FONT_CONFIGS[config.font_family] || FONT_CONFIGS.system;

  return {
    primaryColor: config.primary_color || '#f59e0b',
    secondaryColor: config.secondary_color || '#78716c',
    fontFamily: fontConfig.family,
    fontImport: fontConfig.import,
    borderRadius: '12px',
    cardShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  };
}

/**
 * Generate CSS variables string for the theme
 */
export function generateCSSVariables(theme: ThemeStyles): string {
  return `
    :root {
      --color-primary: ${theme.primaryColor};
      --color-secondary: ${theme.secondaryColor};
      --font-family: ${theme.fontFamily};
      --border-radius: ${theme.borderRadius};
      --card-shadow: ${theme.cardShadow};
    }
  `;
}

/**
 * Generate complete theme CSS including custom CSS
 */
export function generateFullThemeCSS(config: SiteConfig): string {
  const theme = generateThemeStyles(config);
  const variables = generateCSSVariables(theme);
  const customCSS = config.custom_css || '';

  return `
    ${variables}
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: var(--font-family);
      line-height: 1.6;
      color: #1c1917;
      background-color: #fafaf9;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    ${customCSS}
  `;
}

/**
 * Get structured data (JSON-LD) for SEO
 */
export function generateStructuredData(
  config: SiteConfig,
  testimonials: { author_name: string; content_text: string | null; rating: number | null }[]
): string {
  const reviews = testimonials.slice(0, 10).map((t) => ({
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Organization',
      name: config.company_name,
    },
    author: {
      '@type': 'Person',
      name: t.author_name,
    },
    reviewBody: t.content_text || '',
    reviewRating: t.rating
      ? {
          '@type': 'Rating',
          ratingValue: t.rating,
          bestRating: 5,
        }
      : undefined,
  }));

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${config.company_name} Customer Reviews`,
    itemListElement: reviews.map((review, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: review,
    })),
  };

  return JSON.stringify(structuredData);
}
