import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Download, Play, Crown, Zap, Eye } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const wallpapers = [
    { id: 1, title: "Neon Abyss", category: "Cyberpunk", downloads: "12.4K", color: "from-violet-600 via-fuchsia-500 to-pink-500" },
    { id: 2, title: "Void Genesis", category: "Abstract", downloads: "8.9K", color: "from-cyan-500 via-blue-600 to-indigo-800" },
    { id: 3, title: "Solar Flare", category: "Space", downloads: "15.2K", color: "from-orange-500 via-red-600 to-rose-700" },
    { id: 4, title: "Aurora Dreams", category: "Nature", downloads: "10.1K", color: "from-emerald-400 via-teal-500 to-cyan-600" },
    { id: 5, title: "Midnight Code", category: "Dev", downloads: "22.7K", color: "from-slate-800 via-purple-900 to-violet-950" },
    { id: 6, title: "Quantum Drift", category: "Abstract", downloads: "9.3K", color: "from-rose-500 via-purple-600 to-indigo-700" },
]

// Generate random stars
const stars = Array.from({ length: 200 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.8 + 0.2,
    twinkle: Math.random() > 0.7,
}))

export const Home = () => {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null)
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const handleExplore = () => {
        if (isAuthenticated) {
            navigate('/dashboard')
        } else {
            navigate('/login')
        }
    }

    const handleGoPremium = () => {
        if (isAuthenticated) {
            navigate('/settings?tab=billing')
        } else {
            navigate('/signup')
        }
    }

    const handleBrowse = () => {
        if (isAuthenticated) {
            navigate('/dashboard')
        } else {
            navigate('/login')
        }
    }

    const handlePricing = () => {
        navigate('/pricing')
    }

    const handleAIGenerate = () => {
        if (isAuthenticated) {
            navigate('/widgets')
        } else {
            navigate('/signup')
        }
    }

    return (
        <div className="min-h-screen bg-[#030014] text-white overflow-x-hidden">
            {/* Deep Space Starfield Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Stars */}
                <svg className="absolute inset-0 w-full h-full">
                    {stars.map((star) => (
                        <circle
                            key={star.id}
                            cx={`${star.x}%`}
                            cy={`${star.y}%`}
                            r={star.size}
                            fill="white"
                            opacity={star.opacity}
                            className={star.twinkle ? 'animate-pulse' : ''}
                        />
                    ))}
                </svg>
                {/* Subtle nebula colors - no blur, just gradients */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-950/20 via-transparent to-cyan-950/10" />
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-fuchsia-950/15 to-transparent" />
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-950/15 to-transparent" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 container mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-500 p-[2px]">
                                <div className="w-full h-full rounded-2xl bg-[#030014] flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-fuchsia-400" />
                                </div>
                            </div>
                        </div>
                        <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            WALLIFY
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleBrowse}
                            className="px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
                        >
                            Browse
                        </button>
                        <button 
                            onClick={handlePricing}
                            className="px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
                        >
                            Pricing
                        </button>
                        <button 
                            onClick={handleGoPremium}
                            className="group relative px-6 py-3 rounded-full overflow-hidden hover:opacity-90 transition-opacity"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600" />
                            <span className="relative font-semibold text-sm flex items-center gap-2">
                                <Crown className="w-4 h-4" /> {isAuthenticated ? 'Dashboard' : 'Go Premium'}
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10">
                <div className="container mx-auto px-6 pt-20 pb-32">
                    {/* Main Hero */}
                    <div className="text-center max-w-5xl mx-auto mb-32">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-white/80">10,000+ Premium 8K Wallpapers</span>
                        </div>
                        
                        <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black leading-[0.85] mb-8 tracking-tight">
                            <span className="block bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
                                YOUR SCREEN
                            </span>
                            <span className="block bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                DESERVES ART
                            </span>
                        </h1>

                        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Cinematic 8K wallpapers. AI-powered generation. 
                            <span className="text-white/80"> Make every pixel count.</span>
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <button 
                                onClick={handleExplore}
                                className="group relative px-10 py-5 rounded-2xl overflow-hidden hover:opacity-90 transition-opacity"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-600" />
                                <span className="relative font-bold text-lg flex items-center gap-3">
                                    <Play className="w-5 h-5" fill="white" /> {isAuthenticated ? 'Dashboard' : 'Explore Collection'}
                                </span>
                            </button>
                            <button 
                                onClick={handleAIGenerate}
                                className="group px-10 py-5 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300"
                            >
                                <span className="font-bold text-lg flex items-center gap-3 text-white/80 group-hover:text-white transition-colors">
                                    <Sparkles className="w-5 h-5" /> AI Generate
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Featured Wallpapers Grid */}
                    <div className="mb-16">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-bold">
                                <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Trending Now</span>
                            </h2>
                            <button className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-2">
                                View All <span className="text-fuchsia-400">→</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wallpapers.map((wallpaper) => (
                                <div
                                    key={wallpaper.id}
                                    className="group relative aspect-[16/10] rounded-3xl overflow-hidden cursor-pointer"
                                    onMouseEnter={() => setHoveredCard(wallpaper.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    {/* Wallpaper Preview */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${wallpaper.color} transition-transform duration-700 group-hover:scale-110`}>
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
                                        {/* Geometric shapes for visual interest */}
                                        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-white/20 rounded-full animate-pulse" />
                                        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 border border-white/10 rotate-45" />
                                        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/10 rounded-full" />
                                    </div>

                                    {/* Overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${hoveredCard === wallpaper.id ? 'opacity-100' : 'opacity-60'}`} />

                                    {/* Premium Badge */}
                                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-sm flex items-center gap-1.5">
                                        <Crown className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold">PRO</span>
                                    </div>

                                    {/* Content */}
                                    <div className="absolute inset-x-0 bottom-0 p-6">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <span className="text-xs font-medium text-white/60 uppercase tracking-wider">{wallpaper.category}</span>
                                                <h3 className="text-xl font-bold mt-1">{wallpaper.title}</h3>
                                                <div className="flex items-center gap-2 mt-2 text-white/50 text-sm">
                                                    <Download className="w-4 h-4" />
                                                    <span>{wallpaper.downloads}</span>
                                                </div>
                                            </div>
                                            <div className={`flex gap-2 transition-all duration-300 ${hoveredCard === wallpaper.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                                <button
                                                    className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                                                    aria-label="Preview wallpaper"
                                                    title="Preview wallpaper"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    className="w-12 h-12 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 flex items-center justify-center hover:opacity-90 transition-opacity"
                                                    aria-label="Download wallpaper"
                                                    title="Download wallpaper"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
                        {[
                            { value: "10K+", label: "Wallpapers" },
                            { value: "8K", label: "Resolution" },
                            { value: "500K+", label: "Downloads" },
                            { value: "4.9★", label: "Rating" },
                        ].map((stat, i) => (
                            <div key={i} className="text-center p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                                <div className="text-4xl font-black bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-white/40 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-8">
                <div className="container mx-auto px-6 text-center text-white/30 text-sm">
                    © 2026 Wallify. Premium backgrounds for premium setups.
                </div>
            </footer>
        </div>
    )
}

export default Home
