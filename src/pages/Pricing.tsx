import { useNavigate } from 'react-router-dom'
import { MessageSquareQuote } from 'lucide-react'
import Pricing1 from '@/components/pricing-1'

export default function Pricing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground">
        {/* Navigation (Reused from Home) */}
        <nav className="relative z-50 container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <MessageSquareQuote className="w-5 h-5 text-stone-900" />
                    </div>
                    <span className="text-2xl font-bold text-amber-500 font-display">Wallify</span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                     <button 
                        onClick={() => navigate('/')}
                        className="text-stone-400 hover:text-stone-50 transition-colors font-medium"
                    >
                        Features
                    </button>
                    <button 
                         onClick={() => navigate('/pricing')}
                         className="text-amber-500 font-medium"
                    >
                        Pricing
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/login')}
                        className="hidden md:block px-5 py-2.5 text-sm font-medium text-stone-400 hover:text-stone-50 transition-colors"
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => navigate('/signup')}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold rounded-lg transition-colors"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </nav>

        <Pricing1 />
        
    </div>
  )
}
