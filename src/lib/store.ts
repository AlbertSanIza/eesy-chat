import type { useUser } from '@clerk/clerk-react'
import type { FunctionReturnType } from 'convex/server'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { api } from '@/convex/_generated/api'

export const useStore = create<{
    user: ReturnType<typeof useUser>['user']
    threads: FunctionReturnType<typeof api.threads.findAll>
    setUser: (user: ReturnType<typeof useUser>['user']) => void
    setThreads: (threads: FunctionReturnType<typeof api.threads.findAll>) => void
}>()(
    persist(
        (set) => ({
            user: null,
            threads: [],
            setUser: (user) => {
                set({ user })
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
