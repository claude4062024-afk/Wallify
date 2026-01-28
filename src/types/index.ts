export interface User {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
}

export interface Wallpaper {
    id: string
    title: string
    description?: string
    url: string
    preview_url: string
    category: string
    artist_id: string
    created_at: string
}
