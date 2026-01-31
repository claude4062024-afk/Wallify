// App-wide constants
// Following Skill.md standards: All constants in one place

// API Endpoints
export const API_ENDPOINTS = {
  SCRAPER_SERVICE: import.meta.env.VITE_SCRAPER_SERVICE_URL || 'http://localhost:3001',
  OPENAI: 'https://api.openai.com/v1',
} as const

// Rate Limits (per Skill.md Security Standards)
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5,
  LOGIN_WINDOW_MINUTES: 15,
  API_CALLS_PER_MINUTE: 100,
  WIDGET_EMBEDS_PER_HOUR: 1000,
  FILE_UPLOADS_PER_HOUR: 10,
} as const

// Testimonial Quality Thresholds
export const QUALITY_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.5,
  LOW: 0.3,
} as const

// Widget Configuration Defaults
export const WIDGET_DEFAULTS = {
  ITEMS_PER_PAGE: 10,
  ANIMATION_SPEED: 300,
  AUTOPLAY_INTERVAL: 5000,
} as const

// Supported Social Platforms
export const SOCIAL_PLATFORMS = {
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  G2: 'g2',
  PRODUCTHUNT: 'producthunt',
  CAPTERRA: 'capterra',
  TRUSTPILOT: 'trustpilot',
} as const

export type SocialPlatform = typeof SOCIAL_PLATFORMS[keyof typeof SOCIAL_PLATFORMS]

// Testimonial Sources
export const TESTIMONIAL_SOURCES = [
  'direct',
  'twitter',
  'linkedin',
  'g2',
  'video',
  'email',
] as const

export type TestimonialSource = typeof TESTIMONIAL_SOURCES[number]

// Theme Colors (matching Tailwind config)
export const THEME_COLORS = {
  primary: '#f59e0b', // amber-500
  primaryHover: '#d97706', // amber-600
  success: '#22c55e', // green-500
  error: '#ef4444', // red-500
  warning: '#f97316', // orange-500
} as const

// Font Families for Site Builder
export const FONT_FAMILIES = [
  { id: 'inter', name: 'Inter', value: 'Inter, sans-serif' },
  { id: 'roboto', name: 'Roboto', value: 'Roboto, sans-serif' },
  { id: 'poppins', name: 'Poppins', value: 'Poppins, sans-serif' },
  { id: 'playfair', name: 'Playfair Display', value: 'Playfair Display, serif' },
] as const

// Layout Types for Generated Sites
export const LAYOUT_TYPES = [
  { id: 'grid', name: 'Grid', description: 'Responsive grid layout' },
  { id: 'masonry', name: 'Masonry', description: 'Pinterest-style masonry' },
  { id: 'carousel', name: 'Carousel', description: 'Horizontal carousel' },
  { id: 'list', name: 'List', description: 'Vertical list view' },
] as const

// Spam Keywords for Filtering (per Skill.md Anti-Spam)
export const SPAM_KEYWORDS = [
  'click here',
  'dm me',
  'check bio',
  'link in bio',
  'free money',
  'crypto',
  'nft',
] as const

// Maximum Content Lengths
export const MAX_LENGTHS = {
  TESTIMONIAL_TEXT: 2000,
  AUTHOR_NAME: 100,
  AUTHOR_TITLE: 100,
  AUTHOR_COMPANY: 100,
  WIDGET_NAME: 50,
  PROJECT_NAME: 100,
} as const

// CDN URLs
export const CDN_URLS = {
  WIDGET_SCRIPT: import.meta.env.VITE_WIDGET_CDN_URL || 'https://cdn.wallify.io/widget.js',
} as const

// OpenAI Models
export const OPENAI_MODELS = {
  GPT4O: 'gpt-4o',
  WHISPER: 'whisper-1',
} as const

// Supabase Storage Buckets
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  TESTIMONIALS: 'testimonials',
  VIDEOS: 'videos',
  SITE_ASSETS: 'site-assets',
} as const
