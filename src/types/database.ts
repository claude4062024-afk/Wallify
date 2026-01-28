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
            organizations: {
                Row: {
                    billing_tier: Database["public"]["Enums"]["billing_tier"]
                    created_at: string
                    id: string
                    name: string
                    settings: Json | null
                    slug: string
                    stripe_customer_id: string | null
                    updated_at: string
                }
                Insert: {
                    billing_tier?: Database["public"]["Enums"]["billing_tier"]
                    created_at?: string
                    id?: string
                    name: string
                    settings?: Json | null
                    slug: string
                    stripe_customer_id?: string | null
                    updated_at?: string
                }
                Update: {
                    billing_tier?: Database["public"]["Enums"]["billing_tier"]
                    created_at?: string
                    id?: string
                    name?: string
                    settings?: Json | null
                    slug?: string
                    stripe_customer_id?: string | null
                    updated_at?: string
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
            testimonials: {
                Row: {
                    ai_summary: string | null
                    author_avatar: string | null
                    author_company: string | null
                    author_email: string | null
                    author_name: string | null
                    author_title: string | null
                    content_text: string | null
                    created_at: string
                    embeddings: string | null
                    id: string
                    media_type: Database["public"]["Enums"]["media_type"]
                    media_url: string | null
                    metadata: Json | null
                    project_id: string
                    quality_score: number | null
                    sentiment_score: number | null
                    source: Database["public"]["Enums"]["testimonial_source"]
                    source_url: string | null
                    status: Database["public"]["Enums"]["testimonial_status"]
                    tags: string[] | null
                    updated_at: string
                    verification_status: string | null
                }
                Insert: {
                    ai_summary?: string | null
                    author_avatar?: string | null
                    author_company?: string | null
                    author_email?: string | null
                    author_name?: string | null
                    author_title?: string | null
                    content_text?: string | null
                    created_at?: string
                    embeddings?: string | null
                    id?: string
                    media_type?: Database["public"]["Enums"]["media_type"]
                    media_url?: string | null
                    metadata?: Json | null
                    project_id: string
                    quality_score?: number | null
                    sentiment_score?: number | null
                    source?: Database["public"]["Enums"]["testimonial_source"]
                    source_url?: string | null
                    status?: Database["public"]["Enums"]["testimonial_status"]
                    tags?: string[] | null
                    updated_at?: string
                    verification_status?: string | null
                }
                Update: {
                    ai_summary?: string | null
                    author_avatar?: string | null
                    author_company?: string | null
                    author_email?: string | null
                    author_name?: string | null
                    author_title?: string | null
                    content_text?: string | null
                    created_at?: string
                    embeddings?: string | null
                    id?: string
                    media_type?: Database["public"]["Enums"]["media_type"]
                    media_url?: string | null
                    metadata?: Json | null
                    project_id?: string
                    quality_score?: number | null
                    sentiment_score?: number | null
                    source?: Database["public"]["Enums"]["testimonial_source"]
                    source_url?: string | null
                    status?: Database["public"]["Enums"]["testimonial_status"]
                    tags?: string[] | null
                    updated_at?: string
                    verification_status?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "testimonials_project_id_fkey"
                        columns: ["project_id"]
                        isOneToOne: false
                        referencedRelation: "projects"
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
            can_access_project: {
                Args: { project_uuid: string }
                Returns: boolean
            }
            get_user_org_id: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            has_role: {
                Args: { required_role: Database["public"]["Enums"]["user_role"] }
                Returns: boolean
            }
            invite_user_to_org: {
                Args: {
                    user_id: string
                    organization_id: string
                    assigned_role?: Database["public"]["Enums"]["user_role"]
                }
                Returns: boolean
            }
        }
        Enums: {
            billing_tier: "starter" | "growth" | "optimization" | "enterprise"
            campaign_status: "active" | "paused" | "completed"
            campaign_type: "email" | "link" | "qr_code"
            event_type: "view" | "hover" | "click" | "conversion"
            media_type: "video" | "image" | "none"
            testimonial_source: "direct" | "twitter" | "linkedin" | "g2" | "video" | "email"
            testimonial_status: "pending" | "approved" | "archived" | "rejected"
            user_role: "owner" | "admin" | "member"
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
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
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never
