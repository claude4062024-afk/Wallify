-- Wallify Database Migration: Connections & Site Settings
-- This migration adds tables for social account connections and site customization
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- CONNECTIONS TABLE
-- Stores OAuth connections to social platforms for auto-collecting testimonials
-- ============================================================================

-- Create connection platform enum
DO $$ BEGIN
    CREATE TYPE connection_platform AS ENUM ('twitter', 'linkedin', 'g2', 'producthunt');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create connection status enum
DO $$ BEGIN
    CREATE TYPE connection_status AS ENUM ('active', 'expired', 'pending', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    platform connection_platform NOT NULL,
    status connection_status NOT NULL DEFAULT 'pending',
    
    -- Account info
    account_handle TEXT,
    account_name TEXT,
    account_avatar TEXT,
    
    -- OAuth tokens (encrypted in production)
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    
    -- Scraping stats
    last_scraped_at TIMESTAMPTZ,
    scrape_count INTEGER DEFAULT 0,
    testimonials_found INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one connection per platform per project
    UNIQUE(project_id, platform)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_connections_project ON connections(project_id);
CREATE INDEX IF NOT EXISTS idx_connections_platform ON connections(platform);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

-- Enable RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connections
CREATE POLICY "users_can_view_own_connections" ON connections
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE org_id IN (
                SELECT org_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "users_can_insert_own_connections" ON connections
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM projects 
            WHERE org_id IN (
                SELECT org_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "users_can_update_own_connections" ON connections
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE org_id IN (
                SELECT org_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "users_can_delete_own_connections" ON connections
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE org_id IN (
                SELECT org_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- ============================================================================
-- SITE_SETTINGS TABLE
-- Stores configuration for the generated testimonial pages
-- ============================================================================

-- Create build status enum
DO $$ BEGIN
    CREATE TYPE build_status AS ENUM ('idle', 'building', 'deployed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Site configuration (stored as JSONB for flexibility)
    config JSONB NOT NULL DEFAULT '{
        "company_name": "",
        "logo_url": null,
        "primary_color": "#F59E0B",
        "font_family": "manrope",
        "layout_style": "grid",
        "cards_per_row": 3,
        "show_avatars": true,
        "show_ratings": true,
        "show_company_names": true,
        "show_source_badges": true,
        "subdomain": null,
        "custom_domain": null,
        "domain_verified": false,
        "custom_css": null,
        "meta_description": null,
        "header_html": null,
        "footer_html": null,
        "show_powered_by": true,
        "ga_tracking_id": null
    }',
    
    -- Build information
    build_status build_status DEFAULT 'idle',
    last_build_at TIMESTAMPTZ,
    deployed_url TEXT,
    build_error TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One settings record per project
    UNIQUE(project_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_site_settings_project ON site_settings(project_id);
CREATE INDEX IF NOT EXISTS idx_site_settings_build_status ON site_settings(build_status);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
CREATE POLICY "users_can_view_own_site_settings" ON site_settings
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE org_id IN (
                SELECT org_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "users_can_insert_own_site_settings" ON site_settings
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM projects 
            WHERE org_id IN (
                SELECT org_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "users_can_update_own_site_settings" ON site_settings
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE org_id IN (
                SELECT org_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "users_can_delete_own_site_settings" ON site_settings
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE org_id IN (
                SELECT org_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- ============================================================================
-- BUILDS TABLE
-- Tracks static site build history
-- ============================================================================

CREATE TABLE IF NOT EXISTS builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Build info
    status build_status DEFAULT 'building',
    triggered_by UUID REFERENCES auth.users(id),
    
    -- Results
    deployed_url TEXT,
    error_message TEXT,
    build_duration_ms INTEGER,
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_builds_project ON builds(project_id);
CREATE INDEX IF NOT EXISTS idx_builds_status ON builds(status);
CREATE INDEX IF NOT EXISTS idx_builds_started ON builds(started_at DESC);

-- Enable RLS
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for builds
CREATE POLICY "users_can_view_own_builds" ON builds
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE org_id IN (
                SELECT org_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "users_can_insert_own_builds" ON builds
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM projects 
            WHERE org_id IN (
                SELECT org_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to increment scrape count
CREATE OR REPLACE FUNCTION increment_scrape_count(connection_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE connections 
    SET scrape_count = scrape_count + 1,
        updated_at = NOW()
    WHERE id = connection_id
    RETURNING scrape_count INTO new_count;
    
    RETURN new_count;
END;
$$;

-- Function to update testimonials found count
CREATE OR REPLACE FUNCTION update_testimonials_found(connection_id UUID, count INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE connections 
    SET testimonials_found = testimonials_found + count,
        updated_at = NOW()
    WHERE id = connection_id;
END;
$$;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_connections_updated_at ON connections;
CREATE TRIGGER update_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE connections IS 'OAuth connections to social platforms for auto-collecting testimonials';
COMMENT ON TABLE site_settings IS 'Configuration for generated testimonial pages (static sites)';
COMMENT ON TABLE builds IS 'Build history for static site deployments';

COMMENT ON COLUMN connections.access_token IS 'OAuth access token - encrypt in production';
COMMENT ON COLUMN connections.refresh_token IS 'OAuth refresh token - encrypt in production';
COMMENT ON COLUMN site_settings.config IS 'Site configuration as JSONB for flexible schema evolution';
