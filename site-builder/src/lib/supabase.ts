/**
 * Supabase Client for Site Builder
 * Fetches testimonials and site configuration for static generation
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if credentials are available
const hasCredentials = supabaseUrl && supabaseKey;

if (!hasCredentials) {
  console.warn('[Site Builder] Supabase credentials not configured - using mock data');
}

// Only create client if credentials exist
export const supabase = hasCredentials 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface Testimonial {
  id: string;
  content_text: string | null;
  media_url: string | null;
  media_type: 'video' | 'image' | 'none' | null;
  author_name: string;
  author_title: string | null;
  author_company: string | null;
  author_avatar: string | null;
  rating: number | null;
  quality_score: number | null;
  tags: string[];
  created_at: string;
}

export interface SiteConfig {
  id: string;
  project_id: string;
  slug: string;
  company_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string | null;
  font_family: 'inter' | 'roboto' | 'poppins' | 'playfair' | 'system';
  layout: 'grid' | 'masonry' | 'carousel' | 'list' | 'physics' | 'labs';
  show_header: boolean;
  show_footer: boolean;
  header_text: string | null;
  footer_text: string | null;
  custom_css: string | null;
  custom_domain: string | null;
  subdomain: string | null;
  page_path: string; // e.g., 'wall', 'love', 'testimonials'
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
}

/**
 * Fetch all active customer sites for static generation
 */
export async function getAllActiveSites(): Promise<SiteConfig[]> {
  // Return mock data if no database connection
  if (!supabase) {
    console.log('[Site Builder] Using mock site data');
    return getMockSites();
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching sites:', error);
    return getMockSites();
  }

  return data || [];
}

/**
 * Fetch site configuration by project ID (for isolated tenant builds)
 */
export async function getSiteByProjectId(projectId: string): Promise<SiteConfig | null> {
  if (!supabase) {
    console.log('[Site Builder] Using mock site data for project:', projectId);
    const mockSites = getMockSites();
    // For mock data, return first mock site if projectId matches 'demo' or similar
    return mockSites.length > 0 ? mockSites[0] : null;
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error(`[Site Builder] Error fetching site for project ${projectId}:`, error);
    return null;
  }

  return data;
}

/**
 * Fetch site configuration by slug
 */
export async function getSiteBySlug(slug: string): Promise<SiteConfig | null> {
  if (!supabase) {
    const mockSites = getMockSites();
    return mockSites.find(s => s.slug === slug) || null;
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching site:', error);
    return null;
  }

  return data;
}

/**
 * Fetch approved testimonials for a project
 */
export async function getTestimonials(projectId: string): Promise<Testimonial[]> {
  if (!supabase) {
    return getMockTestimonials();
  }

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'approved')
    .order('quality_score', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }

  return data || [];
}

/**
 * Get testimonials with specific tags
 */
export async function getTestimonialsByTag(
  projectId: string,
  tag: string
): Promise<Testimonial[]> {
  if (!supabase) {
    return getMockTestimonials().filter(t => t.tags.includes(tag));
  }

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'approved')
    .contains('tags', [tag])
    .order('quality_score', { ascending: false });

  if (error) {
    console.error('Error fetching testimonials by tag:', error);
    return [];
  }

  return data || [];
}

// ============ Mock Data for Development ============

function getMockSites(): SiteConfig[] {
  return [
    {
      id: 'mock-site-1',
      project_id: 'mock-project-1',
      slug: 'demo',
      company_name: 'Demo Company',
      logo_url: null,
      primary_color: '#f59e0b',
      secondary_color: '#78716c',
      font_family: 'inter',
      layout: 'labs',
      show_header: true,
      show_footer: true,
      header_text: null,
      footer_text: null,
      custom_css: null,
      custom_domain: null,
      meta_title: 'Customer Stories | Demo Company',
      meta_description: 'See what our customers are saying about Demo Company',
      og_image: null,
    },
  ];
}

function getMockTestimonials(): Testimonial[] {
  return [
    {
      id: 'mock-testimonial-1',
      content_text: 'This product has completely transformed how our team works. We saved over 20 hours per week on manual tasks. The ROI was visible within the first month.',
      media_url: null,
      media_type: null,
      author_name: 'Sarah Johnson',
      author_title: 'VP of Operations',
      author_company: 'TechCorp',
      author_avatar: null,
      rating: 5,
      quality_score: 0.92,
      tags: ['productivity', 'automation', 'roi'],
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-testimonial-2',
      content_text: 'As a startup founder, I need tools that scale with us. This solution has grown with our company from 10 to 200 employees without missing a beat.',
      media_url: null,
      media_type: null,
      author_name: 'Mike Chen',
      author_title: 'CEO & Founder',
      author_company: 'GrowthStartup',
      author_avatar: null,
      rating: 5,
      quality_score: 0.88,
      tags: ['scalability', 'startup'],
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-testimonial-3',
      content_text: 'The customer support team is incredible. They helped us customize the platform to fit our unique workflow. Highly recommend!',
      media_url: null,
      media_type: null,
      author_name: 'Emily Rodriguez',
      author_title: 'Product Manager',
      author_company: 'Innovation Labs',
      author_avatar: null,
      rating: 5,
      quality_score: 0.75,
      tags: ['support', 'customization'],
      created_at: new Date().toISOString(),
    },
  ];
}
