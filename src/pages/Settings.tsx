import { DashboardLayout } from '../components/layout/DashboardLayout'
import { useAuth } from '../hooks/useAuth'
import { User, Building2, CreditCard, Key, Bell } from 'lucide-react'

export default function Settings() {
    const { profile } = useAuth()

    const settingsSections = [
        { name: 'Profile', icon: User, description: 'Manage your personal information' },
        { name: 'Organization', icon: Building2, description: 'Organization settings and team' },
        { name: 'Billing', icon: CreditCard, description: 'Manage subscription and payments' },
        { name: 'API Keys', icon: Key, description: 'Manage API access and keys' },
        { name: 'Notifications', icon: Bell, description: 'Email and notification preferences' },
    ]

    return (
        <DashboardLayout>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account and organization settings.
                </p>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Settings Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-molt-surface/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden">
                        {settingsSections.map((section, index) => {
                            const Icon = section.icon
                            return (
                                <button
                                    key={section.name}
                                    className={`w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors ${index === 0 ? 'bg-amber-500/10 border-l-2 border-amber-500' : ''
                                        } ${index !== settingsSections.length - 1 ? 'border-b border-border' : ''}`}
                                >
                                    <Icon className={`w-5 h-5 ${index === 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                                    <div>
                                        <p className={`font-medium ${index === 0 ? 'text-amber-500' : 'text-foreground'}`}>{section.name}</p>
                                        <p className="text-xs text-muted-foreground">{section.description}</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Profile Settings Content */}
                <div className="lg:col-span-2">
                    <div className="bg-molt-surface/50 backdrop-blur-sm border border-border rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-6">Profile Settings</h2>

                        <div className="space-y-6">
                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xl">
                                    {profile?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <button className="px-4 py-2 bg-muted/30 hover:bg-muted/50 text-foreground text-sm font-medium rounded-lg transition-colors">
                                        Change Avatar
                                    </button>
                                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB</p>
                                </div>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                                <input
                                    type="text"
                                    defaultValue={profile?.full_name || ''}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                                <input
                                    type="email"
                                    defaultValue=""
                                    disabled
                                    className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Contact support to change your email</p>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                                <div className="px-4 py-3 bg-background/50 border border-border rounded-lg">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-500 capitalize">
                                        {profile?.role || 'member'}
                                    </span>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="pt-4">
                                <button className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
