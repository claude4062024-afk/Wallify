import { useState } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import {
    Link2,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Trash2,
    ExternalLink,
    Clock,
    Zap,
    AlertCircle,
    Loader2,
} from 'lucide-react'
import {
    useConnections,
    useInitiateConnection,
    useRemoveConnection,
    useTriggerScrape,
    platforms,
    type Connection,
    type ConnectionPlatform,
} from '../hooks/useConnections'
import { useCurrentProject } from '../hooks/useProjects'
import { formatDistanceToNow } from 'date-fns'

// Platform-specific icons
function PlatformIcon({ platform, className }: { platform: ConnectionPlatform; className?: string }) {
    switch (platform) {
        case 'twitter':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            )
        case 'linkedin':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            )
        case 'g2':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.08c-.165.396-.432.72-.792.96-.36.24-.78.36-1.26.36H8.158c-.48 0-.9-.12-1.26-.36-.36-.24-.627-.564-.792-.96-.165-.396-.165-.828 0-1.296l3.6-8.64c.165-.396.432-.72.792-.96.36-.24.78-.36 1.26-.36h.084c.48 0 .9.12 1.26.36.36.24.627.564.792.96l3.6 8.64c.165.468.165.9 0 1.296z" />
                </svg>
            )
        case 'producthunt':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.604 8.4h-3.405V12h3.405c.995 0 1.801-.806 1.801-1.8 0-.995-.806-1.8-1.801-1.8zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.803c2.319 0 4.2 1.88 4.2 4.2 0 2.319-1.881 4.2-4.2 4.2z" />
                </svg>
            )
        default:
            return <Link2 className={className} />
    }
}

function ConnectionCard({
    platform,
    connection,
    onConnect,
    onDisconnect,
    onScan,
    isConnecting,
    isScanning,
}: {
    platform: typeof platforms[number]
    connection: Connection | undefined
    onConnect: () => void
    onDisconnect: () => void
    onScan: () => void
    isConnecting: boolean
    isScanning: boolean
}) {
    const isConnected = connection?.status === 'active'
    const isExpired = connection?.status === 'expired'
    const isPending = connection?.status === 'pending'
    const isRevoked = connection?.status === 'revoked'

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div 
                        className={`w-14 h-14 rounded-xl flex items-center justify-center ${platform.bgColor}`}
                        style={{ color: platform.color }}
                    >
                        <PlatformIcon platform={platform.id} className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{platform.description}</p>
                    </div>
                </div>
            </div>

            {/* Status */}
            {isConnected && connection && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Connected</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                        {connection.account_handle && (
                            <p className="flex items-center gap-2">
                                <span className="text-gray-400">@</span>
                                <span className="font-medium">{connection.account_handle}</span>
                            </p>
                        )}
                        {connection.last_scraped_at && (
                            <p className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span>Last scanned {formatDistanceToNow(new Date(connection.last_scraped_at))} ago</span>
                            </p>
                        )}
                        {connection.scrape_count > 0 && (
                            <p className="flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                <span>{connection.scrape_count} scans completed</span>
                            </p>
                        )}
                    </div>
                </div>
            )}

            {isExpired && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700">Token expired - reconnect to continue</span>
                    </div>
                </div>
            )}

            {isRevoked && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700">Connection revoked - please reconnect</span>
                    </div>
                </div>
            )}

            {isPending && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-sm font-medium text-blue-700">Waiting for authorization...</span>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
                {!isConnected && !isPending && (
                    <button
                        onClick={onConnect}
                        disabled={!platform.available || isConnecting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isConnecting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <Link2 className="w-4 h-4" />
                                {platform.available ? 'Connect' : 'Coming Soon'}
                            </>
                        )}
                    </button>
                )}

                {isConnected && (
                    <>
                        <button
                            onClick={onScan}
                            disabled={isScanning}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    Scan Now
                                </>
                            )}
                        </button>
                        <button
                            onClick={onDisconnect}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Disconnect
                        </button>
                    </>
                )}

                {(isExpired || isRevoked) && (
                    <button
                        onClick={onConnect}
                        disabled={isConnecting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isConnecting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Reconnecting...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Reconnect
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}

export default function Connections() {
    const [connectingPlatform, setConnectingPlatform] = useState<ConnectionPlatform | null>(null)
    const [scanningConnection, setScanningConnection] = useState<string | null>(null)

    // Get current project
    const { project, isLoading: projectLoading, hasProjects, hasOrg } = useCurrentProject()
    const projectId = project?.id || ''

    // Fetch connections
    const { data: connections, isLoading: connectionsLoading } = useConnections(projectId)

    // Mutations
    const initiateConnection = useInitiateConnection()
    const removeConnection = useRemoveConnection()
    const triggerScrape = useTriggerScrape()

    const handleConnect = async (platform: ConnectionPlatform) => {
        if (!projectId) return

        setConnectingPlatform(platform)
        try {
            const oauthUrl = await initiateConnection.mutateAsync({ projectId, platform })
            // In production, redirect to OAuth URL
            // window.location.href = oauthUrl
            console.log('OAuth URL:', oauthUrl)
            
            // For demo purposes, show a message
            alert(`OAuth flow would redirect to: ${platform}\n\nIn production, this would open the ${platform} authorization page.`)
        } catch (error) {
            console.error('Failed to initiate connection:', error)
        } finally {
            setConnectingPlatform(null)
        }
    }

    const handleDisconnect = async (connectionId: string) => {
        if (!confirm('Are you sure you want to disconnect this account?')) return

        try {
            await removeConnection.mutateAsync(connectionId)
        } catch (error) {
            console.error('Failed to disconnect:', error)
        }
    }

    const handleScan = async (connectionId: string) => {
        setScanningConnection(connectionId)
        try {
            await triggerScrape.mutateAsync(connectionId)
            // Show success message
            alert('Scan initiated! New testimonials will appear in your dashboard shortly.')
        } catch (error) {
            console.error('Failed to trigger scan:', error)
        } finally {
            setScanningConnection(null)
        }
    }

    const getConnectionForPlatform = (platformId: ConnectionPlatform) => {
        return connections?.find(c => c.platform === platformId)
    }

    return (
        <DashboardLayout>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Connected Accounts</h1>
                <p className="text-muted-foreground mt-1">
                    Connect your social accounts to automatically collect testimonials
                </p>
            </div>

            {/* No Organization State */}
            {!projectLoading && !hasOrg && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-foreground">No organization found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create an organization in Settings to connect your social accounts.
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
                                Create a project in Settings to start connecting your social accounts.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* How It Works */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">How Auto-Collection Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            1
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Connect Accounts</p>
                            <p className="text-sm text-gray-600">Link your social media profiles</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            2
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">We Scan Daily</p>
                            <p className="text-sm text-gray-600">Find mentions & positive reviews</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            3
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">You Approve</p>
                            <p className="text-sm text-gray-600">Review and publish testimonials</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {(connectionsLoading || projectLoading) && hasProjects && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
            )}

            {/* Connections Grid */}
            {!connectionsLoading && !projectLoading && hasProjects && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {platforms.map((platform) => (
                        <ConnectionCard
                            key={platform.id}
                            platform={platform}
                            connection={getConnectionForPlatform(platform.id)}
                            onConnect={() => handleConnect(platform.id)}
                            onDisconnect={() => {
                                const conn = getConnectionForPlatform(platform.id)
                                if (conn) handleDisconnect(conn.id)
                            }}
                            onScan={() => {
                                const conn = getConnectionForPlatform(platform.id)
                                if (conn) handleScan(conn.id)
                            }}
                            isConnecting={connectingPlatform === platform.id}
                            isScanning={scanningConnection === getConnectionForPlatform(platform.id)?.id}
                        />
                    ))}
                </div>
            )}

            {/* Manual Import Section */}
            <div className="mt-12 bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Manual Import</h2>
                <p className="text-gray-600 mb-4">
                    Don't see your platform? You can always add testimonials manually or import from other sources.
                </p>
                <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        Import CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        Add Manual Testimonial
                    </button>
                </div>
            </div>
        </DashboardLayout>
    )
}
