import type { FunctionReturnType } from 'convex/server'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { api } from '@/convex/_generated/api'

export const useStore = create<{
    user: { fullName?: string; imageUrl?: string }
    threads: FunctionReturnType<typeof api.threads.findAll>
    threadSearch: string
    setUser: ({ fullName, imageUrl }: { fullName?: string; imageUrl?: string }) => void
    setThreads: (threads: FunctionReturnType<typeof api.threads.findAll>) => void
    setThreadSearch: (search: string) => void
}>()(
    persist(
        (set) => ({
            user: {},
            threads: [],
            threadSearch: '',
            setUser: ({ fullName, imageUrl }) => {
                set({ user: { fullName, imageUrl } })
            },
            setThreads: (threads: FunctionReturnType<typeof api.threads.findAll>) => {
                set({ threads })
            },
            setThreadSearch: (search: string) => {
                set({ threadSearch: search })
            }
        }),
        {
            name: 'eesy-chat-store'
        }
    )
)
