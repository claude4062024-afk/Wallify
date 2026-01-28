import { DashboardLayout } from '../components/layout/DashboardLayout'
import { BarChart3, TrendingUp, Eye, MousePointerClick } from 'lucide-react'

export default function Analytics() {
    const metrics = [
        { name: 'Total Views', value: '0', icon: Eye, change: '+0%', color: 'amber' },
        { name: 'Widget Clicks', value: '0', icon: MousePointerClick, change: '+0%', color: 'teal' },
        { name: 'Conversion Rate', value: '0%', icon: TrendingUp, change: '+0%', color: 'amber' },
        { name: 'Avg. Time on Widget', value: '0s', icon: BarChart3, change: '+0%', color: 'teal' },
    ]

    return (
        <DashboardLayout>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Analytics</h1>
                <p className="text-muted-foreground mt-1">
                    Track how your testimonials are performing.
                </p>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-2 mb-6">
                {['7d', '30d', '90d', 'All'].map((range) => (
                    <button
                        key={range}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${range === '30d'
                                ? 'bg-amber-500 text-black'
                                : 'bg-muted/30 text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {range}
                    </button>
                ))}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                {metrics.map((metric) => {
                    const Icon = metric.icon
                    return (
                        <div
                            key={metric.name}
                            className="bg-molt-surface/50 backdrop-blur-sm border border-border rounded-xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 ${metric.color === 'amber' ? 'bg-amber-500/10' : 'bg-molt-teal/10'} rounded-lg flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${metric.color === 'amber' ? 'text-amber-500' : 'text-molt-teal'}`} />
                                </div>
                                <span className="text-xs text-molt-teal font-medium">{metric.change}</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                            <p className="text-sm text-muted-foreground">{metric.name}</p>
                        </div>
                    )
                })}
            </div>

            {/* Chart Placeholder */}
            <div className="bg-molt-surface/50 backdrop-blur-sm border border-border rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-6">Performance Over Time</h2>
                <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
                    <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No data available yet</p>
                        <p className="text-sm text-muted-foreground">Start collecting testimonials to see analytics</p>
                    </div>
                </div>
            </div>

            {/* Top Performing Testimonials */}
            <div className="bg-molt-surface/50 backdrop-blur-sm border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Top Performing Testimonials</h2>
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No testimonials to show yet</p>
                </div>
            </div>
        </DashboardLayout>
    )
}
