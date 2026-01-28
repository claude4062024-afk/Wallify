import { useState } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import {
    LayoutGrid,
    Plus,
    GalleryHorizontalEnd,
    TicketMinus,
    MessageCircle,
    List,
    Pencil,
    Trash2,
    Code,
    Copy,
    Check,
    Loader2,
} from 'lucide-react'
import { WidgetBuilder } from '../components/widgets/WidgetBuilder'
import {
    useWidgets,
    useCreateWidget,
    useDeleteWidget,
    useToggleWidgetActive,
    generateEmbedCode,
    defaultWidgetConfig,
    type Widget,
    type WidgetType,
    type WidgetConfig,
    type WidgetRule,
} from '../hooks/useWidgets'

// Demo project ID - replace with actual project context
const DEMO_PROJECT_ID = 'demo-project-id'

const typeIcons: Record<WidgetType, typeof LayoutGrid> = {
    grid: LayoutGrid,
    carousel: GalleryHorizontalEnd,
    ticker: TicketMinus,
    story: MessageCircle,
    feed: List,
}

const typeColors: Record<WidgetType, string> = {
    grid: 'bg-blue-500/10 text-blue-500',
    carousel: 'bg-purple-500/10 text-purple-500',
    ticker: 'bg-green-500/10 text-green-500',
    story: 'bg-pink-500/10 text-pink-500',
    feed: 'bg-orange-500/10 text-orange-500',
}

function WidgetCard({
    widget,
    onEdit,
    onDelete,
    onToggleActive,
    onCopyEmbed,
}: {
    widget: Widget
    onEdit: () => void
    onDelete: () => void
    onToggleActive: (isActive: boolean) => void
    onCopyEmbed: () => void
}) {
    const [showEmbedCode, setShowEmbedCode] = useState(false)
    const [copied, setCopied] = useState(false)
    const Icon = typeIcons[widget.type]

    const handleCopy = () => {
        navigator.clipboard.writeText(generateEmbedCode(widget.id))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        onCopyEmbed()
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            {/* Preview Thumbnail */}
            <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${typeColors[widget.type]}`}>
                    <Icon className="w-8 h-8" />
                </div>
                {/* Active Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                    widget.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                }`}>
                    {widget.is_active ? 'Active' : 'Inactive'}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                        <h3 className="font-semibold text-gray-900 truncate">{widget.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${typeColors[widget.type]}`}>
                            <Icon className="w-3 h-3" />
                            {widget.type.charAt(0).toUpperCase() + widget.type.slice(1)}
                        </span>
                    </div>
                    {/* Toggle Switch */}
                    <button
                        onClick={() => onToggleActive(!widget.is_active)}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                            widget.is_active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            widget.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={() => setShowEmbedCode(!showEmbedCode)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Code className="w-4 h-4" />
                        Embed
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Embed Code Dropdown */}
                {showEmbedCode && (
                    <div className="mt-3 p-3 bg-gray-900 rounded-lg relative">
                        <pre className="text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                            {generateEmbedCode(widget.id)}
                        </pre>
                        <button
                            onClick={handleCopy}
                            className={`absolute top-2 right-2 p-1.5 rounded text-xs transition-colors ${
                                copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function Widgets() {
    const [isBuilderOpen, setIsBuilderOpen] = useState(false)
    const [editingWidget, setEditingWidget] = useState<Widget | null>(null)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

    const { data: widgets, isLoading, error } = useWidgets(DEMO_PROJECT_ID)
    const createWidget = useCreateWidget()
    const deleteWidget = useDeleteWidget()
    const toggleActive = useToggleWidgetActive()

    const handleCreateWidget = () => {
        setEditingWidget(null)
        setIsBuilderOpen(true)
    }

    const handleEditWidget = (widget: Widget) => {
        setEditingWidget(widget)
        setIsBuilderOpen(true)
    }

    const handleSaveWidget = (data: { name: string; type: WidgetType; config: WidgetConfig; rules: WidgetRule[] }) => {
        if (editingWidget) {
            // Update existing widget - would use useUpdateWidget mutation
            console.log('Update widget:', editingWidget.id, data)
        } else {
            createWidget.mutate({
                name: data.name,
                type: data.type,
                project_id: DEMO_PROJECT_ID,
                config: data.config as unknown as Record<string, unknown>,
                rules: data.rules as unknown as Record<string, unknown>,
                is_active: true,
            })
        }
        setIsBuilderOpen(false)
        setEditingWidget(null)
    }

    const handleDeleteWidget = (id: string) => {
        if (deleteConfirmId === id) {
            deleteWidget.mutate(id)
            setDeleteConfirmId(null)
        } else {
            setDeleteConfirmId(id)
            setTimeout(() => setDeleteConfirmId(null), 3000)
        }
    }

    const handleToggleActive = (id: string, isActive: boolean) => {
        toggleActive.mutate({ id, isActive })
    }

    return (
        <DashboardLayout>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Widgets</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage display widgets for your testimonials.
                    </p>
                </div>
                <button
                    onClick={handleCreateWidget}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Create Widget
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                    <p className="text-red-400">Failed to load widgets. Please try again.</p>
                </div>
            )}

            {/* Widgets Grid */}
            {!isLoading && !error && widgets && widgets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {widgets.map((widget) => (
                        <WidgetCard
                            key={widget.id}
                            widget={widget}
                            onEdit={() => handleEditWidget(widget)}
                            onDelete={() => handleDeleteWidget(widget.id)}
                            onToggleActive={(isActive) => handleToggleActive(widget.id, isActive)}
                            onCopyEmbed={() => {}}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && (!widgets || widgets.length === 0) && (
                <>
                    {/* Widget Types Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {(['grid', 'carousel', 'ticker', 'story', 'feed'] as WidgetType[]).map((type) => {
                            const Icon = typeIcons[type]
                            return (
                                <button
                                    key={type}
                                    onClick={handleCreateWidget}
                                    className="bg-molt-surface/50 border border-border rounded-xl p-6 hover:border-amber-500/30 transition-colors text-left group"
                                >
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${typeColors[type]} group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-1 capitalize">{type} Widget</h3>
                                    <p className="text-sm text-muted-foreground">Display testimonials in a {type} layout</p>
                                </button>
                            )
                        })}
                    </div>

                    {/* Empty State CTA */}
                    <div className="bg-molt-surface/50 border border-dashed border-border rounded-xl p-12 text-center">
                        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <LayoutGrid className="w-8 h-8 text-amber-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No widgets created yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Create your first widget to display testimonials on your website.
                        </p>
                        <button
                            onClick={handleCreateWidget}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Widget
                        </button>
                    </div>
                </>
            )}

            {/* Widget Builder Modal */}
            <WidgetBuilder
                isOpen={isBuilderOpen}
                onClose={() => {
                    setIsBuilderOpen(false)
                    setEditingWidget(null)
                }}
                onSave={handleSaveWidget}
                initialData={editingWidget ? {
                    name: editingWidget.name,
                    type: editingWidget.type,
                    config: (editingWidget.config as WidgetConfig) || defaultWidgetConfig,
                    rules: (editingWidget.rules as WidgetRule[]) || [],
                } : undefined}
                widgetId={editingWidget?.id}
            />
        </DashboardLayout>
    )
}
