import { useState, useEffect, useRef, useMemo } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import {
    Palette,
    LayoutGrid,
    Globe,
    Code,
    Save,
    RefreshCw,
    CheckCircle2,
    ExternalLink,
    Copy,
    Loader2,
    AlertCircle,
    Image,
    Type,
    Eye,
    Upload,
    X,
    Check,
} from 'lucide-react'
import {
    useSiteSettings,
    useUpdateSiteSettings,
    useTriggerBuild,
    useCreateSiteSettings,
    useUploadLogo,
    useUploadFavicon,
    useVerifyDomain,
    flattenSiteSettings,
    defaultFlattenedConfig,
    type FlattenedSiteConfig,
    type LayoutStyle,
    type CardStyle,
    type AnimationStyle,
    type FontFamily,
} from '../hooks/useSiteSettings'
import { useCurrentProject } from '../hooks/useProjects'

// Color presets
const colorPresets = [
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Red', value: '#EF4444' },
]

const fontOptions: { value: FontFamily; label: string }[] = [
    { value: 'inter', label: 'Inter' },
    { value: 'manrope', label: 'Manrope' },
    { value: 'roboto', label: 'Roboto' },
    { value: 'poppins', label: 'Poppins' },
    { value: 'playfair', label: 'Playfair Display' },
    { value: 'satoshi', label: 'Satoshi' },
]

const layoutOptions: { value: LayoutStyle; label: string; description: string }[] = [
    { value: 'grid', label: 'Grid', description: 'Fixed columns layout' },
    { value: 'masonry', label: 'Masonry', description: 'Pinterest-style layout' },
    { value: 'carousel', label: 'Carousel', description: 'Horizontal scrolling' },
    { value: 'list', label: 'List', description: 'Vertical stack' },
]

const cardStyleOptions: { value: CardStyle; label: string }[] = [
    { value: 'elevated', label: 'Elevated (Shadow)' },
    { value: 'bordered', label: 'Bordered' },
    { value: 'flat', label: 'Flat' },
    { value: 'glassmorphism', label: 'Glassmorphism' },
]

const animationOptions: { value: AnimationStyle; label: string }[] = [
    { value: 'fade-up', label: 'Fade Up' },
    { value: 'fade-in', label: 'Fade In' },
    { value: 'slide-in', label: 'Slide In' },
    { value: 'none', label: 'No Animation' },
]

type TabType = 'branding' | 'layout' | 'domain' | 'advanced'

const tabs: { id: TabType; label: string; icon: typeof Palette }[] = [
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'layout', label: 'Layout', icon: LayoutGrid },
    { id: 'domain', label: 'Domain', icon: Globe },
    { id: 'advanced', label: 'Advanced', icon: Code },
]

export default function SiteSettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('branding')
    const [hasChanges, setHasChanges] = useState(false)
    const [copied, setCopied] = useState(false)
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle')
    const [verificationMessage, setVerificationMessage] = useState('')
    
    // File input refs
    const logoInputRef = useRef<HTMLInputElement>(null)
    const faviconInputRef = useRef<HTMLInputElement>(null)

    // Get current project
    const { project, isLoading: projectLoading, hasProjects, hasOrg } = useCurrentProject()
    const projectId = project?.id || ''

    // Fetch site settings
    const { data: siteSettings, isLoading: settingsLoading, refetch: refetchSettings } = useSiteSettings(projectId)

    // Mutations
    const updateSettings = useUpdateSiteSettings()
    const triggerBuild = useTriggerBuild()
    const createSettings = useCreateSiteSettings()
    const uploadLogo = useUploadLogo()
    const uploadFavicon = useUploadFavicon()
    const verifyDomain = useVerifyDomain()

    // Derive config from settings - use memo to avoid recalculation
    const derivedConfig = useMemo(() => {
        if (siteSettings) {
            return flattenSiteSettings(siteSettings)
        } else if (project && !settingsLoading) {
            return {
                ...defaultFlattenedConfig,
                company_name: project.name,
            }
        }
        return defaultFlattenedConfig
    }, [siteSettings, project, settingsLoading])

    const [localConfig, setLocalConfig] = useState<Partial<FlattenedSiteConfig>>(derivedConfig)

    // Reset local config when derived config changes (e.g., after save)
    const prevDerivedConfigRef = useRef(derivedConfig)
    useEffect(() => {
        // Only update if derivedConfig actually changed (not just a re-render)
        if (derivedConfig !== prevDerivedConfigRef.current && !hasChanges) {
            prevDerivedConfigRef.current = derivedConfig
            setLocalConfig(derivedConfig)
        }
    }, [derivedConfig, hasChanges])

    const config = { ...defaultFlattenedConfig, ...localConfig } as FlattenedSiteConfig

    const handleConfigChange = (updates: Partial<FlattenedSiteConfig>) => {
        setLocalConfig(prev => ({ ...prev, ...updates }))
        setHasChanges(true)
    }

    const handleSave = async () => {
        if (!projectId) return

        try {
            if (siteSettings) {
                await updateSettings.mutateAsync({
                    settingsId: siteSettings.id,
                    updates: localConfig,
                })
            } else {
                await createSettings.mutateAsync({
                    projectId,
                    companyName: config.company_name || project?.name || 'My Company',
                })
            }
            setHasChanges(false)
        } catch (error) {
            console.error('Failed to save settings:', error)
        }
    }

    const handlePublish = async () => {
        if (!siteSettings?.id || !projectId) return

        try {
            // Save changes first
            if (hasChanges) {
                await handleSave()
            }
            // Trigger build with correct parameters
            await triggerBuild.mutateAsync({
                projectId,
                settingsId: siteSettings.id,
            })
            // Refetch to get updated build status
            await refetchSettings()
        } catch (error) {
            console.error('Failed to publish:', error)
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !siteSettings?.id || !projectId) return

        try {
            const result = await uploadLogo.mutateAsync({
                settingsId: siteSettings.id,
                projectId,
                file,
            })
            handleConfigChange({ logo_url: result.url })
            await refetchSettings()
        } catch (error) {
            console.error('Failed to upload logo:', error)
            alert(error instanceof Error ? error.message : 'Failed to upload logo')
        }
    }

    const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !siteSettings?.id || !projectId) return

        try {
            const result = await uploadFavicon.mutateAsync({
                settingsId: siteSettings.id,
                projectId,
                file,
            })
            handleConfigChange({ favicon_url: result.url })
            await refetchSettings()
        } catch (error) {
            console.error('Failed to upload favicon:', error)
            alert(error instanceof Error ? error.message : 'Failed to upload favicon')
        }
    }

    const handleVerifyDomain = async () => {
        if (!siteSettings?.id || !config.custom_domain) return

        setVerificationStatus('verifying')
        setVerificationMessage('')

        try {
            const result = await verifyDomain.mutateAsync({
                settingsId: siteSettings.id,
                domain: config.custom_domain,
            })

            if (result.verified) {
                setVerificationStatus('success')
                setVerificationMessage('Domain verified successfully!')
                await refetchSettings()
            } else {
                setVerificationStatus('failed')
                setVerificationMessage(result.error || 'Domain verification failed. Please check your DNS settings.')
            }
        } catch (error) {
            setVerificationStatus('failed')
            setVerificationMessage(error instanceof Error ? error.message : 'Verification failed')
        }
    }

    const handleCustomDomainChange = async (domain: string) => {
        handleConfigChange({ custom_domain: domain || null, domain_verified: false })
        setVerificationStatus('idle')
        setVerificationMessage('')
    }

    const copySubdomain = () => {
        const subdomain = siteSettings?.subdomain || config.subdomain || project?.name?.toLowerCase().replace(/\s+/g, '-')
        const url = `https://${subdomain}.wallify.com`
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const isLoading = projectLoading || settingsLoading
    const isBuilding = siteSettings?.build_status === 'building'
    const isSaving = updateSettings.isPending || createSettings.isPending

    return (
        <DashboardLayout>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Site Settings</h1>
                    <p className="text-muted-foreground mt-1">
                        Customize your testimonial page appearance and domain
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Draft
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={isBuilding || !hasProjects || triggerBuild.isPending}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isBuilding || triggerBuild.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Building...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Publish Changes
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* No Organization/Project State */}
            {!isLoading && (!hasOrg || !hasProjects) && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-foreground">
                                {!hasOrg ? 'No organization found' : 'No project found'}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create {!hasOrg ? 'an organization' : 'a project'} in Settings to customize your testimonial site.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
            )}

            {/* Main Content */}
            {!isLoading && hasProjects && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Configuration */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                            activeTab === tab.id
                                                ? 'bg-amber-500 text-black'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Branding Tab */}
                        {activeTab === 'branding' && (
                            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                                {/* Company Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        value={config.company_name}
                                        onChange={(e) => handleConfigChange({ company_name: e.target.value })}
                                        placeholder="Your Company"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                    />
                                </div>

                                {/* Tagline */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Tagline
                                    </label>
                                    <input
                                        type="text"
                                        value={config.tagline}
                                        onChange={(e) => handleConfigChange({ tagline: e.target.value })}
                                        placeholder="What our customers say"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                    />
                                </div>

                                {/* Logo Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Logo
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden">
                                            {config.logo_url ? (
                                                <img
                                                    src={config.logo_url}
                                                    alt="Logo"
                                                    className="w-full h-full object-contain rounded-lg"
                                                />
                                            ) : (
                                                <Image className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <input
                                                ref={logoInputRef}
                                                type="file"
                                                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                                onChange={handleLogoUpload}
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => logoInputRef.current?.click()}
                                                disabled={uploadLogo.isPending}
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                            >
                                                {uploadLogo.isPending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Upload className="w-4 h-4" />
                                                )}
                                                Upload Logo
                                            </button>
                                            {config.logo_url && (
                                                <button
                                                    onClick={() => handleConfigChange({ logo_url: null })}
                                                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 cursor-pointer"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">PNG, JPEG, SVG, or WebP. Max 2MB.</p>
                                </div>

                                {/* Favicon Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Favicon
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                                            {config.favicon_url ? (
                                                <img
                                                    src={config.favicon_url}
                                                    alt="Favicon"
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <Image className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <input
                                                ref={faviconInputRef}
                                                type="file"
                                                accept="image/png,image/x-icon,image/svg+xml"
                                                onChange={handleFaviconUpload}
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => faviconInputRef.current?.click()}
                                                disabled={uploadFavicon.isPending}
                                                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm disabled:opacity-50 cursor-pointer"
                                            >
                                                {uploadFavicon.isPending ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Upload className="w-3 h-3" />
                                                )}
                                                Upload
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Primary Color */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Primary Color
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {colorPresets.map((color) => (
                                            <button
                                                key={color.value}
                                                onClick={() => handleConfigChange({ primary_color: color.value })}
                                                className={`w-10 h-10 rounded-lg transition-all cursor-pointer ${
                                                    config.primary_color === color.value
                                                        ? 'ring-2 ring-offset-2 ring-gray-400'
                                                        : 'hover:scale-110'
                                                }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={config.primary_color}
                                            onChange={(e) => handleConfigChange({ primary_color: e.target.value })}
                                            placeholder="#F59E0B"
                                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                        />
                                        <input
                                            type="color"
                                            value={config.primary_color}
                                            onChange={(e) => handleConfigChange({ primary_color: e.target.value })}
                                            className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                                            title="Choose primary color"
                                            aria-label="Primary color picker"
                                        />
                                    </div>
                                </div>

                                {/* Font Family */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        <Type className="w-4 h-4 inline mr-1" />
                                        Heading Font
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {fontOptions.map((font) => (
                                            <button
                                                key={font.value}
                                                onClick={() => handleConfigChange({ font_heading: font.value })}
                                                className={`px-4 py-3 border rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                                    config.font_heading === font.value
                                                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {font.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        <Type className="w-4 h-4 inline mr-1" />
                                        Body Font
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {fontOptions.map((font) => (
                                            <button
                                                key={font.value}
                                                onClick={() => handleConfigChange({ font_body: font.value })}
                                                className={`px-4 py-3 border rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                                    config.font_body === font.value
                                                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {font.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Layout Tab */}
                        {activeTab === 'layout' && (
                            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                                {/* Layout Style */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Layout Style
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {layoutOptions.map((layout) => (
                                            <button
                                                key={layout.value}
                                                onClick={() => handleConfigChange({ layout_style: layout.value })}
                                                className={`p-4 border rounded-xl text-left transition-colors cursor-pointer ${
                                                    config.layout_style === layout.value
                                                        ? 'border-amber-500 bg-amber-50'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <p className="font-medium text-gray-900">{layout.label}</p>
                                                <p className="text-sm text-gray-500">{layout.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Card Style */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Card Style
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {cardStyleOptions.map((style) => (
                                            <button
                                                key={style.value}
                                                onClick={() => handleConfigChange({ card_style: style.value })}
                                                className={`px-4 py-3 border rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                                    config.card_style === style.value
                                                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {style.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Animation Style */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Animation
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {animationOptions.map((anim) => (
                                            <button
                                                key={anim.value}
                                                onClick={() => handleConfigChange({ animation_style: anim.value })}
                                                className={`px-4 py-3 border rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                                    config.animation_style === anim.value
                                                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {anim.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Cards Per Row */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Cards Per Row
                                    </label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => handleConfigChange({ cards_per_row: num })}
                                                className={`w-12 h-12 border rounded-lg font-medium transition-colors cursor-pointer ${
                                                    config.cards_per_row === num
                                                        ? 'border-amber-500 bg-amber-500 text-black'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Toggle Options */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-900">
                                        Display Options
                                    </label>
                                    {[
                                        { key: 'show_avatars', label: 'Show author avatars' },
                                        { key: 'show_ratings', label: 'Show star ratings' },
                                        { key: 'show_company', label: 'Show company names' },
                                        { key: 'show_dates', label: 'Show dates' },
                                        { key: 'show_source_badges', label: 'Show source badges (Twitter, LinkedIn, etc.)' },
                                        { key: 'show_verification_badges', label: 'Show verification badges' },
                                    ].map((option) => (
                                        <label key={option.key} className="flex items-center gap-3 cursor-pointer">
                                            <button
                                                onClick={() => handleConfigChange({
                                                    [option.key]: !config[option.key as keyof FlattenedSiteConfig]
                                                })}
                                                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                    config[option.key as keyof FlattenedSiteConfig]
                                                        ? 'bg-amber-500'
                                                        : 'bg-gray-300'
                                                }`}
                                            >
                                                <span
                                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                                        config[option.key as keyof FlattenedSiteConfig]
                                                            ? 'translate-x-5'
                                                            : 'translate-x-0'
                                                    }`}
                                                />
                                            </button>
                                            <span className="text-gray-700">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Domain Tab */}
                        {activeTab === 'domain' && (
                            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                                {/* Current URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Your Testimonial Page URL
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-mono text-sm">
                                            https://{siteSettings?.subdomain || config.subdomain || project?.name?.toLowerCase().replace(/\s+/g, '-') || 'yourcompany'}.wallify.com/{config.page_path || 'wall'}
                                        </div>
                                        <button
                                            onClick={copySubdomain}
                                            className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            {copied ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <Copy className="w-5 h-5 text-gray-500" />
                                            )}
                                        </button>
                                        {siteSettings?.deployed_url && (
                                            <a
                                                href={siteSettings.deployed_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                                title="Open live site"
                                            >
                                                <ExternalLink className="w-5 h-5 text-gray-500" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Page Path / Route */}
                                <div className="pt-4 border-t border-gray-200">
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Page Path
                                    </label>
                                    <p className="text-sm text-gray-500 mb-3">
                                        The URL path where your testimonials appear
                                    </p>
                                    <div className="flex gap-2 items-center">
                                        <span className="text-gray-500">/</span>
                                        <div className="flex gap-2">
                                            {['wall', 'love', 'testimonials', 'reviews'].map((path) => (
                                                <button
                                                    key={path}
                                                    onClick={() => handleConfigChange({ page_path: path })}
                                                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                                        config.page_path === path
                                                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                            : 'border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    /{path}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-gray-400 mx-2">or</span>
                                        <input
                                            type="text"
                                            value={!['wall', 'love', 'testimonials', 'reviews'].includes(config.page_path || 'wall') ? config.page_path : ''}
                                            onChange={(e) => handleConfigChange({ page_path: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                            placeholder="custom-path"
                                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                </div>

                                {/* Custom Domain */}
                                <div className="pt-4 border-t border-gray-200">
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Custom Domain
                                    </label>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Use your own domain like love.yourcompany.com
                                    </p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={config.custom_domain || ''}
                                            onChange={(e) => handleCustomDomainChange(e.target.value)}
                                            placeholder="love.yourcompany.com"
                                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                        />
                                        {config.custom_domain && !siteSettings?.domain_verified && (
                                            <button
                                                onClick={handleVerifyDomain}
                                                disabled={verifyDomain.isPending || verificationStatus === 'verifying'}
                                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                            >
                                                {verificationStatus === 'verifying' ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                Verify
                                            </button>
                                        )}
                                    </div>

                                    {/* Verification Status */}
                                    {siteSettings?.domain_verified && config.custom_domain && (
                                        <div className="mt-3 flex items-center gap-2 text-green-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-sm font-medium">Domain verified</span>
                                        </div>
                                    )}

                                    {verificationStatus === 'success' && (
                                        <div className="mt-3 flex items-center gap-2 text-green-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-sm">{verificationMessage}</span>
                                        </div>
                                    )}

                                    {verificationStatus === 'failed' && (
                                        <div className="mt-3 flex items-center gap-2 text-red-600">
                                            <AlertCircle className="w-4 h-4" />
                                            <span className="text-sm">{verificationMessage}</span>
                                        </div>
                                    )}
                                </div>

                                {/* DNS Instructions */}
                                {config.custom_domain && !siteSettings?.domain_verified && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 mb-2">DNS Configuration</h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Add one of the following DNS records to verify your domain:
                                        </p>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">Option 1: CNAME Record (Recommended)</p>
                                                <div className="font-mono text-sm bg-white border border-gray-200 rounded p-3">
                                                    <p><span className="text-gray-500">Type:</span> CNAME</p>
                                                    <p><span className="text-gray-500">Host:</span> {config.custom_domain}</p>
                                                    <p><span className="text-gray-500">Value:</span> wallify.pages.dev</p>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">Option 2: TXT Record (Ownership verification)</p>
                                                <div className="font-mono text-sm bg-white border border-gray-200 rounded p-3">
                                                    <p><span className="text-gray-500">Type:</span> TXT</p>
                                                    <p><span className="text-gray-500">Host:</span> _wallify-verification.{config.custom_domain}</p>
                                                    <p><span className="text-gray-500">Value:</span> wallify-verification={siteSettings?.domain_verification_token || 'wallify-' + (siteSettings?.id?.slice(0, 8) || 'pending')}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <p className="text-xs text-gray-500 mt-3">
                                            DNS changes can take up to 48 hours to propagate.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Advanced Tab */}
                        {activeTab === 'advanced' && (
                            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                                {/* Custom CSS */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Custom CSS
                                    </label>
                                    <textarea
                                        value={config.custom_css || ''}
                                        onChange={(e) => handleConfigChange({ custom_css: e.target.value || null })}
                                        placeholder={`/* Add your custom styles */\n.testimonial-card {\n  border-radius: 16px;\n}`}
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                    />
                                </div>

                                {/* Meta Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        SEO Meta Description
                                    </label>
                                    <textarea
                                        value={config.meta_description || ''}
                                        onChange={(e) => handleConfigChange({ meta_description: e.target.value || null })}
                                        placeholder="See what our customers are saying about us..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                    />
                                </div>

                                {/* Meta Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        SEO Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        value={config.meta_title || ''}
                                        onChange={(e) => handleConfigChange({ meta_title: e.target.value || null })}
                                        placeholder="Company Name - Customer Testimonials"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                    />
                                </div>

                                {/* Google Analytics */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Google Analytics Tracking ID
                                    </label>
                                    <input
                                        type="text"
                                        value={config.ga_tracking_id || ''}
                                        onChange={(e) => handleConfigChange({ ga_tracking_id: e.target.value || null })}
                                        placeholder="G-XXXXXXXXXX"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono"
                                    />
                                </div>

                                {/* noindex toggle */}
                                <div className="pt-4 border-t border-gray-200">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <button
                                            onClick={() => handleConfigChange({ noindex: !config.noindex })}
                                            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                config.noindex ? 'bg-amber-500' : 'bg-gray-300'
                                            }`}
                                        >
                                            <span
                                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                                    config.noindex ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                        <div>
                                            <span className="text-gray-900 font-medium">Hide from search engines</span>
                                            <p className="text-sm text-gray-500">Adds noindex meta tag</p>
                                        </div>
                                    </label>
                                </div>

                                {/* Powered By Badge */}
                                <div className="pt-4 border-t border-gray-200">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <button
                                            onClick={() => handleConfigChange({ show_powered_by: !config.show_powered_by })}
                                            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                config.show_powered_by ? 'bg-amber-500' : 'bg-gray-300'
                                            }`}
                                        >
                                            <span
                                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                                    config.show_powered_by ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                        <div>
                                            <span className="text-gray-900 font-medium">Show "Powered by Wallify" badge</span>
                                            <p className="text-sm text-gray-500">Remove on paid plans</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Preview */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="font-medium text-gray-900">Preview</h3>
                                    {siteSettings?.deployed_url && (
                                        <a 
                                            href={siteSettings.deployed_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Full Preview
                                        </a>
                                    )}
                                </div>
                                <div 
                                    className="aspect-[4/5] p-4 overflow-hidden"
                                    style={{ 
                                        backgroundColor: config.background_color,
                                    }}
                                >
                                    {/* Mini Preview */}
                                    <div 
                                        className="bg-white rounded-lg shadow-sm p-3 mb-3"
                                        style={{ borderRadius: config.border_radius }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div 
                                                className="w-8 h-8 rounded-full"
                                                style={{ backgroundColor: config.primary_color + '20' }}
                                            />
                                            <div className="flex-1">
                                                <div className="h-2 bg-gray-200 rounded w-20 mb-1" />
                                                <div className="h-1.5 bg-gray-100 rounded w-16" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="h-1.5 bg-gray-100 rounded w-full" />
                                            <div className="h-1.5 bg-gray-100 rounded w-4/5" />
                                            <div className="h-1.5 bg-gray-100 rounded w-3/5" />
                                        </div>
                                        {config.show_ratings && (
                                            <div className="flex gap-0.5 mt-2">
                                                {[1,2,3,4,5].map(i => (
                                                    <div 
                                                        key={i} 
                                                        className="w-3 h-3 rounded-sm"
                                                        style={{ backgroundColor: config.primary_color }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div 
                                        className="bg-white rounded-lg shadow-sm p-3 mb-3 opacity-75"
                                        style={{ borderRadius: config.border_radius }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div 
                                                className="w-8 h-8 rounded-full"
                                                style={{ backgroundColor: config.primary_color + '20' }}
                                            />
                                            <div className="flex-1">
                                                <div className="h-2 bg-gray-200 rounded w-24 mb-1" />
                                                <div className="h-1.5 bg-gray-100 rounded w-20" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="h-1.5 bg-gray-100 rounded w-full" />
                                            <div className="h-1.5 bg-gray-100 rounded w-5/6" />
                                        </div>
                                    </div>
                                    <div 
                                        className="bg-white rounded-lg shadow-sm p-3 opacity-50"
                                        style={{ borderRadius: config.border_radius }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div 
                                                className="w-8 h-8 rounded-full"
                                                style={{ backgroundColor: config.primary_color + '20' }}
                                            />
                                            <div className="flex-1">
                                                <div className="h-2 bg-gray-200 rounded w-16 mb-1" />
                                                <div className="h-1.5 bg-gray-100 rounded w-12" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Build Status */}
                            {siteSettings && (
                                <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-900">Build Status</span>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                            siteSettings.build_status === 'success'
                                                ? 'bg-green-100 text-green-700'
                                                : siteSettings.build_status === 'building'
                                                ? 'bg-amber-100 text-amber-700'
                                                : siteSettings.build_status === 'failed'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {siteSettings.build_status}
                                        </span>
                                    </div>
                                    {siteSettings.last_build_at && (
                                        <p className="text-xs text-gray-500">
                                            Last built: {new Date(siteSettings.last_build_at).toLocaleString()}
                                        </p>
                                    )}
                                    {siteSettings.last_build_duration_ms && (
                                        <p className="text-xs text-gray-500">
                                            Build time: {(siteSettings.last_build_duration_ms / 1000).toFixed(1)}s
                                        </p>
                                    )}
                                    {siteSettings.deployed_url && (
                                        <a
                                            href={siteSettings.deployed_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 cursor-pointer"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            View Live Site
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
