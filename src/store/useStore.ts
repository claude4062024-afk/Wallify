import { create } from 'zustand'

interface AppState {
    theme: 'light' | 'dark'
    setTheme: (theme: 'light' | 'dark') => void
    user: any | null
    setUser: (user: any | null) => void
}

export const useStore = create<AppState>((set) => ({
    theme: 'light',
    setTheme: (theme) => set({ theme }),
    user: null,
    setUser: (user) => set({ user }),
}))
