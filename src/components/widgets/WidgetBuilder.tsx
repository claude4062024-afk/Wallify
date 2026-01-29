import { useEffect, useRef, useState } from 'react'
import {
    X,
    LayoutGrid,
    GalleryHorizontalEnd,
    TicketMinus,
    MessageCircle,
    List,
    ChevronRight,
    ChevronLeft,
    Palette,
    Filter,
    Settings2,
    Code,
    Check,
    Copy,
    Monitor,
    Tablet,
    Smartphone,
    Plus,
    Trash2,
    Star,
    User,
    Building2,
} from 'lucide-react'
import {
    type WidgetType,
    type WidgetConfig,
    type WidgetRule,
    defaultWidgetConfig,
    generateEmbedCode,
} from '../../hooks/useWidgets'

/** Convert hex color to hex with alpha suffix (e.g., #f59e0b → #f59e0b40) */
function toHexWithAlpha(color: string, alphaHex: string): string {
    if (!color.startsWith('#')) return color
    if (color.length === 7) return `${color}${alphaHex}`
    if (color.length === 4) {
        const r = color[1]
        const g = color[2]
        const b = color[3]
        return `#${r}${r}${g}${g}${b}${b}${alphaHex}`
    }
    return color
}

interface WidgetBuilderProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: { name: string; type: WidgetType; config: WidgetConfig; rules: WidgetRule[] }) => void
    initialData?: {
        name: string
        type: WidgetType
        config: WidgetConfig
        rules: WidgetRule[]
    }
    widgetId?: string
}

const templates: { type: WidgetType; name: string; description: string; icon: typeof LayoutGrid }[] = [
    { type: 'grid', name: 'Grid', description: 'Display testimonials in a responsive grid layout. Perfect for dedicated testimonial pages.', icon: LayoutGrid },
    { type: 'carousel', name: 'Carousel', description: 'Rotating testimonials with smooth transitions. Great for hero sections and landing pages.', icon: GalleryHorizontalEnd },
    { type: 'ticker', name: 'Ticker', description: 'Continuously scrolling testimonials. Ideal for social proof bars and announcements.', icon: TicketMinus },
    { type: 'story', name: 'Story', description: 'Full-screen immersive testimonials. Best for mobile-first experiences.', icon: MessageCircle },
    { type: 'feed', name: 'Feed', description: 'Vertical scrolling list. Perfect for sidebars and blog pages.', icon: List },
]

const steps = [
    { id: 1, name: 'Template', icon: LayoutGrid },
    { id: 2, name: 'Appearance', icon: Palette },
    { id: 3, name: 'Filters', icon: Filter },
    { id: 4, name: 'Rules', icon: Settings2 },
    { id: 5, name: 'Embed', icon: Code },
]

export function WidgetBuilder({ isOpen, onClose, onSave, initialData, widgetId }: WidgetBuilderProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [widgetName, setWidgetName] = useState(initialData?.name || '')
    const [selectedType, setSelectedType] = useState<WidgetType>(initialData?.type || 'grid')
    const [config, setConfig] = useState<WidgetConfig>(initialData?.config || defaultWidgetConfig)
    const [rules, setRules] = useState<WidgetRule[]>(initialData?.rules || [])
    const [tagInput, setTagInput] = useState('')
    const [copied, setCopied] = useState(false)
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

    if (!isOpen) return null

    const updateConfig = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) => {
        setConfig(prev => ({ ...prev, [key]: value }))
    }

    const addTag = () => {
        if (tagInput.trim() && !config.filterTags.includes(tagInput.trim())) {
            updateConfig('filterTags', [...config.filterTags, tagInput.trim()])
            setTagInput('')
        }
    }

    const removeTag = (tag: string) => {
        updateConfig('filterTags', config.filterTags.filter(t => t !== tag))
    }

    const addRule = () => {
        const newRule: WidgetRule = {
            id: crypto.randomUUID(),
            condition: 'url_contains',
            value: '',
            action: 'show_tag',
            tagValue: '',
        }
        setRules([...rules, newRule])
    }

    const updateRule = (id: string, updates: Partial<WidgetRule>) => {
        setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r))
    }

    const removeRule = (id: string) => {
        setRules(rules.filter(r => r.id !== id))
    }

    const copyEmbedCode = () => {
        const code = generateEmbedCode(widgetId || 'new-widget-id')
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSave = () => {
        if (!widgetName.trim()) {
            setWidgetName('Untitled Widget')
        }
        onSave({
            name: widgetName.trim() || 'Untitled Widget',
            type: selectedType,
            config,
            rules,
        })
    }

    const canProceed = () => {
        if (currentStep === 1) return !!selectedType
        if (currentStep === 5) return !!widgetName.trim()
        return true
    }

    const getPreviewWidth = () => {
        switch (previewDevice) {
            case 'mobile': return 'max-w-[375px]'
            case 'tablet': return 'max-w-[768px]'
            default: return 'max-w-full'
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {initialData ? 'Edit Widget' : 'Create Widget'}
                        </h2>
                        <p className="text-sm text-gray-500">Step {currentStep} of 5</p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close widget builder"
                        title="Close"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between max-w-3xl mx-auto">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <button
                                    onClick={() => setCurrentStep(step.id)}
                                    aria-label={`Go to step ${step.id}: ${step.name}`}
                                    title={step.name}
                                    className={`flex flex-col items-center gap-1 transition-colors ${
                                        currentStep === step.id
                                            ? 'text-amber-600'
                                            : currentStep > step.id
                                            ? 'text-green-600'
                                            : 'text-gray-400'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                                        currentStep === step.id
                                            ? 'border-amber-500 bg-amber-50'
                                            : currentStep > step.id
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 bg-white'
                                    }`}>
                                        {currentStep > step.id ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <step.icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className="text-xs font-medium hidden sm:block">{step.name}</span>
                                </button>
                                {index < steps.length - 1 && (
                                    <div className={`w-12 sm:w-20 h-0.5 mx-2 ${
                                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Left Panel - Form */}
                    <div className="w-full lg:w-1/2 p-4 sm:p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-gray-100">
                        {/* Step 1: Template */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Choose a Template</h3>
                                    <p className="text-sm text-gray-500">Select how you want to display your testimonials</p>
                                </div>
                                <div className="space-y-3">
                                    {templates.map((template) => (
                                        <button
                                            key={template.type}
                                            onClick={() => setSelectedType(template.type)}
                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                                selectedType === template.type
                                                    ? 'border-amber-500 bg-amber-50'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                                    selectedType === template.type
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    <template.icon className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                                                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                                                </div>
                                                {selectedType === template.type && (
                                                    <Check className="w-5 h-5 text-amber-500 mt-1" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Appearance */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Customize Appearance</h3>
                                    <p className="text-sm text-gray-500">Make the widget match your brand</p>
                                </div>

                                {/* Accent Color */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" id="accent-color-label">Accent Color</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={config.accentColor}
                                            onChange={(e) => updateConfig('accentColor', e.target.value)}
                                            aria-labelledby="accent-color-label"
                                            title="Choose accent color"
                                            className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={config.accentColor}
                                            onChange={(e) => updateConfig('accentColor', e.target.value)}
                                            aria-labelledby="accent-color-label"
                                            placeholder="#f59e0b"
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700">Display Options</label>
                                    {[
                                        { key: 'showAvatars' as const, label: 'Show author avatars', icon: User },
                                        { key: 'showRatings' as const, label: 'Show star ratings', icon: Star },
                                        { key: 'showCompanyLogos' as const, label: 'Show company logos', icon: Building2 },
                                    ].map(({ key, label, icon: Icon }) => (
                                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5 text-gray-400" />
                                                <span className="text-sm text-gray-700">{label}</span>
                                            </div>
                                            <button
                                                onClick={() => updateConfig(key, !config[key])}
                                                aria-label={`Toggle ${label}`}
                                                title={config[key] ? `Disable ${label}` : `Enable ${label}`}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${
                                                    config[key] ? 'bg-amber-500' : 'bg-gray-300'
                                                }`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                                    config[key] ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Max Testimonials */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" id="max-testimonials-label">
                                        Max Testimonials: {config.maxTestimonials}
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="20"
                                        value={config.maxTestimonials}
                                        onChange={(e) => updateConfig('maxTestimonials', parseInt(e.target.value))}
                                        aria-labelledby="max-testimonials-label"
                                        title={`${config.maxTestimonials} testimonials`}
                                        className="w-full accent-amber-500"
                                    />
                                </div>

                                {/* Columns */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4].map((cols) => (
                                            <button
                                                key={cols}
                                                onClick={() => updateConfig('columns', cols)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    config.columns === cols
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {cols}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Spacing */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Spacing</label>
                                    <div className="flex gap-2">
                                        {(['compact', 'normal', 'relaxed'] as const).map((spacing) => (
                                            <button
                                                key={spacing}
                                                onClick={() => updateConfig('spacing', spacing)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                                                    config.spacing === spacing
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {spacing}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Border Radius */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                                    <div className="flex gap-2">
                                        {(['none', 'small', 'medium', 'large'] as const).map((radius) => (
                                            <button
                                                key={radius}
                                                onClick={() => updateConfig('borderRadius', radius)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                                                    config.borderRadius === radius
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {radius}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Filters */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Configure Filters</h3>
                                    <p className="text-sm text-gray-500">Control which testimonials appear in this widget</p>
                                </div>

                                {/* Tag Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tags</label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                            placeholder="Add a tag..."
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                        />
                                        <button
                                            onClick={addTag}
                                            className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {config.filterTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {config.filterTags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm"
                                                >
                                                    {tag}
                                                    <button
                                                        onClick={() => removeTag(tag)}
                                                        aria-label={`Remove tag: ${tag}`}
                                                        title={`Remove ${tag}`}
                                                        className="hover:text-amber-900"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {config.filterTags.length === 0 && (
                                        <p className="text-sm text-gray-400">No tags added. All testimonials will be shown.</p>
                                    )}
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                                    <div className="flex gap-2">
                                        {(['approved', 'all'] as const).map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => updateConfig('filterStatus', status)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                                                    config.filterStatus === status
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {status === 'approved' ? 'Approved Only' : 'All Testimonials'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort By */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                    <div className="flex gap-2">
                                        {([
                                            { value: 'newest' as const, label: 'Newest' },
                                            { value: 'highest_quality' as const, label: 'Quality' },
                                            { value: 'random' as const, label: 'Random' },
                                        ]).map(({ value, label }) => (
                                            <button
                                                key={value}
                                                onClick={() => updateConfig('sortBy', value)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    config.sortBy === value
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Rules */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Contextual Rules</h3>
                                    <p className="text-sm text-gray-500">Show different testimonials based on page context</p>
                                </div>

                                {rules.map((rule) => (
                                    <div key={rule.id} className="p-4 bg-gray-50 rounded-xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Rule</span>
                                            <button
                                                onClick={() => removeRule(rule.id)}
                                                aria-label="Remove rule"
                                                title="Remove rule"
                                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <select
                                                value={rule.condition}
                                                onChange={(e) => updateRule(rule.id, { condition: e.target.value as WidgetRule['condition'] })}
                                                aria-label="Condition type"
                                                title="Select condition type"
                                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                                            >
                                                <option value="url_contains">URL contains</option>
                                                <option value="url_equals">URL equals</option>
                                                <option value="referrer_contains">Referrer contains</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={rule.value}
                                                onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                                                placeholder="Value..."
                                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                            <select
                                                value={rule.action}
                                                onChange={(e) => updateRule(rule.id, { action: e.target.value as WidgetRule['action'] })}
                                                aria-label="Action type"
                                                title="Select action type"
                                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                                            >
                                                <option value="show_tag">Show testimonials with tag</option>
                                                <option value="hide_tag">Hide testimonials with tag</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={rule.tagValue}
                                                onChange={(e) => updateRule(rule.id, { tagValue: e.target.value })}
                                                placeholder="Tag name..."
                                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addRule}
                                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-amber-500 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Rule
                                </button>

                                {rules.length === 0 && (
                                    <div className="text-center py-8">
                                        <Settings2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">No rules configured. Widget will show the same testimonials on all pages.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 5: Embed */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Get Embed Code</h3>
                                    <p className="text-sm text-gray-500">Add this code to your website to display the widget</p>
                                </div>

                                {/* Widget Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Widget Name</label>
                                    <input
                                        type="text"
                                        value={widgetName}
                                        onChange={(e) => setWidgetName(e.target.value)}
                                        placeholder="Enter a name for this widget..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm"
                                    />
                                </div>

                                {/* Embed Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Embed Code</label>
                                    <div className="relative">
                                        <pre className="p-4 bg-gray-900 text-gray-100 rounded-xl text-sm overflow-x-auto font-mono">
                                            {generateEmbedCode(widgetId || 'preview-id')}
                                        </pre>
                                        <button
                                            onClick={copyEmbedCode}
                                            className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                                                copied
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                            }`}
                                        >
                                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <h4 className="font-medium text-amber-900 mb-2">Installation Instructions</h4>
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-amber-800">
                                        <li>Copy the embed code above</li>
                                        <li>Paste it into your website's HTML where you want the widget to appear</li>
                                        <li>The widget will automatically load and display your testimonials</li>
                                    </ol>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Preview */}
                    <div className="w-full lg:w-1/2 bg-gray-50 p-4 sm:p-6 flex flex-col overflow-hidden min-h-[300px] lg:min-h-0">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Preview</h3>
                            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
                                {([
                                    { device: 'desktop' as const, icon: Monitor },
                                    { device: 'tablet' as const, icon: Tablet },
                                    { device: 'mobile' as const, icon: Smartphone },
                                ]).map(({ device, icon: Icon }) => (
                                    <button
                                        key={device}
                                        onClick={() => setPreviewDevice(device)}
                                        aria-label={`Preview on ${device}`}
                                        title={`${device.charAt(0).toUpperCase() + device.slice(1)} preview`}
                                        className={`p-2 rounded-md transition-colors ${
                                            previewDevice === device
                                                ? 'bg-amber-500 text-white'
                                                : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <div className={`${getPreviewWidth()} mx-auto bg-white rounded-xl shadow-lg p-6 min-h-[400px]`}>
                                <WidgetPreview type={selectedType} config={config} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                        disabled={currentStep === 1}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentStep === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        {currentStep < 5 ? (
                            <button
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={!canProceed()}
                                className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                disabled={!widgetName.trim()}
                                className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Check className="w-4 h-4" />
                                Save Widget
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Mock testimonial data for preview
const mockTestimonials = [
    { id: 1, name: 'Sarah Chen', title: 'Product Manager', company: 'TechCorp', content: 'This product has completely transformed how we work. Highly recommend!', rating: 5 },
    { id: 2, name: 'Marcus Johnson', title: 'Developer', company: 'StartupXYZ', content: 'Great experience from start to finish. The team is incredibly responsive.', rating: 5 },
    { id: 3, name: 'Emily Davis', title: 'Designer', company: 'DesignStudio', content: 'Beautiful interface and powerful features. Exactly what we needed.', rating: 4 },
    { id: 4, name: 'Alex Rivera', title: 'CEO', company: 'GrowthCo', content: 'Increased our conversion rate by 40%. Incredible ROI.', rating: 5 },
]

function WidgetPreview({ type, config }: { type: WidgetType; config: WidgetConfig }) {
    const previewRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = previewRef.current
        if (!el) return

        const accent = config.accentColor
        el.style.setProperty('--wb-accent', accent)
        el.style.setProperty('--wb-accent-40', toHexWithAlpha(accent, '40'))
        el.style.setProperty('--wb-accent-10', toHexWithAlpha(accent, '10'))
        el.style.setProperty('--wb-columns', `${Math.min(config.columns, 2)}`)
    }, [config.accentColor, config.columns])

    const getBorderRadius = () => {
        switch (config.borderRadius) {
            case 'none': return 'rounded-none'
            case 'small': return 'rounded-lg'
            case 'medium': return 'rounded-xl'
            case 'large': return 'rounded-2xl'
        }
    }

    const getSpacing = () => {
        switch (config.spacing) {
            case 'compact': return 'gap-2 p-3'
            case 'normal': return 'gap-4 p-4'
            case 'relaxed': return 'gap-6 p-6'
        }
    }

    const displayTestimonials = mockTestimonials.slice(0, config.maxTestimonials)

    if (type === 'carousel') {
        return (
            <div ref={previewRef} className="wb-preview space-y-4">
                <div className={`border wb-border-accent ${getBorderRadius()} ${getSpacing()}`}>
                    <div className="flex items-start gap-3">
                        {config.showAvatars && (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold wb-bg-accent">
                                {displayTestimonials[0]?.name.charAt(0)}
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="text-gray-700 text-sm mb-2">{displayTestimonials[0]?.content}</p>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 text-sm">{displayTestimonials[0]?.name}</span>
                                {config.showCompanyLogos && (
                                    <span className="text-gray-400 text-xs">• {displayTestimonials[0]?.company}</span>
                                )}
                            </div>
                            {config.showRatings && (
                                <div className="flex gap-0.5 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3" fill={config.accentColor} stroke={config.accentColor} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-center gap-2">
                    {displayTestimonials.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'wb-dot-active' : 'bg-gray-300'}`} />
                    ))}
                </div>
            </div>
        )
    }

    if (type === 'ticker') {
        return (
            <div ref={previewRef} className="wb-preview overflow-hidden">
                <div className="flex gap-4 animate-pulse">
                    {displayTestimonials.slice(0, 3).map((t) => (
                        <div key={t.id} className={`flex-shrink-0 w-64 border wb-border-accent ${getBorderRadius()} ${getSpacing()}`}>
                            <p className="text-gray-700 text-xs line-clamp-2">{t.content}</p>
                            <p className="text-gray-900 text-xs font-medium mt-2">{t.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (type === 'feed') {
        return (
            <div ref={previewRef} className="wb-preview space-y-3">
                {displayTestimonials.map((t) => (
                    <div key={t.id} className={`border wb-border-accent ${getBorderRadius()} ${getSpacing()}`}>
                        <div className="flex items-center gap-2 mb-2">
                            {config.showAvatars && (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold wb-bg-accent">
                                    {t.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <p className="text-gray-900 text-sm font-medium">{t.name}</p>
                                {config.showCompanyLogos && <p className="text-gray-400 text-xs">{t.company}</p>}
                            </div>
                        </div>
                        <p className="text-gray-700 text-sm">{t.content}</p>
                        {config.showRatings && (
                            <div className="flex gap-0.5 mt-2">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3" fill={config.accentColor} stroke={config.accentColor} />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    if (type === 'story') {
        const t = displayTestimonials[0]
        return (
            <div ref={previewRef} className={`wb-preview h-80 flex flex-col items-center justify-center text-center wb-bg-accent-10 ${getSpacing()} ${getBorderRadius()}`}>
                {config.showAvatars && (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 wb-bg-accent">
                        {t?.name.charAt(0)}
                    </div>
                )}
                <p className="text-gray-700 text-lg italic max-w-xs">"{t?.content}"</p>
                <p className="text-gray-900 font-semibold mt-4">{t?.name}</p>
                {config.showCompanyLogos && <p className="text-gray-500 text-sm">{t?.title}, {t?.company}</p>}
                {config.showRatings && (
                    <div className="flex gap-1 mt-3">
                        {[...Array(t?.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4" fill={config.accentColor} stroke={config.accentColor} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // Default: Grid
    return (
        <div ref={previewRef} className="wb-preview wb-grid gap-4">
            {displayTestimonials.map((t) => (
                <div key={t.id} className={`border wb-border-accent ${getBorderRadius()} ${getSpacing()}`}>
                    <div className="flex items-center gap-2 mb-2">
                        {config.showAvatars && (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold wb-bg-accent">
                                {t.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <p className="text-gray-900 text-xs font-medium">{t.name}</p>
                            {config.showCompanyLogos && <p className="text-gray-400 text-[10px]">{t.company}</p>}
                        </div>
                    </div>
                    <p className="text-gray-700 text-xs line-clamp-3">{t.content}</p>
                    {config.showRatings && (
                        <div className="flex gap-0.5 mt-2">
                            {[...Array(t.rating)].map((_, i) => (
                                <Star key={i} className="w-2.5 h-2.5" fill={config.accentColor} stroke={config.accentColor} />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default WidgetBuilder
