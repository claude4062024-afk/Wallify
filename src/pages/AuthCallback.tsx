import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const processing = useRef(false)

    useEffect(() => {
        const handleCallback = async () => {
            if (processing.current) return
            processing.current = true

            try {
                // Get the session from the URL hash
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) {
                    setError(sessionError.message)
                    processing.current = false
                    return
                }

                if (!session?.user) {
                    setError('No session found')
                    processing.current = false
                    return
                }

                // Check if user already has a profile
                const { data: existingProfile, error: profileCheckError } = await supabase
                    .from('profiles')
                    .select('id, org_id')
                    .eq('id', session.user.id)
                    .maybeSingle()

                if (profileCheckError) {
                    console.error('Error checking profile:', profileCheckError)
                    // Don't fail here - try to create profile anyway
                }

                if (!existingProfile) {
                    // New OAuth user - create organization and profile
                    const userData = session.user.user_metadata
                    const userName = userData?.full_name ||
                        userData?.name ||
                        session.user.email?.split('@')[0] ||
                        'New User'

                    const baseSlug = (session.user.email?.split('@')[0] || 'user')
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, '-')

                    const orgSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`

                    // Create organization
                    const { data: org, error: orgError } = await supabase
                        .from('organizations')
                        .insert({
                            name: `${userName}'s Organization`,
                            slug: orgSlug,
                            billing_tier: 'starter',
                        })
                        .select()
                        .single()

                    if (orgError) {
                        console.error('Error creating organization:', orgError)
                        
                        // Check if organization already exists for this user
                        const { data: existingOrg } = await supabase
                            .from('organizations')
                            .select('id')
                            .eq('slug', orgSlug)
                            .single()
                        
                        if (!existingOrg) {
                            setError(`Failed to create organization: ${orgError.message}`)
                            processing.current = false
                            return
                        }
                    }

                    // Create profile with upsert to handle duplicates gracefully
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: session.user.id,
                            org_id: org?.id,
                            full_name: userName,
                            avatar_url: userData?.avatar_url || null,
                            role: 'owner',
                        }, {
                            onConflict: 'id',
                            ignoreDuplicates: false
                        })

                    if (profileError) {
                        console.error('Error creating profile:', profileError)
                        
                        // If it's a duplicate key error, it's actually ok - profile exists
                        if (!profileError.message.includes('duplicate key')) {
                            setError(`Failed to create profile: ${profileError.message}`)
                            processing.current = false
                            return
                        }
                    }
                }

                // Redirect to dashboard
                navigate('/dashboard', { replace: true })
            } catch (err) {
                console.error('Auth callback error:', err)
                setError('An unexpected error occurred')
                processing.current = false
            }
        }

        handleCallback()
    }, [navigate])

    if (error) {
        return (
            <div className="min-h-screen bg-background bg-stars flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-molt-surface/50 backdrop-blur-sm border border-border rounded-2xl p-8 text-center">
                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-foreground mb-2">Authentication Error</h1>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <a
                        href="/login"
                        className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
                    >
                        Back to Login
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background bg-stars flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground">Setting up your account...</p>
            </div>
        </div>
    )
}
