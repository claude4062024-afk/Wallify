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
          project_id: string
          content_text: string | null
          author_name: string
          author_title: string | null
          author_company: string | null
          author_avatar: string | null
          author_email: string | null
          source: 'direct' | 'twitter' | 'linkedin' | 'g2' | 'video' | 'email'
          source_url: string | null
          source_id: string | null
          rating: number | null
          quality_score: number | null
          sentiment_score: number | null
          tags: string[]
          status: 'pending' | 'approved' | 'archived' | 'rejected'
          verification_status: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          content_text: string | null
          author_name: string
          author_title?: string | null
          author_company?: string | null
          author_avatar?: string | null
          author_email?: string | null
          source?: 'direct' | 'twitter' | 'linkedin' | 'g2' | 'video' | 'email'
          source_url?: string | null
          source_id?: string | null
          rating?: number | null
          quality_score?: number | null
          sentiment_score?: number | null
          tags?: string[]
          status?: 'pending' | 'approved' | 'archived' | 'rejected'
          verification_status?: string
        }
      }
      connections: {
        Row: {
          id: string
          project_id: string
          platform: string
          account_id: string | null
          account_name: string | null
          access_token: string | null
          refresh_token: string | null
          status: string
          last_scraped_at: string | null
          metadata: Record<string, unknown> | null
          created_at: string
          updated_at: string | null
        }
      }
    }
  }
}
