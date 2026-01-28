import { Link } from 'react-router-dom'

export default function Privacy() {
    return (
        <div className="min-h-screen bg-background bg-stars flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-3xl bg-molt-surface/50 backdrop-blur-sm border border-border rounded-2xl p-8 sm:p-12 shadow-xl">
                <Link to="/" className="text-amber-500 hover:text-amber-400 mb-8 inline-block transition-colors font-medium">
                    ← Back to Home
                </Link>
                <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
                <div className="prose prose-invert prose-amber max-w-none text-muted-foreground space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
                        <p>Your privacy is important to us. It is Wallify's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. Log Data</h2>
                        <p>When you visit our website, our servers may automatically log the standard data provided by your web browser. It may include your computer's Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. Personal Information</h2>
                        <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
                    </section>
                </div>
            </div>
        </div>
    )
}
