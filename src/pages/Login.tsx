import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isGitHubLoading, setIsGitHubLoading] = useState(false)

    const { signIn, signInWithGitHub } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        const { error } = await signIn(email, password)

        if (error) {
            setError(error.message)
            setIsLoading(false)
        } else {
            navigate('/dashboard')
        }
    }

    const handleGitHubSignIn = async () => {
        setError(null)
        setIsGitHubLoading(true)
        const { error } = await signInWithGitHub()
        if (error) {
            setError(error.message)
            setIsGitHubLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background bg-stars flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <h1 className="text-3xl font-bold text-molt-gradient">Wallify</h1>
                    </Link>
                    <p className="text-muted-foreground mt-2">Sign in to your account</p>
                </div>

                {/* Card */}
                <div className="bg-molt-surface/50 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm mb-6">
                            {error}
                        </div>
                    )}

                    {/* GitHub OAuth Button */}
                    <button
                        type="button"
                        onClick={handleGitHubSignIn}
                        disabled={isGitHubLoading}
                        className="w-full py-3 px-4 bg-[#24292e] hover:bg-[#2f363d] disabled:bg-[#24292e]/50 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-3 mb-6"
                    >
                        {isGitHubLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                        )}
                        {isGitHubLoading ? 'Connecting...' : 'Continue with GitHub'}
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-molt-surface/50 text-muted-foreground">
                                or continue with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-molt-surface/50 text-muted-foreground">
                                Don't have an account?
                            </span>
                        </div>
                    </div>

                    {/* Sign Up Link */}
                    <Link
                        to="/signup"
                        className="w-full py-3 px-4 border border-border rounded-lg text-foreground font-medium hover:bg-muted/20 transition-all duration-200 flex items-center justify-center"
                    >
                        Create Account
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-center text-muted-foreground text-sm mt-8">
                    By continuing, you agree to our{' '}
                    <Link to="/terms" className="text-amber-500 hover:text-amber-400 transition-colors">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-amber-500 hover:text-amber-400 transition-colors">
                        Privacy Policy
                    </Link>
                </p>
            </div>
        </div>
    )
}
