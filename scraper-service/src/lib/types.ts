/**
 * Simplified Database Types for Scraper Service
 * These match the main dashboard types
 */

export interface Database {
  public: {
    Tables: {
      testimonials: {
        Row: {
          id: string
          organization_id: string | null
          project_id: string
          content_text: string | null
          author_name: string
          author_handle: string | null
          author_title: string | null
          author_company: string | null
          author_avatar: string | null
          author_email: string | null
          source: 'direct' | 'twitter' | 'linkedin' | 'g2' | 'producthunt' | 'capterra' | 'trustpilot' | 'video' | 'email'
          source_url: string | null
          source_id: string | null
          rating: number | null
          quality_score: number | null
          sentiment_score: number | null
          tags: string[]
          metadata: Record<string, unknown> | null
          status: 'pending' | 'approved' | 'archived' | 'rejected'
          verification_status: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id?: string | null
          project_id: string
          content_text: string | null
          author_name: string
          author_handle?: string | null
          author_title?: string | null
          author_company?: string | null
          author_avatar?: string | null
          author_email?: string | null
          source?: 'direct' | 'twitter' | 'linkedin' | 'g2' | 'producthunt' | 'capterra' | 'trustpilot' | 'video' | 'email'
          source_url?: string | null
          source_id?: string | null
          rating?: number | null
          quality_score?: number | null
          sentiment_score?: number | null
          tags?: string[]
          metadata?: Record<string, unknown> | null
          status?: 'pending' | 'approved' | 'archived' | 'rejected'
          verification_status?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          organization_id?: string | null
          project_id?: string
          content_text?: string | null
          author_name?: string
          author_handle?: string | null
          author_title?: string | null
          author_company?: string | null
          author_avatar?: string | null
          author_email?: string | null
          source?: 'direct' | 'twitter' | 'linkedin' | 'g2' | 'producthunt' | 'capterra' | 'trustpilot' | 'video' | 'email'
          source_url?: string | null
          source_id?: string | null
          rating?: number | null
          quality_score?: number | null
          sentiment_score?: number | null
          tags?: string[]
          metadata?: Record<string, unknown> | null
          status?: 'pending' | 'approved' | 'archived' | 'rejected'
          verification_status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      connections: {
        Row: {
          id: string
          organization_id: string
          project_id: string
          platform: string
          platform_handle: string | null
          account_id: string | null
          account_name: string | null
          access_token: string | null
          refresh_token: string | null
          status: 'active' | 'inactive' | 'pending' | 'error' | 'scraping'
          last_scraped_at: string | null
          metadata: Record<string, unknown> | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          project_id: string
          platform: string
          platform_handle?: string | null
          account_id?: string | null
          account_name?: string | null
          access_token?: string | null
          refresh_token?: string | null
          status?: 'active' | 'inactive' | 'pending' | 'error' | 'scraping'
          last_scraped_at?: string | null
          metadata?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          organization_id?: string
          project_id?: string
          platform?: string
          platform_handle?: string | null
          account_id?: string | null
          account_name?: string | null
          access_token?: string | null
          refresh_token?: string | null
          status?: 'active' | 'inactive' | 'pending' | 'error' | 'scraping'
          last_scraped_at?: string | null
          metadata?: Record<string, unknown> | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          id: string
          organization_id: string
          email_on_new_testimonials: boolean | null
          email_on_build_complete: boolean | null
          weekly_digest: boolean | null
        }
        Insert: {
          id?: string
          organization_id: string
          email_on_new_testimonials?: boolean | null
          email_on_build_complete?: boolean | null
          weekly_digest?: boolean | null
        }
        Update: {
          email_on_new_testimonials?: boolean | null
          email_on_build_complete?: boolean | null
          weekly_digest?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          organization_id: string
          type: string
          data: Record<string, unknown> | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          type: string
          data?: Record<string, unknown> | null
          read?: boolean
          created_at?: string
        }
        Update: {
          read?: boolean
        }
        Relationships: []
      }
      site_builds: {
        Row: {
          id: string
          project_id: string
          organization_id: string
          status: string
          error: string | null
          trigger: string | null
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          organization_id: string
          status: string
          error?: string | null
          trigger?: string | null
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          status?: string
          error?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
