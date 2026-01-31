import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    MessageSquareQuote,
    Link2,
    LayoutGrid,
    Globe,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Testimonials', href: '/testimonials', icon: MessageSquareQuote },
    { name: 'Connections', href: '/connections', icon: Link2 },
    { name: 'Widgets', href: '/widgets', icon: LayoutGrid },
    { name: 'Site Settings', href: '/site-settings', icon: Globe },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
]

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

interface SidebarProps {
    isMobileOpen: boolean
    onMobileClose: () => void
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const { profile, signOut } = useAuth()

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    const handleWallifyClick = () => {
        navigate('/')
        onMobileClose()
    }

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 flex items-center justify-between">
                <button onClick={handleWallifyClick} className="text-2xl font-bold text-amber-500 hover:text-amber-600 transition-colors cursor-pointer">
                    Wallify
                </button>
                {/* Mobile close button */}
                <button
                    type="button"
                    onClick={onMobileClose}
                    className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close mobile menu"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={onMobileClose}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                                ${isActive
                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }
                            `}
                        >
                            <Icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile Section */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 mb-4">
                    {/* Avatar */}
                    {profile?.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={profile.full_name || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-semibold text-sm">
                            {getInitials(profile?.full_name || 'U')}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                            {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {profile?.organization?.name || 'Organization'}
                        </p>
                    </div>
                </div>

                {/* Sign Out Button */}
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/30 transition-all duration-200"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-molt-surface border-r border-border">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={onMobileClose}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 w-64 bg-molt-surface border-r border-border z-50 lg:hidden
                    transform transition-transform duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {sidebarContent}
            </aside>
        </>
    )
}

interface MobileHeaderProps {
    onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
    return (
        <header className="sticky top-0 z-30 lg:hidden bg-molt-surface/80 backdrop-blur-md border-b border-border">
            <div className="flex items-center justify-between px-4 h-16">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <span className="text-xl font-bold text-amber-500">Wallify</span>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>
        </header>
    )
}

interface DashboardLayoutProps {
    children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background bg-stars">
            <Sidebar
                isMobileOpen={isMobileMenuOpen}
                onMobileClose={() => setIsMobileMenuOpen(false)}
            />
            <MobileHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

            {/* Main Content */}
            <main className="lg:pl-64">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
