import { useNavigate } from 'react-router-dom'
import { 
    Sparkles, 
    ArrowRight, 
    Zap, 
    Star,
    Twitter,
    Linkedin,
    Globe,
    TrendingUp,
    MessageSquareQuote,
    CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

// Sample testimonials for the demo
const sampleTestimonials = [
    {
        id: 1,
        content: "Wallify transformed how we showcase customer love. Our conversion rate jumped 34% after adding the testimonial wall to our landing page.",
        author: "Sarah Chen",
        title: "Head of Marketing",
        company: "TechFlow",
        source: "twitter",
    },
    {
        id: 2,
        content: "The auto-collection feature is a game-changer. We no longer manually hunt for testimonials - they just appear in our dashboard!",
        author: "Marcus Johnson",
        title: "Founder & CEO",
        company: "GrowthLabs",
        source: "linkedin",
    },
    {
        id: 3,
        content: "Beautiful, fast, and incredibly easy to set up. Had our testimonial page live in under 5 minutes.",
        author: "Emily Rodriguez",
        title: "Product Manager",
        company: "StartupXYZ",
        source: "g2",
    },
]

const features = [
    {
        icon: Zap,
        title: "Auto-Collection",
        description: "Automatically collect testimonials from Twitter, LinkedIn, G2, and more.",
    },
    {
        icon: Globe,
        title: "Beautiful Pages",
        description: "Generate stunning testimonial pages at love.yourcompany.com",
    },
    {
        icon: TrendingUp,
        title: "Boost Conversions",
        description: "Show social proof that converts visitors into customers.",
    },
]

const stats = [
    { value: "10K+", label: "Testimonials Collected" },
    { value: "500+", label: "Companies Trust Us" },
    { value: "34%", label: "Avg. Conversion Lift" },
    { value: "< 5min", label: "Time to Launch" },
]

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export const Home = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate('/dashboard')
        } else {
            navigate('/signup')
        }
    }

    const handleLogin = () => {
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-stone-950 text-stone-50 overflow-x-hidden">
            {/* Subtle gradient background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 container mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <MessageSquareQuote className="w-5 h-5 text-stone-900" />
                        </div>
                        <span className="text-2xl font-bold text-amber-500">Wallify</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold rounded-lg transition-colors"
                            >
                                Dashboard
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={handleLogin}
                                    className="px-5 py-2.5 text-sm font-medium text-stone-400 hover:text-stone-50 transition-colors"
                                >
                                    Login
                                </button>
                                <button 
                                    onClick={handleGetStarted}
                                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold rounded-lg transition-colors"
                                >
                                    Get Started Free
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10">
                <div className="container mx-auto px-6 pt-16 pb-24">
                    {/* Hero Content */}
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-amber-400">Mintlify for Testimonials</span>
                        </div>
                        
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                            <span className="block text-stone-50">Beautiful Testimonial</span>
                            <span className="block bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                                Walls That Convert
                            </span>
                        </h1>

                        <p className="text-xl text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Generate stunning, hosted testimonial pages that automatically pull reviews from social media. 
                            Set up <span className="text-stone-200">love.yourcompany.com</span> in minutes.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <button 
                                onClick={handleGetStarted}
                                className="group px-8 py-4 bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold rounded-xl transition-colors flex items-center gap-2"
                            >
                                Start Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button 
                                className="px-8 py-4 border border-stone-700 hover:border-stone-600 text-stone-300 hover:text-stone-50 rounded-xl transition-colors"
                            >
                                View Demo
                            </button>
                        </div>

                        <p className="mt-6 text-sm text-stone-500">
                            No credit card required • Free forever for small teams
                        </p>
                    </div>

                    {/* Demo Testimonial Wall Preview */}
                    <div className="max-w-5xl mx-auto mb-24">
                        <div className="relative bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 rounded-2xl p-8 overflow-hidden">
                            {/* Browser chrome */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="px-4 py-1.5 bg-stone-800 rounded-lg text-sm text-stone-400 font-mono">
                                        love.yourcompany.com
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {sampleTestimonials.map((testimonial) => (
                                    <div 
                                        key={testimonial.id}
                                        className="bg-white rounded-xl p-5 text-stone-900 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-sm">
                                                {getInitials(testimonial.author)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-stone-900 truncate">
                                                    {testimonial.author}
                                                </p>
                                                <p className="text-sm text-stone-500 truncate">
                                                    {testimonial.title} at {testimonial.company}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-stone-700 text-sm leading-relaxed line-clamp-4">
                                            "{testimonial.content}"
                                        </p>
                                        <div className="mt-3 flex items-center gap-2">
                                            {testimonial.source === 'twitter' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-sky-600 rounded text-xs font-medium">
                                                    <Twitter className="w-3 h-3" /> Twitter
                                                </span>
                                            )}
                                            {testimonial.source === 'linkedin' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                                                    <Linkedin className="w-3 h-3" /> LinkedIn
                                                </span>
                                            )}
                                            {testimonial.source === 'g2' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs font-medium">
                                                    <Star className="w-3 h-3" /> G2
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Powered by badge */}
                            <div className="mt-6 text-center">
                                <span className="text-xs text-stone-500">
                                    Powered by <span className="text-amber-500 font-semibold">Wallify</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="max-w-5xl mx-auto mb-24">
                        <h2 className="text-3xl font-bold text-center mb-12">
                            <span className="text-stone-50">Everything you need for </span>
                            <span className="text-amber-500">social proof</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {features.map((feature, i) => {
                                const Icon = feature.icon
                                return (
                                    <div 
                                        key={i}
                                        className="p-6 bg-stone-900/50 border border-stone-800 rounded-xl hover:border-amber-500/30 transition-colors"
                                    >
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                                            <Icon className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-stone-50 mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-stone-400">
                                            {feature.description}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="max-w-4xl mx-auto mb-24">
                        <h2 className="text-3xl font-bold text-center mb-12 text-stone-50">
                            Get started in 3 simple steps
                        </h2>
                        <div className="space-y-6">
                            {[
                                { step: 1, title: "Connect your accounts", description: "Link Twitter, LinkedIn, G2, and more with one click" },
                                { step: 2, title: "We collect automatically", description: "AI finds positive mentions and reviews daily" },
                                { step: 3, title: "Approve & publish", description: "Curate the best testimonials and your page auto-updates" },
                            ].map((item) => (
                                <div 
                                    key={item.step}
                                    className="flex items-start gap-6 p-6 bg-stone-900/30 border border-stone-800 rounded-xl"
                                >
                                    <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-stone-900 font-bold flex-shrink-0">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-stone-50 mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-stone-400">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="max-w-4xl mx-auto mb-24">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats.map((stat, i) => (
                                <div 
                                    key={i} 
                                    className="text-center p-6 bg-stone-900/30 border border-stone-800 rounded-xl"
                                >
                                    <div className="text-3xl font-bold text-amber-500 mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-stone-500">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing Preview */}
                    <div className="max-w-4xl mx-auto mb-24">
                        <h2 className="text-3xl font-bold text-center mb-4 text-stone-50">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-center text-stone-400 mb-12">
                            Start free, upgrade as you grow
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { 
                                    name: "Starter", 
                                    price: "Free", 
                                    features: ["50 testimonials", "1 testimonial page", "Basic customization", "Wallify branding"],
                                    cta: "Get Started",
                                    popular: false,
                                },
                                { 
                                    name: "Growth", 
                                    price: "$49/mo", 
                                    features: ["500 testimonials", "Unlimited pages", "Custom domain", "Remove branding", "Auto-collection"],
                                    cta: "Start Trial",
                                    popular: true,
                                },
                                { 
                                    name: "Enterprise", 
                                    price: "Custom", 
                                    features: ["Unlimited everything", "SSO/SAML", "API access", "Dedicated support", "SLA"],
                                    cta: "Contact Sales",
                                    popular: false,
                                },
                            ].map((plan, i) => (
                                <div 
                                    key={i}
                                    className={`p-6 rounded-xl border ${
                                        plan.popular 
                                            ? 'bg-amber-500/10 border-amber-500/30' 
                                            : 'bg-stone-900/30 border-stone-800'
                                    }`}
                                >
                                    {plan.popular && (
                                        <span className="inline-block px-3 py-1 bg-amber-500 text-stone-900 text-xs font-semibold rounded-full mb-4">
                                            Most Popular
                                        </span>
                                    )}
                                    <h3 className="text-xl font-bold text-stone-50 mb-2">{plan.name}</h3>
                                    <p className="text-3xl font-bold text-amber-500 mb-6">{plan.price}</p>
                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature, j) => (
                                            <li key={j} className="flex items-center gap-2 text-stone-400 text-sm">
                                                <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <button 
                                        onClick={handleGetStarted}
                                        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                            plan.popular
                                                ? 'bg-amber-500 hover:bg-amber-600 text-stone-900'
                                                : 'border border-stone-700 hover:border-stone-600 text-stone-300 hover:text-stone-50'
                                        }`}
                                    >
                                        {plan.cta}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="p-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl">
                            <h2 className="text-2xl font-bold text-stone-50 mb-4">
                                Ready to build your testimonial wall?
                            </h2>
                            <p className="text-stone-400 mb-6">
                                Join 500+ companies using Wallify to boost their conversions with social proof.
                            </p>
                            <button 
                                onClick={handleGetStarted}
                                className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold rounded-xl transition-colors"
                            >
                                Get Started Free
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-stone-800 py-8">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <MessageSquareQuote className="w-5 h-5 text-amber-500" />
                            <span className="font-semibold text-amber-500">Wallify</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-stone-500">
                            <a href="/terms" className="hover:text-stone-300 transition-colors">Terms</a>
                            <a href="/privacy" className="hover:text-stone-300 transition-colors">Privacy</a>
                            <a href="mailto:hello@wallify.com" className="hover:text-stone-300 transition-colors">Contact</a>
                        </div>
                        <div className="text-sm text-stone-600">
                            © 2026 Wallify. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home
