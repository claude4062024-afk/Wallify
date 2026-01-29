import { useEffect, useRef, useState } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import {
    Eye,
    MousePointerClick,
    TrendingUp,
    TrendingDown,
    LayoutGrid,
    Loader2,
    ArrowUpDown,
    Radio,
    AlertCircle,
} from 'lucide-react'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
import {
    useAnalyticsMetrics,
    useAnalyticsTimeSeries,
    useTestimonialPerformance,
    useSourceBreakdown,
    usePageEngagement,
    type DateRange,
} from '../hooks/useAnalytics'
import { useCurrentProject } from '../hooks/useProjects'

const AMBER_COLORS = ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7', '#d97706']
const CHART_COLORS = {
    views: '#f59e0b',
    clicks: '#8b5cf6',
    conversions: '#10b981',
}

type SortField = 'views' | 'clicks' | 'conversionRate'
type SortOrder = 'asc' | 'desc'

function LoadingSkeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
    )
}

function MetricCard({
    title,
    value,
    trend,
    icon: Icon,
    loading,
}: {
    title: string
    value: string
    trend: number
    icon: typeof Eye
    loading: boolean
}) {
    const isPositive = trend >= 0

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-amber-500" />
                </div>
                {loading ? (
                    <LoadingSkeleton className="w-16 h-5" />
                ) : (
                    <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {isPositive ? '+' : ''}{trend.toFixed(1)}%
                    </div>
                )}
            </div>
            {loading ? (
                <>
                    <LoadingSkeleton className="w-24 h-8 mb-2" />
                    <LoadingSkeleton className="w-20 h-4" />
                </>
            ) : (
                <>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500">{title}</p>
                </>
            )}
        </div>
    )
}

function LiveIndicator() {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <div className="relative">
                <Radio className="w-4 h-4 text-green-600" />
                <div className="absolute inset-0 animate-ping">
                    <Radio className="w-4 h-4 text-green-600 opacity-75" />
                </div>
            </div>
            <span className="text-sm font-medium text-green-700">Live</span>
        </div>
    )
}

function EngagementBar({ engagement }: { engagement: number }) {
    const barRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = barRef.current
        if (!el) return

        const width = Math.min(engagement * 3, 100)
        const color = engagement > 20 ? '#10b981' : engagement > 10 ? '#f59e0b' : '#ef4444'

        el.style.setProperty('--wb-engagement-width', `${width}%`)
        el.style.setProperty('--wb-engagement-color', color)
    }, [engagement])

    return (
        <div className="w-24 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div ref={barRef} className="h-full rounded-full transition-all wb-engagement-bar" />
        </div>
    )
}

export default function Analytics() {
    const [dateRange, setDateRange] = useState<DateRange>('30d')
    const [sortField, setSortField] = useState<SortField>('views')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

    // Get current project from user's organization
    const { project, isLoading: projectLoading, hasProjects, hasOrg } = useCurrentProject()
    const projectId = project?.id || ''

    const { data: metrics, isLoading: metricsLoading } = useAnalyticsMetrics(projectId, dateRange)
    const { data: timeSeries, isLoading: timeSeriesLoading } = useAnalyticsTimeSeries(projectId, dateRange)
    const { data: testimonials, isLoading: testimonialsLoading } = useTestimonialPerformance(projectId, dateRange)
    const { data: sources, isLoading: sourcesLoading } = useSourceBreakdown(projectId, dateRange)
    const { data: pages, isLoading: pagesLoading } = usePageEngagement(projectId, dateRange)

    const dateRangeOptions: { value: DateRange; label: string }[] = [
        { value: '7d', label: 'Last 7 days' },
        { value: '30d', label: 'Last 30 days' },
        { value: '90d', label: 'Last 90 days' },
    ]

    const sortedTestimonials = testimonials?.slice().sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
    })

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
        } else {
            setSortField(field)
            setSortOrder('desc')
        }
    }

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
        return num.toString()
    }

    // Show project loading state
    if (projectLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-500 mt-1">
                        Track how your testimonials are performing.
                    </p>
                </div>
                <LiveIndicator />
            </div>

            {/* Loading State */}
            {projectLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
            )}

            {/* No Organization State */}
            {!projectLoading && !hasOrg && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-foreground">No organization found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create an organization in Settings to view analytics.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* No Project State */}
            {!projectLoading && hasOrg && !hasProjects && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-foreground">No project found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create a project in Settings to view analytics.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Date Range Picker */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
                {dateRangeOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setDateRange(option.value)}
                        disabled={!hasProjects}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                            dateRange === option.value
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <MetricCard
                    title="Total Views"
                    value={metrics ? formatNumber(metrics.totalViews) : '0'}
                    trend={metrics?.viewsTrend || 0}
                    icon={Eye}
                    loading={metricsLoading}
                />
                <MetricCard
                    title="Total Clicks"
                    value={metrics ? formatNumber(metrics.totalClicks) : '0'}
                    trend={metrics?.clicksTrend || 0}
                    icon={MousePointerClick}
                    loading={metricsLoading}
                />
                <MetricCard
                    title="Conversion Rate"
                    value={metrics ? `${metrics.conversionRate.toFixed(1)}%` : '0%'}
                    trend={metrics?.conversionTrend || 0}
                    icon={TrendingUp}
                    loading={metricsLoading}
                />
                <MetricCard
                    title="Active Widgets"
                    value={metrics ? metrics.activeWidgets.toString() : '0'}
                    trend={0}
                    icon={LayoutGrid}
                    loading={metricsLoading}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Line Chart: Views Over Time */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Views Over Time</h2>
                    {timeSeriesLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        </div>
                    ) : timeSeries && timeSeries.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={timeSeries}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return `${date.getMonth() + 1}/${date.getDate()}`
                                    }}
                                />
                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="views"
                                    stroke={CHART_COLORS.views}
                                    strokeWidth={2}
                                    dot={false}
                                    name="Views"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="clicks"
                                    stroke={CHART_COLORS.clicks}
                                    strokeWidth={2}
                                    dot={false}
                                    name="Clicks"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500">No data available</p>
                        </div>
                    )}
                </div>

                {/* Bar Chart: Top Performing Testimonials */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Testimonials by Views</h2>
                    {testimonialsLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        </div>
                    ) : testimonials && testimonials.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={testimonials.slice(0, 5)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis
                                    type="category"
                                    dataKey="authorName"
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    width={100}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Bar dataKey="views" fill={CHART_COLORS.views} radius={[0, 4, 4, 0]} name="Views" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500">No testimonials yet</p>
                        </div>
                    )}
                </div>

                {/* Pie Chart: Testimonial Sources */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Testimonial Sources</h2>
                    {sourcesLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        </div>
                    ) : sources && sources.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={sources}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="count"
                                    nameKey="source"
                                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {sources.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={AMBER_COLORS[index % AMBER_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value, name) => [`${value} testimonials`, name]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500">No source data available</p>
                        </div>
                    )}
                </div>

                {/* Heatmap: Page Engagement */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Engagement by Page</h2>
                    {pagesLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        </div>
                    ) : pages && pages.length > 0 ? (
                        <div className="space-y-3 max-h-[280px] overflow-y-auto">
                            {pages.map((page) => (
                                <div key={page.url} className="flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{page.url}</p>
                                        <p className="text-xs text-gray-500">{page.views} views • {page.clicks} clicks</p>
                                    </div>
                                    <EngagementBar engagement={page.engagement} />
                                    <span className="text-sm font-medium text-gray-600 w-12 text-right">
                                        {page.engagement}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500">No page data available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Testimonials Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Top Performing Testimonials</h2>
                </div>

                {testimonialsLoading ? (
                    <div className="p-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    </div>
                ) : sortedTestimonials && sortedTestimonials.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Author
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Content
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort('views')}
                                            className="flex items-center gap-1 hover:text-gray-900"
                                        >
                                            Views
                                            <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort('clicks')}
                                            className="flex items-center gap-1 hover:text-gray-900"
                                        >
                                            Clicks
                                            <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort('conversionRate')}
                                            className="flex items-center gap-1 hover:text-gray-900"
                                        >
                                            Conversion
                                            <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sortedTestimonials.map((testimonial) => (
                                    <tr key={testimonial.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-semibold text-sm">
                                                    {testimonial.authorName.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-900">{testimonial.authorName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-600 text-sm line-clamp-2 max-w-xs">
                                                "{testimonial.content}"
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-900 font-medium">{formatNumber(testimonial.views)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-900 font-medium">{formatNumber(testimonial.clicks)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                testimonial.conversionRate >= 4
                                                    ? 'bg-green-100 text-green-800'
                                                    : testimonial.conversionRate >= 2
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {testimonial.conversionRate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">No testimonials to display yet</p>
                        <p className="text-sm text-gray-400 mt-1">Start collecting testimonials to see performance data</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
