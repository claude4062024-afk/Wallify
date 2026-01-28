import { useAuth } from '../hooks/useAuth'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { MessageSquareQuote, LayoutGrid, BarChart3, TrendingUp } from 'lucide-react'

export default function Dashboard() {
    const { profile } = useAuth()

    const stats = [
        { name: 'Total Testimonials', value: '0', icon: MessageSquareQuote, change: '+0%' },
        { name: 'Active Widgets', value: '0', icon: LayoutGrid, change: '+0%' },
        { name: 'Total Views', value: '0', icon: BarChart3, change: '+0%' },
        { name: 'Conversion Rate', value: '0%', icon: TrendingUp, change: '+0%' },
    ]

    return (
        <DashboardLayout>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                    Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                    Here's what's happening with your testimonials today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div
                            key={stat.name}
                            className="bg-molt-surface/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-amber-500/30 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-amber-500" />
                                </div>
                                <span className="text-xs text-molt-teal font-medium">{stat.change}</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.name}</p>
                        </div>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-molt-surface/50 backdrop-blur-sm border border-border rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button className="p-4 border border-dashed border-border rounded-lg text-center hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group">
                        <MessageSquareQuote className="w-8 h-8 text-muted-foreground group-hover:text-amber-500 mx-auto mb-2 transition-colors" />
                        <p className="font-medium text-foreground">Add Testimonial</p>
                        <p className="text-xs text-muted-foreground mt-1">Manually add a new testimonial</p>
                    </button>
                    <button className="p-4 border border-dashed border-border rounded-lg text-center hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group">
                        <LayoutGrid className="w-8 h-8 text-muted-foreground group-hover:text-amber-500 mx-auto mb-2 transition-colors" />
                        <p className="font-medium text-foreground">Create Widget</p>
                        <p className="text-xs text-muted-foreground mt-1">Design a new display widget</p>
                    </button>
                    <button className="p-4 border border-dashed border-border rounded-lg text-center hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group">
                        <BarChart3 className="w-8 h-8 text-muted-foreground group-hover:text-amber-500 mx-auto mb-2 transition-colors" />
                        <p className="font-medium text-foreground">View Analytics</p>
                        <p className="text-xs text-muted-foreground mt-1">Check performance metrics</p>
                    </button>
                </div>
            </div>

            {/* Recent Activity / Getting Started */}
            <div className="bg-molt-surface/50 backdrop-blur-sm border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Getting Started</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-black font-bold text-sm">1</div>
                        <div className="flex-1">
                            <p className="font-medium text-foreground">Create your first project</p>
                            <p className="text-sm text-muted-foreground">Set up a project to organize your testimonials</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border opacity-60">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold text-sm">2</div>
                        <div className="flex-1">
                            <p className="font-medium text-foreground">Collect testimonials</p>
                            <p className="text-sm text-muted-foreground">Send collection requests or import existing ones</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border opacity-60">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold text-sm">3</div>
                        <div className="flex-1">
                            <p className="font-medium text-foreground">Display with widgets</p>
                            <p className="text-sm text-muted-foreground">Create beautiful widgets to showcase testimonials</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
