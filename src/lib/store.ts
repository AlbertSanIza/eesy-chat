import type { useUser } from '@clerk/clerk-react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create<{ user: ReturnType<typeof useUser>['user']; setUser: (user: ReturnType<typeof useUser>['user']) => void }>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => {
                set({ user })
            }
        }),
        {
            name: 'eesy-chat-store'
        }
    )
)
