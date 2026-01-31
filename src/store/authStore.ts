import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
    organization?: Database['public']['Tables']['organizations']['Row'] | null
}

interface AuthState {
    user: User | null
    profile: Profile | null
    loading: boolean
    initialized: boolean

    // Actions
    initialize: () => Promise<void>
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signInWithGitHub: () => Promise<{ error: Error | null }>
    signInWithGoogle: () => Promise<{ error: Error | null }>
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    fetchProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    loading: true,
    initialized: false,

    initialize: async () => {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
            set({ user: session.user })
            await get().fetchProfile()
        }

        set({ loading: false, initialized: true })

        // Listen to auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                set({ user: session.user })
                await get().fetchProfile()
            } else if (event === 'SIGNED_OUT') {
                set({ user: null, profile: null })
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                set({ user: session.user })
            }
        })
    },

    signIn: async (email: string, password: string) => {
        set({ loading: true })
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                set({ loading: false })
                return { error }
            }

            set({ loading: false })
            return { error: null }
        } catch (error) {
            set({ loading: false })
            return { error: error as Error }
        }
    },

    signInWithGitHub: async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                return { error }
            }

            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    },

    signInWithGoogle: async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            })

            if (error) {
                return { error }
            }

            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    },

    signUp: async (email: string, password: string, fullName: string) => {
        set({ loading: true })
        try {
            // 1. Create the user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            })

            if (authError || !authData.user) {
                set({ loading: false })
                return { error: authError || new Error('Failed to create user') }
            }

            // 2. Create organization for the user
            const baseSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
            const orgSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: `${fullName}'s Organization`,
                    slug: orgSlug,
                    billing_tier: 'starter',
                })
                .select()
                .single()

            if (orgError) {
                console.error('Error creating organization:', orgError)
                set({ loading: false })
                return { error: orgError }
            }

            // 3. Create profile with owner role
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    org_id: org.id,
                    full_name: fullName,
                    role: 'owner',
                })

            if (profileError) {
                console.error('Error creating profile:', profileError)
                set({ loading: false })
                return { error: profileError }
            }

            set({ loading: false })
            return { error: null }
        } catch (error) {
            set({ loading: false })
            return { error: error as Error }
        }
    },

    signOut: async () => {
        set({ loading: true })
        await supabase.auth.signOut()
        set({ user: null, profile: null, loading: false })
    },

    fetchProfile: async () => {
        const user = get().user
        if (!user) return

        const { data: profile } = await supabase
            .from('profiles')
            .select(`
                *,
                organization:organizations(*)
            `)
            .eq('id', user.id)
            .maybeSingle()

        if (profile) {
            set({ profile: profile as Profile })
        }
    },
}))
