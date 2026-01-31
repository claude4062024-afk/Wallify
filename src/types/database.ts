export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          testimonial_id: string | null
          timestamp: string
          visitor_context: Json | null
          widget_id: string | null
        }
        Insert: {
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          testimonial_id?: string | null
          timestamp?: string
          visitor_context?: Json | null
          widget_id?: string | null
        }
        Update: {
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          testimonial_id?: string | null
          timestamp?: string
          visitor_context?: Json | null
          widget_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "testimonials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: Json | null
          project_id: string
          rate_limit_per_day: number | null
          rate_limit_per_minute: number | null
          revoke_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          total_requests: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: Json | null
          project_id: string
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          total_requests?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json | null
          project_id?: string
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          total_requests?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          actor_ip: string | null
          actor_user_agent: string | null
          created_at: string
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          org_id: string
          request_id: string | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          actor_ip?: string | null
          actor_user_agent?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          org_id: string
          request_id?: string | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_ip?: string | null
          actor_user_agent?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string
          request_id?: string | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      builds: {
        Row: {
          assets_size_bytes: number | null
          build_log: Json | null
          commit_hash: string | null
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          error_stack: string | null
          id: string
          output_url: string | null
          pages_generated: number | null
          preview_url: string | null
          project_id: string
          retry_count: number | null
          site_settings_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["build_status"]
          testimonials_count: number | null
          trigger_type: string
          triggered_by: string | null
          version: number
        }
        Insert: {
          assets_size_bytes?: number | null
          build_log?: Json | null
          commit_hash?: string | null
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          output_url?: string | null
          pages_generated?: number | null
          preview_url?: string | null
          project_id: string
          retry_count?: number | null
          site_settings_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["build_status"]
          testimonials_count?: number | null
          trigger_type?: string
          triggered_by?: string | null
          version?: number
        }
        Update: {
          assets_size_bytes?: number | null
          build_log?: Json | null
          commit_hash?: string | null
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          output_url?: string | null
          pages_generated?: number | null
          preview_url?: string | null
          project_id?: string
          retry_count?: number | null
          site_settings_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["build_status"]
          testimonials_count?: number | null
          trigger_type?: string
          triggered_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "builds_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builds_site_settings_id_fkey"
            columns: ["site_settings_id"]
            isOneToOne: false
            referencedRelation: "site_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builds_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_campaigns: {
        Row: {
          created_at: string
          director_mode_enabled: boolean
          director_questions: Json | null
          id: string
          name: string
          project_id: string
          settings: Json | null
          status: Database["public"]["Enums"]["campaign_status"]
          total_responses: number
          total_sent: number
          type: Database["public"]["Enums"]["campaign_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          director_mode_enabled?: boolean
          director_questions?: Json | null
          id?: string
          name: string
          project_id: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["campaign_status"]
          total_responses?: number
          total_sent?: number
          type?: Database["public"]["Enums"]["campaign_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          director_mode_enabled?: boolean
          director_questions?: Json | null
          id?: string
          name?: string
          project_id?: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["campaign_status"]
          total_responses?: number
          total_sent?: number
          type?: Database["public"]["Enums"]["campaign_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_campaigns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          access_token_encrypted: string | null
          account_avatar: string | null
          account_handle: string | null
          account_id: string | null
          account_name: string | null
          account_url: string | null
          created_at: string
          id: string
          last_error: string | null
          last_scraped_at: string | null
          platform: Database["public"]["Enums"]["connection_platform"]
          project_id: string
          refresh_token_encrypted: string | null
          scrape_config: Json | null
          scrape_count: number | null
          status: Database["public"]["Enums"]["connection_status"]
          testimonials_found: number | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token_encrypted?: string | null
          account_avatar?: string | null
          account_handle?: string | null
          account_id?: string | null
          account_name?: string | null
          account_url?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          last_scraped_at?: string | null
          platform: Database["public"]["Enums"]["connection_platform"]
          project_id: string
          refresh_token_encrypted?: string | null
          scrape_config?: Json | null
          scrape_count?: number | null
          status?: Database["public"]["Enums"]["connection_status"]
          testimonials_found?: number | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token_encrypted?: string | null
          account_avatar?: string | null
          account_handle?: string | null
          account_id?: string | null
          account_name?: string | null
          account_url?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          last_scraped_at?: string | null
          platform?: Database["public"]["Enums"]["connection_platform"]
          project_id?: string
          refresh_token_encrypted?: string | null
          scrape_config?: Json | null
          scrape_count?: number | null
          status?: Database["public"]["Enums"]["connection_status"]
          testimonials_found?: number | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          digest_frequency: string | null
          email_build_completed: boolean | null
          email_connection_expired: boolean | null
          email_new_testimonial: boolean | null
          email_scrape_completed: boolean | null
          email_testimonial_approved: boolean | null
          email_weekly_digest: boolean | null
          id: string
          profile_id: string
          push_high_quality_testimonial: boolean | null
          push_new_testimonial: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          digest_frequency?: string | null
          email_build_completed?: boolean | null
          email_connection_expired?: boolean | null
          email_new_testimonial?: boolean | null
          email_scrape_completed?: boolean | null
          email_testimonial_approved?: boolean | null
          email_weekly_digest?: boolean | null
          id?: string
          profile_id: string
          push_high_quality_testimonial?: boolean | null
          push_new_testimonial?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          digest_frequency?: string | null
          email_build_completed?: boolean | null
          email_connection_expired?: boolean | null
          email_new_testimonial?: boolean | null
          email_scrape_completed?: boolean | null
          email_testimonial_approved?: boolean | null
          email_weekly_digest?: boolean | null
          id?: string
          profile_id?: string
          push_high_quality_testimonial?: boolean | null
          push_new_testimonial?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_tier: Database["public"]["Enums"]["billing_tier"]
          company_size: string | null
          created_at: string
          current_usage: Json | null
          feature_flags: Json | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          sso_config: Json | null
          sso_provider: string | null
          stripe_customer_id: string | null
          subscription_ends_at: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          updated_at: string
          usage_limits: Json | null
          website_url: string | null
        }
        Insert: {
          billing_tier?: Database["public"]["Enums"]["billing_tier"]
          company_size?: string | null
          created_at?: string
          current_usage?: Json | null
          feature_flags?: Json | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          sso_config?: Json | null
          sso_provider?: string | null
          stripe_customer_id?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          usage_limits?: Json | null
          website_url?: string | null
        }
        Update: {
          billing_tier?: Database["public"]["Enums"]["billing_tier"]
          company_size?: string | null
          created_at?: string
          current_usage?: Json | null
          feature_flags?: Json | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          sso_config?: Json | null
          sso_provider?: string | null
          stripe_customer_id?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          usage_limits?: Json | null
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          org_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          api_key: string
          created_at: string
          domain_whitelist: string[] | null
          id: string
          name: string
          org_id: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          api_key?: string
          created_at?: string
          domain_whitelist?: string[] | null
          id?: string
          name: string
          org_id: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          domain_whitelist?: string[] | null
          id?: string
          name?: string
          org_id?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scrape_jobs: {
        Row: {
          completed_at: string | null
          connection_id: string
          created_at: string
          error_code: string | null
          error_message: string | null
          id: string
          items_accepted: number | null
          items_found: number | null
          items_processed: number | null
          items_rejected: number | null
          log_entries: Json | null
          max_retries: number | null
          priority: number | null
          project_id: string
          retry_count: number | null
          scheduled_for: string
          scrape_params: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["scrape_status"]
        }
        Insert: {
          completed_at?: string | null
          connection_id: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          items_accepted?: number | null
          items_found?: number | null
          items_processed?: number | null
          items_rejected?: number | null
          log_entries?: Json | null
          max_retries?: number | null
          priority?: number | null
          project_id: string
          retry_count?: number | null
          scheduled_for?: string
          scrape_params?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["scrape_status"]
        }
        Update: {
          completed_at?: string | null
          connection_id?: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          items_accepted?: number | null
          items_found?: number | null
          items_processed?: number | null
          items_rejected?: number | null
          log_entries?: Json | null
          max_retries?: number | null
          priority?: number | null
          project_id?: string
          retry_count?: number | null
          scheduled_for?: string
          scrape_params?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["scrape_status"]
        }
        Relationships: [
          {
            foreignKeyName: "scrape_jobs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrape_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scraped_items: {
        Row: {
          ai_summary: string | null
          author_avatar: string | null
          author_bio: string | null
          author_followers: number | null
          author_handle: string | null
          author_name: string | null
          author_platform_id: string | null
          author_verified: boolean | null
          connection_id: string
          content_html: string | null
          content_text: string
          converted_at: string | null
          created_at: string
          extracted_tags: string[] | null
          id: string
          is_testimonial_candidate: boolean | null
          media_urls: Json | null
          platform: Database["public"]["Enums"]["connection_platform"]
          platform_item_id: string
          platform_metadata: Json | null
          platform_url: string | null
          project_id: string
          quality_score: number | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          scrape_job_id: string | null
          scraped_at: string
          sentiment_score: number | null
          status: string | null
          testimonial_id: string | null
        }
        Insert: {
          ai_summary?: string | null
          author_avatar?: string | null
          author_bio?: string | null
          author_followers?: number | null
          author_handle?: string | null
          author_name?: string | null
          author_platform_id?: string | null
          author_verified?: boolean | null
          connection_id: string
          content_html?: string | null
          content_text: string
          converted_at?: string | null
          created_at?: string
          extracted_tags?: string[] | null
          id?: string
          is_testimonial_candidate?: boolean | null
          media_urls?: Json | null
          platform: Database["public"]["Enums"]["connection_platform"]
          platform_item_id: string
          platform_metadata?: Json | null
          platform_url?: string | null
          project_id: string
          quality_score?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scrape_job_id?: string | null
          scraped_at?: string
          sentiment_score?: number | null
          status?: string | null
          testimonial_id?: string | null
        }
        Update: {
          ai_summary?: string | null
          author_avatar?: string | null
          author_bio?: string | null
          author_followers?: number | null
          author_handle?: string | null
          author_name?: string | null
          author_platform_id?: string | null
          author_verified?: boolean | null
          connection_id?: string
          content_html?: string | null
          content_text?: string
          converted_at?: string | null
          created_at?: string
          extracted_tags?: string[] | null
          id?: string
          is_testimonial_candidate?: boolean | null
          media_urls?: Json | null
          platform?: Database["public"]["Enums"]["connection_platform"]
          platform_item_id?: string
          platform_metadata?: Json | null
          platform_url?: string | null
          project_id?: string
          quality_score?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scrape_job_id?: string | null
          scraped_at?: string
          sentiment_score?: number | null
          status?: string | null
          testimonial_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scraped_items_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scraped_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scraped_items_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scraped_items_scrape_job_id_fkey"
            columns: ["scrape_job_id"]
            isOneToOne: false
            referencedRelation: "scrape_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scraped_items_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "testimonials"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          build_status: Database["public"]["Enums"]["build_status"] | null
          config: Json
          created_at: string
          custom_css: string | null
          custom_domain: string | null
          custom_footer_html: string | null
          custom_header_html: string | null
          deployed_url: string | null
          domain_verification_token: string | null
          domain_verified: boolean | null
          ga_tracking_id: string | null
          gtm_container_id: string | null
          id: string
          last_build_at: string | null
          last_build_duration_ms: number | null
          layout_config: Json
          project_id: string
          seo_config: Json
          show_powered_by: boolean | null
          subdomain: string | null
          updated_at: string
        }
        Insert: {
          build_status?: Database["public"]["Enums"]["build_status"] | null
          config?: Json
          created_at?: string
          custom_css?: string | null
          custom_domain?: string | null
          custom_footer_html?: string | null
          custom_header_html?: string | null
          deployed_url?: string | null
          domain_verification_token?: string | null
          domain_verified?: boolean | null
          ga_tracking_id?: string | null
          gtm_container_id?: string | null
          id?: string
          last_build_at?: string | null
          last_build_duration_ms?: number | null
          layout_config?: Json
          project_id: string
          seo_config?: Json
          show_powered_by?: boolean | null
          subdomain?: string | null
          updated_at?: string
        }
        Update: {
          build_status?: Database["public"]["Enums"]["build_status"] | null
          config?: Json
          created_at?: string
          custom_css?: string | null
          custom_domain?: string | null
          custom_footer_html?: string | null
          custom_header_html?: string | null
          deployed_url?: string | null
          domain_verification_token?: string | null
          domain_verified?: boolean | null
          ga_tracking_id?: string | null
          gtm_container_id?: string | null
          id?: string
          last_build_at?: string | null
          last_build_duration_ms?: number | null
          layout_config?: Json
          project_id?: string
          seo_config?: Json
          show_powered_by?: boolean | null
          subdomain?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonial_views: {
        Row: {
          categories: string[] | null
          created_at: string
          display_company_override: string | null
          display_name_override: string | null
          display_order: number | null
          display_text_override: string | null
          display_title_override: string | null
          id: string
          industries: string[] | null
          is_featured: boolean | null
          is_hidden: boolean | null
          is_pinned: boolean | null
          project_id: string
          show_avatar: boolean | null
          show_date: boolean | null
          show_rating: boolean | null
          show_source: boolean | null
          testimonial_id: string
          updated_at: string
          use_cases: string[] | null
        }
        Insert: {
          categories?: string[] | null
          created_at?: string
          display_company_override?: string | null
          display_name_override?: string | null
          display_order?: number | null
          display_text_override?: string | null
          display_title_override?: string | null
          id?: string
          industries?: string[] | null
          is_featured?: boolean | null
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          project_id: string
          show_avatar?: boolean | null
          show_date?: boolean | null
          show_rating?: boolean | null
          show_source?: boolean | null
          testimonial_id: string
          updated_at?: string
          use_cases?: string[] | null
        }
        Update: {
          categories?: string[] | null
          created_at?: string
          display_company_override?: string | null
          display_name_override?: string | null
          display_order?: number | null
          display_text_override?: string | null
          display_title_override?: string | null
          id?: string
          industries?: string[] | null
          is_featured?: boolean | null
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          project_id?: string
          show_avatar?: boolean | null
          show_date?: boolean | null
          show_rating?: boolean | null
          show_source?: boolean | null
          testimonial_id?: string
          updated_at?: string
          use_cases?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonial_views_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_views_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "testimonials"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          ai_summary: string | null
          approved_at: string | null
          approved_by: string | null
          author_avatar: string | null
          author_company: string | null
          author_email: string | null
          author_name: string | null
          author_title: string | null
          collection_campaign_id: string | null
          connection_id: string | null
          content_text: string | null
          created_at: string
          embeddings: string | null
          id: string
          is_featured: boolean | null
          is_video_testimonial: boolean | null
          language: string | null
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string | null
          metadata: Json | null
          project_id: string
          published_at: string | null
          quality_score: number | null
          rating: number | null
          rejection_reason: string | null
          scraped_item_id: string | null
          sentiment_score: number | null
          source: Database["public"]["Enums"]["testimonial_source"]
          source_url: string | null
          status: Database["public"]["Enums"]["testimonial_status"]
          tags: string[] | null
          trust_score: number | null
          updated_at: string
          verification_status: string | null
          video_duration_seconds: number | null
          video_thumbnail_url: string | null
          video_transcript: string | null
        }
        Insert: {
          ai_summary?: string | null
          approved_at?: string | null
          approved_by?: string | null
          author_avatar?: string | null
          author_company?: string | null
          author_email?: string | null
          author_name?: string | null
          author_title?: string | null
          collection_campaign_id?: string | null
          connection_id?: string | null
          content_text?: string | null
          created_at?: string
          embeddings?: string | null
          id?: string
          is_featured?: boolean | null
          is_video_testimonial?: boolean | null
          language?: string | null
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string | null
          metadata?: Json | null
          project_id: string
          published_at?: string | null
          quality_score?: number | null
          rating?: number | null
          rejection_reason?: string | null
          scraped_item_id?: string | null
          sentiment_score?: number | null
          source?: Database["public"]["Enums"]["testimonial_source"]
          source_url?: string | null
          status?: Database["public"]["Enums"]["testimonial_status"]
          tags?: string[] | null
          trust_score?: number | null
          updated_at?: string
          verification_status?: string | null
          video_duration_seconds?: number | null
          video_thumbnail_url?: string | null
          video_transcript?: string | null
        }
        Update: {
          ai_summary?: string | null
          approved_at?: string | null
          approved_by?: string | null
          author_avatar?: string | null
          author_company?: string | null
          author_email?: string | null
          author_name?: string | null
          author_title?: string | null
          collection_campaign_id?: string | null
          connection_id?: string | null
          content_text?: string | null
          created_at?: string
          embeddings?: string | null
          id?: string
          is_featured?: boolean | null
          is_video_testimonial?: boolean | null
          language?: string | null
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string | null
          metadata?: Json | null
          project_id?: string
          published_at?: string | null
          quality_score?: number | null
          rating?: number | null
          rejection_reason?: string | null
          scraped_item_id?: string | null
          sentiment_score?: number | null
          source?: Database["public"]["Enums"]["testimonial_source"]
          source_url?: string | null
          status?: Database["public"]["Enums"]["testimonial_status"]
          tags?: string[] | null
          trust_score?: number | null
          updated_at?: string
          verification_status?: string | null
          video_duration_seconds?: number | null
          video_thumbnail_url?: string | null
          video_transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_collection_campaign_id_fkey"
            columns: ["collection_campaign_id"]
            isOneToOne: false
            referencedRelation: "collection_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_scraped_item_id_fkey"
            columns: ["scraped_item_id"]
            isOneToOne: false
            referencedRelation: "scraped_items"
            referencedColumns: ["id"]
          },
        ]
      }
      verifications: {
        Row: {
          created_at: string
          evidence: Json | null
          expires_at: string | null
          id: string
          oauth_profile_url: string | null
          oauth_provider: string | null
          payment_provider: string | null
          payment_verified_at: string | null
          status: Database["public"]["Enums"]["verification_status"]
          testimonial_id: string
          trust_score_contribution: number | null
          type: Database["public"]["Enums"]["verification_type"]
          updated_at: string
          verified_at: string | null
          verified_domain: string | null
          verified_email: string | null
        }
        Insert: {
          created_at?: string
          evidence?: Json | null
          expires_at?: string | null
          id?: string
          oauth_profile_url?: string | null
          oauth_provider?: string | null
          payment_provider?: string | null
          payment_verified_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          testimonial_id: string
          trust_score_contribution?: number | null
          type: Database["public"]["Enums"]["verification_type"]
          updated_at?: string
          verified_at?: string | null
          verified_domain?: string | null
          verified_email?: string | null
        }
        Update: {
          created_at?: string
          evidence?: Json | null
          expires_at?: string | null
          id?: string
          oauth_profile_url?: string | null
          oauth_provider?: string | null
          payment_provider?: string | null
          payment_verified_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          testimonial_id?: string
          trust_score_contribution?: number | null
          type?: Database["public"]["Enums"]["verification_type"]
          updated_at?: string
          verified_at?: string | null
          verified_domain?: string | null
          verified_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verifications_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "testimonials"
            referencedColumns: ["id"]
          },
        ]
      }
      widgets: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          project_id: string
          rules: Json | null
          type: Database["public"]["Enums"]["widget_type"]
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          project_id: string
          rules?: Json | null
          type?: Database["public"]["Enums"]["widget_type"]
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          project_id?: string
          rules?: Json | null
          type?: Database["public"]["Enums"]["widget_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "widgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_testimonial_trust_score: {
        Args: { p_testimonial_id: string }
        Returns: number
      }
      can_access_project: { Args: { project_uuid: string }; Returns: boolean }
      convert_scraped_to_testimonial: {
        Args: { p_scraped_item_id: string }
        Returns: string
      }
      get_connection_stats: {
        Args: { p_project_id: string }
        Returns: {
          last_scraped_at: string
          platform: Database["public"]["Enums"]["connection_platform"]
          status: Database["public"]["Enums"]["connection_status"]
          testimonials_found: number
        }[]
      }
      get_testimonial_stats: {
        Args: { p_project_id: string }
        Returns: {
          approved_count: number
          avg_quality_score: number
          avg_sentiment_score: number
          avg_trust_score: number
          featured_count: number
          pending_count: number
          total_count: number
          video_count: number
        }[]
      }
      get_user_org_id: { Args: Record<PropertyKey, never>; Returns: string }
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      increment_scrape_count: {
        Args: { p_connection_id: string }
        Returns: number
      }
      invite_user_to_org: {
        Args: {
          assigned_role?: Database["public"]["Enums"]["user_role"]
          organization_id: string
          user_id: string
        }
        Returns: boolean
      }
      queue_scrape_job: { Args: { p_connection_id: string }; Returns: string }
      trigger_site_rebuild: {
        Args: { p_project_id: string; p_trigger_type?: string }
        Returns: string
      }
    }
    Enums: {
      billing_tier: "starter" | "growth" | "optimization" | "enterprise"
      build_status: "pending" | "building" | "success" | "failed" | "cancelled"
      campaign_status: "active" | "paused" | "completed"
      campaign_type: "email" | "link" | "qr_code"
      connection_platform:
        | "twitter"
        | "linkedin"
        | "g2"
        | "producthunt"
        | "capterra"
        | "trustpilot"
      connection_status: "pending" | "active" | "expired" | "revoked" | "error"
      event_type: "view" | "hover" | "click" | "conversion"
      media_type: "video" | "image" | "none"
      scrape_status: "queued" | "running" | "completed" | "failed" | "cancelled"
      testimonial_source:
        | "direct"
        | "twitter"
        | "linkedin"
        | "g2"
        | "video"
        | "email"
      testimonial_status: "pending" | "approved" | "archived" | "rejected"
      user_role: "owner" | "admin" | "member"
      verification_status: "pending" | "verified" | "failed" | "expired"
      verification_type: "oauth" | "email" | "payment" | "linkedin" | "manual"
      widget_type: "grid" | "carousel" | "ticker" | "story" | "feed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof Database
}
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never