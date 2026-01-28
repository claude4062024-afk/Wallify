import { useState, useEffect } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { useAuth } from '../hooks/useAuth'
import { useOrganization, useTeamMembers, useUsageStats, useUpdateOrganization, useRemoveMember, useDeleteOrganization } from '../hooks/useOrganization'
import { useProjects, useCreateProject, useDeleteProject, useRegenerateApiKey, useAddDomain, useRemoveDomain } from '../hooks/useProjects'
import { useNotificationPreferences, useUpdateNotificationPreferences, useIntegrations, useConnectOAuthIntegration, useConnectApiIntegration, useDisconnectIntegration, useUpdateProfile, useUploadAvatar } from '../hooks/useSettings'
import {
    User,
    Building2,
    CreditCard,
    FolderKanban,
    Bell,
    Plug,
    Upload,
    Copy,
    Check,
    RefreshCw,
    Plus,
    Trash2,
    X,
    Crown,
    Users,
    AlertTriangle,
    ExternalLink,
    Mail,
    CheckCircle2,
    Loader2,
} from 'lucide-react'

type TabType = 'profile' | 'organization' | 'projects' | 'billing' | 'integrations' | 'notifications'

interface BillingHistory {
    id: string
    date: string
    amount: number
    status: 'paid' | 'pending' | 'failed'
    invoiceUrl: string
}

// Billing history - would come from Stripe in production
const mockBillingHistory: BillingHistory[] = [
    { id: '1', date: '2026-01-01', amount: 49, status: 'paid', invoiceUrl: '#' },
    { id: '2', date: '2025-12-01', amount: 49, status: 'paid', invoiceUrl: '#' },
    { id: '3', date: '2025-11-01', amount: 49, status: 'paid', invoiceUrl: '#' },
]

const planFeatures = {
    starter: ['Up to 50 testimonials', '2 widgets', '1 team member', 'Basic analytics'],
    growth: ['Up to 500 testimonials', '10 widgets', '5 team members', 'Advanced analytics', 'Priority support'],
    optimization: ['Unlimited testimonials', 'Unlimited widgets', '15 team members', 'AI-powered insights', 'Custom branding', 'API access'],
    enterprise: ['Everything in Optimization', 'Unlimited team members', 'SSO/SAML', 'Dedicated support', 'Custom integrations', 'SLA'],
}

const TIER_PRICES: Record<string, number> = {
    starter: 0,
    growth: 49,
    optimization: 149,
    enterprise: 499,
}

export default function Settings() {
    const { profile, user } = useAuth()
    const [activeTab, setActiveTab] = useState<TabType>('profile')
    const [copiedKey, setCopiedKey] = useState<string | null>(null)
    const [showDeleteOrgModal, setShowDeleteOrgModal] = useState(false)
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState('')
    const [newProjectName, setNewProjectName] = useState('')
    const [newProjectDomain, setNewProjectDomain] = useState('')
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
    const [profileName, setProfileName] = useState(profile?.full_name || '')
    const [orgName, setOrgName] = useState('')
    const [newDomain, setNewDomain] = useState('')
    const [apiKeyInput, setApiKeyInput] = useState<Record<string, string>>({})

    // Fetch data from hooks
    const { data: organization, isLoading: orgLoading, isFetching: orgFetching } = useOrganization()
    const { data: teamMembers, isLoading: membersLoading, isFetching: membersFetching } = useTeamMembers()
    const { data: projects, isLoading: projectsLoading, isFetching: projectsFetching } = useProjects()
    const { data: usageStats } = useUsageStats()
    const { data: notificationPrefs, isLoading: notifLoading, isFetching: notifFetching } = useNotificationPreferences()
    const { data: integrations, isLoading: integrationsLoading, isFetching: integrationsFetching } = useIntegrations()
    
    // Check if user has an organization - if profile loaded but no org_id, they need to create one
    const hasOrg = !!profile?.org_id
    const isOrgActuallyLoading = hasOrg && (orgLoading || orgFetching)
    const isMembersActuallyLoading = hasOrg && (membersLoading || membersFetching)
    const isProjectsActuallyLoading = hasOrg && (projectsLoading || projectsFetching)
    const isNotifActuallyLoading = hasOrg && (notifLoading || notifFetching)
    const isIntegrationsActuallyLoading = hasOrg && (integrationsLoading || integrationsFetching)

    // Mutations
    const updateOrg = useUpdateOrganization()
    const removeMember = useRemoveMember()
    const deleteOrg = useDeleteOrganization()
    const createProject = useCreateProject()
    const deleteProject = useDeleteProject()
    const regenerateApiKey = useRegenerateApiKey()
    const addDomain = useAddDomain()
    const removeDomainMutation = useRemoveDomain()
    const updateProfile = useUpdateProfile()
    const uploadAvatar = useUploadAvatar()
    const updateNotifications = useUpdateNotificationPreferences()
    const connectOAuth = useConnectOAuthIntegration()
    const connectApi = useConnectApiIntegration()
    const disconnectIntegration = useDisconnectIntegration()

    // Initialize form values when data loads
    useEffect(() => {
        if (profile?.full_name) setProfileName(profile.full_name)
    }, [profile?.full_name])

    useEffect(() => {
        if (organization?.name) setOrgName(organization.name)
    }, [organization?.name])

    const tabs = [
        { id: 'profile' as const, name: 'Profile', icon: User },
        { id: 'organization' as const, name: 'Organization', icon: Building2 },
        { id: 'projects' as const, name: 'Projects', icon: FolderKanban },
        { id: 'billing' as const, name: 'Billing', icon: CreditCard },
        { id: 'integrations' as const, name: 'Integrations', icon: Plug },
        { id: 'notifications' as const, name: 'Notifications', icon: Bell },
    ]

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedKey(id)
        setTimeout(() => setCopiedKey(null), 2000)
    }

    const handleSaveProfile = () => {
        updateProfile.mutate({ full_name: profileName })
    }

    const handleSaveOrg = () => {
        updateOrg.mutate({ name: orgName })
    }

    const handleCreateProject = () => {
        if (newProjectName.trim()) {
            createProject.mutate(
                { name: newProjectName, initialDomain: newProjectDomain || undefined },
                {
                    onSuccess: () => {
                        setShowCreateProjectModal(false)
                        setNewProjectName('')
                        setNewProjectDomain('')
                    },
                }
            )
        }
    }

    const handleDeleteOrg = () => {
        if (deleteConfirmText === 'delete my organization') {
            deleteOrg.mutate()
        }
    }

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            uploadAvatar.mutate(file)
        }
    }

    const handleAddDomain = (projectId: string) => {
        if (newDomain.trim()) {
            addDomain.mutate({ projectId, domain: newDomain })
            setNewDomain('')
        }
    }

    const handleRemoveDomain = (projectId: string, domain: string) => {
        removeDomainMutation.mutate({ projectId, domain })
    }

    const handleConnectIntegration = (integrationId: string, type: string) => {
        if (type === 'oauth') {
            connectOAuth.mutate(integrationId)
        } else {
            const apiKey = apiKeyInput[integrationId]
            if (apiKey?.trim()) {
                connectApi.mutate({ integrationId, apiKey })
                setApiKeyInput(prev => ({ ...prev, [integrationId]: '' }))
            }
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'owner': return 'bg-amber-500/20 text-amber-500'
            case 'admin': return 'bg-blue-500/20 text-blue-500'
            default: return 'bg-gray-500/20 text-gray-400'
        }
    }

    const getBillingStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-500/20 text-green-400'
            case 'pending': return 'bg-yellow-500/20 text-yellow-400'
            default: return 'bg-red-500/20 text-red-400'
        }
    }

    const usageStatsLoading = false // Usage stats are fetched inline, add loading state if needed

    /**
     * Formats large numbers for display with K, M suffixes
     */
    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`
        }
        return num.toString()
    }

    return (
        <DashboardLayout>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account and organization settings.
                </p>
            </div>

            {/* Settings Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Tabs Navigation */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="bg-molt-surface/50 border border-border rounded-xl overflow-hidden">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border last:border-b-0 ${
                                        isActive
                                            ? 'bg-amber-500/10 border-l-2 border-l-amber-500 text-amber-500'
                                            : 'hover:bg-muted/30 text-foreground'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-amber-500' : 'text-muted-foreground'}`} />
                                    <span className="font-medium">{tab.name}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 min-w-0">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="bg-molt-surface/50 border border-border rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-6">Profile Settings</h2>
                            <div className="space-y-6">
                                {/* Avatar Upload */}
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-2xl relative group overflow-hidden">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            profile?.full_name?.charAt(0) || 'U'
                                        )}
                                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                            {uploadAvatar.isPending ? (
                                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                                            ) : (
                                                <Upload className="w-6 h-6 text-white" />
                                            )}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadAvatar.isPending} />
                                        </label>
                                    </div>
                                    <div>
                                        <label className="px-4 py-2 bg-muted/30 hover:bg-muted/50 text-foreground text-sm font-medium rounded-lg transition-colors cursor-pointer">
                                            Change Avatar
                                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadAvatar.isPending} />
                                        </label>
                                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB</p>
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                                    />
                                </div>

                                {/* Email (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                                    <input
                                        type="email"
                                        defaultValue={user?.email || ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Contact support to change your email</p>
                                </div>

                                {/* Role Badge */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getRoleBadgeColor(profile?.role || 'member')}`}>
                                            {profile?.role === 'owner' && <Crown className="w-4 h-4" />}
                                            <span className="capitalize">{profile?.role || 'member'}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="pt-4 border-t border-border">
                                    <button 
                                        onClick={handleSaveProfile}
                                        disabled={updateProfile.isPending}
                                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {updateProfile.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Organization Tab */}
                    {activeTab === 'organization' && (
                        <div className="space-y-6">
                            {!hasOrg ? (
                                <div className="bg-molt-surface/50 border border-dashed border-amber-500/50 rounded-xl p-12 text-center">
                                    <Building2 className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                    <h3 className="font-semibold text-foreground text-lg mb-2">No Organization Found</h3>
                                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                                        Your account doesn't have an organization yet. Create one to start using Wallify.
                                    </p>
                                    <button
                                        onClick={() => {/* TODO: Open create org modal */}}
                                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
                                    >
                                        Create Organization
                                    </button>
                                </div>
                            ) : isOrgActuallyLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                                </div>
                            ) : (
                            <>
                            {/* Organization Info */}
                            <div className="bg-molt-surface/50 border border-border rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-foreground mb-6">Organization Details</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Organization Name</label>
                                        <input
                                            type="text"
                                            value={orgName}
                                            onChange={(e) => setOrgName(e.target.value)}
                                            placeholder="Enter organization name"
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                                        />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">Billing Tier</label>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-500/20 text-purple-400 capitalize">
                                                <Crown className="w-4 h-4" />
                                                {organization?.billing_tier || 'starter'}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">Team Members</label>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400">
                                                <Users className="w-4 h-4" />
                                                {teamMembers?.length || 0} / {usageStats?.teamMembers.limit === -1 ? '∞' : usageStats?.teamMembers.limit || 1}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <button 
                                            onClick={handleSaveOrg}
                                            disabled={updateOrg.isPending}
                                            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {updateOrg.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Team Members */}
                            <div className="bg-molt-surface/50 border border-border rounded-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-foreground">Team Members</h2>
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Invite Member
                                    </button>
                                </div>

                                {isMembersActuallyLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                                    </div>
                                ) : (
                                <div className="space-y-3">
                                    {teamMembers?.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-semibold overflow-hidden">
                                                    {member.avatar_url ? (
                                                        <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        member.full_name?.charAt(0) || '?'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{member.full_name || 'Unknown'}</p>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(member.role)}`}>
                                                    {member.role}
                                                </span>
                                                {member.role !== 'owner' && (
                                                    <button
                                                        onClick={() => removeMember.mutate(member.id)}
                                                        disabled={removeMember.isPending}
                                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Remove member"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                )}
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-red-400">Danger Zone</h3>
                                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                                            Once you delete an organization, there is no going back. All data will be permanently removed.
                                        </p>
                                        <button
                                            onClick={() => setShowDeleteOrgModal(true)}
                                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-lg transition-colors text-sm"
                                        >
                                            Delete Organization
                                        </button>
                                    </div>
                                </div>
                            </div>
                            </>
                            )}
                        </div>
                    )}

                    {/* Projects Tab */}
                    {activeTab === 'projects' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-foreground">Projects</h2>
                                <button
                                    onClick={() => setShowCreateProjectModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Project
                                </button>
                            </div>

                            {!hasOrg ? (
                                <div className="bg-molt-surface/50 border border-dashed border-amber-500/50 rounded-xl p-12 text-center">
                                    <FolderKanban className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                    <h3 className="font-semibold text-foreground mb-2">Create an organization first</h3>
                                    <p className="text-sm text-muted-foreground">You need to create an organization before you can create projects.</p>
                                </div>
                            ) : isProjectsActuallyLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                                </div>
                            ) : projects?.length === 0 ? (
                                <div className="bg-molt-surface/50 border border-dashed border-border rounded-xl p-12 text-center">
                                    <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="font-semibold text-foreground mb-2">No projects yet</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Create your first project to start collecting testimonials.</p>
                                    <button
                                        onClick={() => setShowCreateProjectModal(true)}
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm"
                                    >
                                        Create Project
                                    </button>
                                </div>
                            ) : (
                            projects?.map((project) => (
                                <div key={project.id} className="bg-molt-surface/50 border border-border rounded-xl p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-foreground text-lg">{project.name}</h3>
                                            <p className="text-sm text-muted-foreground">Created {new Date(project.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteProject.mutate(project.id)}
                                            disabled={deleteProject.isPending}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                            title="Delete project"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* API Key */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-foreground mb-2">API Key</label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-mono text-muted-foreground truncate">
                                                {project.api_key}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(project.api_key, project.id)}
                                                className={`p-2.5 rounded-lg transition-colors ${
                                                    copiedKey === project.id
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-muted/30 text-muted-foreground hover:text-foreground'
                                                }`}
                                                title="Copy API key"
                                            >
                                                {copiedKey === project.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => regenerateApiKey.mutate(project.id)}
                                                disabled={regenerateApiKey.isPending}
                                                className="p-2.5 bg-muted/30 text-muted-foreground hover:text-foreground rounded-lg transition-colors disabled:opacity-50"
                                                title="Regenerate API key"
                                            >
                                                <RefreshCw className={`w-4 h-4 ${regenerateApiKey.isPending ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Domain Whitelist */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Allowed Domains</label>
                                        <div className="flex flex-wrap gap-2">
                                            {project.domain_whitelist?.map((domain, i) => (
                                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full text-sm">
                                                    {domain}
                                                    <button 
                                                        onClick={() => handleRemoveDomain(project.id, domain)}
                                                        className="text-muted-foreground hover:text-red-400 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="text"
                                                    placeholder="domain.com"
                                                    value={newDomain}
                                                    onChange={(e) => setNewDomain(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddDomain(project.id)}
                                                    className="w-32 px-2 py-1 text-sm bg-background border border-dashed border-border rounded-full focus:border-amber-500 focus:outline-none"
                                                />
                                                <button 
                                                    onClick={() => handleAddDomain(project.id)}
                                                    className="p-1 text-amber-500 hover:bg-amber-500/10 rounded-full transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                            )}
                        </div>
                    )}

                    {/* Billing Tab */}
                    {activeTab === 'billing' && (
                        <div className="space-y-6">
                            {/* Current Plan */}
                            <div className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 border border-purple-500/30 rounded-xl p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Current Plan</p>
                                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                            <Crown className="w-6 h-6 text-amber-500" />
                                            {organization?.billing_tier ? organization.billing_tier.charAt(0).toUpperCase() + organization.billing_tier.slice(1) : 'Free'}
                                        </h2>
                                        <p className="text-3xl font-bold text-foreground mt-2">
                                            ${TIER_PRICES[organization?.billing_tier || 'starter']}
                                            <span className="text-lg font-normal text-muted-foreground">/month</span>
                                        </p>
                                    </div>
                                    <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors">
                                        Upgrade Plan
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6">
                                    {planFeatures[organization?.billing_tier || 'starter']?.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                            <span className="text-foreground">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Usage Metrics */}
                            <div className="bg-molt-surface/50 border border-border rounded-xl p-6">
                                <h3 className="font-semibold text-foreground mb-4">Usage This Month</h3>
                                {usageStatsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                                    </div>
                                ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 bg-background/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">Testimonials</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {usageStats?.testimonials.used ?? 0} 
                                            <span className="text-sm font-normal text-muted-foreground"> / {usageStats?.testimonials.limit ?? 100}</span>
                                        </p>
                                        <div className="w-full h-2 bg-muted rounded-full mt-2">
                                            <div 
                                                className="h-full bg-amber-500 rounded-full transition-all" 
                                                style={{ width: `${Math.min((usageStats?.testimonials.used ?? 0) / (usageStats?.testimonials.limit ?? 100) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-background/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">Widgets</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {usageStats?.widgets.used ?? 0} 
                                            <span className="text-sm font-normal text-muted-foreground"> / {usageStats?.widgets.limit ?? 5}</span>
                                        </p>
                                        <div className="w-full h-2 bg-muted rounded-full mt-2">
                                            <div 
                                                className="h-full bg-amber-500 rounded-full transition-all" 
                                                style={{ width: `${Math.min((usageStats?.widgets.used ?? 0) / (usageStats?.widgets.limit ?? 5) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-background/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">Monthly Views</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {formatNumber(usageStats?.monthlyViews.used ?? 0)} 
                                            <span className="text-sm font-normal text-muted-foreground"> / {formatNumber(usageStats?.monthlyViews.limit ?? 10000)}</span>
                                        </p>
                                        <div className="w-full h-2 bg-muted rounded-full mt-2">
                                            <div 
                                                className="h-full bg-amber-500 rounded-full transition-all" 
                                                style={{ width: `${Math.min((usageStats?.monthlyViews.used ?? 0) / (usageStats?.monthlyViews.limit ?? 10000) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                )}
                            </div>

                            {/* Billing History */}
                            <div className="bg-molt-surface/50 border border-border rounded-xl p-6">
                                <h3 className="font-semibold text-foreground mb-4">Billing History</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Invoice</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mockBillingHistory.map((item) => (
                                                <tr key={item.id} className="border-b border-border last:border-b-0">
                                                    <td className="py-3 px-4 text-sm text-foreground">{item.date}</td>
                                                    <td className="py-3 px-4 text-sm text-foreground">${item.amount}.00</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getBillingStatusColor(item.status)}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <a href={item.invoiceUrl} className="text-amber-500 hover:text-amber-400 text-sm flex items-center gap-1">
                                                            Download <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Integrations Tab */}
                    {activeTab === 'integrations' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-foreground">Available Integrations</h2>
                            {!hasOrg ? (
                                <div className="bg-molt-surface/50 border border-dashed border-amber-500/50 rounded-xl p-12 text-center">
                                    <Plug className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                    <h3 className="font-semibold text-foreground mb-2">Create an organization first</h3>
                                    <p className="text-sm text-muted-foreground">You need to create an organization to connect integrations.</p>
                                </div>
                            ) : isIntegrationsActuallyLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                                </div>
                            ) : !integrations?.length ? (
                                <div className="bg-molt-surface/50 border border-dashed border-border rounded-xl p-12 text-center">
                                    <Plug className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="font-semibold text-foreground mb-2">No integrations available</h3>
                                    <p className="text-sm text-muted-foreground">Integrations will appear here when available.</p>
                                </div>
                            ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {integrations?.map((integration) => (
                                    <div key={integration.id} className="bg-molt-surface/50 border border-border rounded-xl p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-border">
                                                    <Plug className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">{integration.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {integration.connected ? (
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                                <span className="inline-flex items-center gap-1.5 text-sm text-green-400">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Connected
                                                </span>
                                                <button 
                                                    onClick={() => disconnectIntegration.mutate(integration.id)}
                                                    disabled={disconnectIntegration.isPending}
                                                    className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {disconnectIntegration.isPending ? 'Disconnecting...' : 'Disconnect'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="mt-4 pt-4 border-t border-border">
                                                {integration.type === 'oauth' ? (
                                                    <button 
                                                        onClick={() => handleConnectIntegration(integration.id, 'oauth')}
                                                        disabled={connectOAuth.isPending}
                                                        className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
                                                    >
                                                        {connectOAuth.isPending ? 'Connecting...' : 'Connect with OAuth'}
                                                    </button>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter API Key"
                                                            value={apiKeyInput[integration.id] || ''}
                                                            onChange={(e) => setApiKeyInput(prev => ({ ...prev, [integration.id]: e.target.value }))}
                                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                        />
                                                        <button 
                                                            onClick={() => handleConnectIntegration(integration.id, 'api')}
                                                            disabled={connectApi.isPending || !apiKeyInput[integration.id]?.trim()}
                                                            className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
                                                        >
                                                            {connectApi.isPending ? 'Connecting...' : 'Connect'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            )}
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="bg-molt-surface/50 border border-border rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-6">Email Notifications</h2>
                            {!hasOrg ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Bell className="w-12 h-12 text-amber-500 mb-4" />
                                    <h3 className="font-semibold text-foreground mb-2">Create an organization first</h3>
                                    <p className="text-sm text-muted-foreground">You need to create an organization to manage notifications.</p>
                                </div>
                            ) : isNotifActuallyLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                                </div>
                            ) : (
                            <div className="space-y-4">
                                {[
                                    { key: 'newTestimonial' as const, icon: Mail, label: 'New testimonial received', description: 'Get notified when a new testimonial is submitted' },
                                    { key: 'lowQualityFlag' as const, icon: AlertTriangle, label: 'Low quality testimonial flagged', description: 'Alerts when AI detects potentially low-quality submissions' },
                                    { key: 'widgetAlerts' as const, icon: Bell, label: 'Widget performance alerts', description: 'Notifications about widget issues or performance drops' },
                                    { key: 'weeklySummary' as const, icon: CreditCard, label: 'Weekly summary email', description: 'A weekly digest of your testimonial performance' },
                                ].map(({ key, icon: Icon, label, description }) => (
                                    <div key={key} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                                        <div className="flex items-start gap-3">
                                            <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="font-medium text-foreground">{label}</p>
                                                <p className="text-sm text-muted-foreground">{description}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const currentValue = notificationPrefs?.[key] ?? false
                                                updateNotifications.mutate({ [key]: !currentValue })
                                            }}
                                            disabled={updateNotifications.isPending}
                                            aria-label={`Toggle ${label}`}
                                            className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
                                                notificationPrefs?.[key] ? 'bg-amber-500' : 'bg-gray-600'
                                            }`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                                notificationPrefs?.[key] ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>
                                ))}

                                <div className="pt-6 border-t border-border">
                                    <p className="text-sm text-muted-foreground">Changes are saved automatically.</p>
                                </div>
                            </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Organization Modal */}
            {showDeleteOrgModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <div className="bg-molt-surface border border-border rounded-xl p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Delete Organization</h3>
                        </div>
                        <p className="text-muted-foreground mb-4">
                            This action cannot be undone. This will permanently delete your organization, all projects, testimonials, and widgets.
                        </p>
                        <p className="text-sm text-foreground mb-2">
                            Type <strong className="text-red-400">delete my organization</strong> to confirm:
                        </p>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground mb-4 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteOrgModal(false); setDeleteConfirmText('') }}
                                className="flex-1 px-4 py-2 bg-muted/30 text-foreground font-medium rounded-lg transition-colors hover:bg-muted/50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteOrg}
                                disabled={deleteConfirmText !== 'delete my organization' || deleteOrg.isPending}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteOrg.isPending ? 'Deleting...' : 'Delete Organization'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Project Modal */}
            {showCreateProjectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <div className="bg-molt-surface border border-border rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Create New Project</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Project Name</label>
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="My Website"
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Initial Domain</label>
                                <input
                                    type="text"
                                    value={newProjectDomain}
                                    onChange={(e) => setNewProjectDomain(e.target.value)}
                                    placeholder="example.com"
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowCreateProjectModal(false); setNewProjectName(''); setNewProjectDomain('') }}
                                className="flex-1 px-4 py-2 bg-muted/30 text-foreground font-medium rounded-lg transition-colors hover:bg-muted/50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateProject}
                                disabled={!newProjectName.trim() || createProject.isPending}
                                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {createProject.isPending ? 'Creating...' : 'Create Project'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Member Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <div className="bg-molt-surface border border-border rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Invite Team Member</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colleague@company.com"
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setInviteRole('member')}
                                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            inviteRole === 'member'
                                                ? 'bg-amber-500 text-black'
                                                : 'bg-muted/30 text-foreground hover:bg-muted/50'
                                        }`}
                                    >
                                        Member
                                    </button>
                                    <button
                                        onClick={() => setInviteRole('admin')}
                                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            inviteRole === 'admin'
                                                ? 'bg-amber-500 text-black'
                                                : 'bg-muted/30 text-foreground hover:bg-muted/50'
                                        }`}
                                    >
                                        Admin
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowInviteModal(false); setInviteEmail(''); setInviteRole('member') }}
                                className="flex-1 px-4 py-2 bg-muted/30 text-foreground font-medium rounded-lg transition-colors hover:bg-muted/50"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={!inviteEmail.includes('@')}
                                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
