import type { FunctionReturnType } from 'convex/server'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { api } from '@/convex/_generated/api'

export const useStore = create<{
    user: { fullName?: string; imageUrl?: string }
    threads: FunctionReturnType<typeof api.threads.findAll>
    setUser: ({ fullName, imageUrl }: { fullName?: string; imageUrl?: string }) => void
    setThreads: (threads: FunctionReturnType<typeof api.threads.findAll>) => void
}>()(
    persist(
        (set) => ({
            user: {},
            threads: [],
            setUser: ({ fullName, imageUrl }) => {
                set({ user: { fullName, imageUrl } })
            },
            setThreads: (threads: FunctionReturnType<typeof api.threads.findAll>) => {
                set({ threads })
            }
        }),
        {
            name: 'eesy-chat-store'
        }
    )
)
