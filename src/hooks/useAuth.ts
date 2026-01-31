import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
    const {
        user,
        profile,
        loading,
        initialized,
        initialize,
        signIn,
        signInWithGitHub,
        signInWithGoogle,
        signUp,
        signOut,
        fetchProfile,
    } = useAuthStore()

    useEffect(() => {
        if (!initialized) {
            initialize()
        }
    }, [initialized, initialize])

    return {
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        signIn,
        signInWithGitHub,
        signInWithGoogle,
        signUp,
        signOut,
        fetchProfile,
    }
}
