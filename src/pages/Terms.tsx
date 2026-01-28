import { Link } from 'react-router-dom'

export default function Terms() {
    return (
        <div className="min-h-screen bg-background bg-stars flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-3xl bg-molt-surface/50 backdrop-blur-sm border border-border rounded-2xl p-8 sm:p-12 shadow-xl">
                <Link to="/" className="text-amber-500 hover:text-amber-400 mb-8 inline-block transition-colors font-medium">
                    ← Back to Home
                </Link>
                <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
                <div className="prose prose-invert prose-amber max-w-none text-muted-foreground space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Terms</h2>
                        <p>By accessing the website at Wallify, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. Use License</h2>
                        <p>Permission is granted to temporarily download one copy of the materials (information or software) on Wallify's website for personal, non-commercial transitory viewing only.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. Disclaimer</h2>
                        <p>The materials on Wallify's website are provided on an 'as is' basis. Wallify makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                    </section>
                </div>
            </div>
        </div>
    )
}
