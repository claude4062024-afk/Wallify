-- Add page_path and is_published columns to site_settings table
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS page_path text DEFAULT 'wall',
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN site_settings.page_path IS 'URL path for the testimonials page (e.g., wall, love, testimonials)';
COMMENT ON COLUMN site_settings.is_published IS 'Whether the site is published and publicly accessible';
