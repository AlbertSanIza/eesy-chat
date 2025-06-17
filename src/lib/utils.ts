import type { Doc } from '@/convex/_generated/dataModel'
import { queryOptions, experimental_streamedQuery as streamedQuery } from '@tanstack/react-query'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key')
}
if (!import.meta.env.VITE_CONVEX_URL) {
    throw new Error('Missing Convex URL')
}
if (!import.meta.env.VITE_RAILWAY_API_URL) {
    throw new Error('Missing Railway API URL')
}

export const VITE_CLERK_PUBLISHABLE_KEY: string = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
export const VITE_CONVEX_URL: string = import.meta.env.VITE_CONVEX_URL
export const VITE_RAILWAY_API_URL: string = import.meta.env.VITE_RAILWAY_API_URL

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getConvexSiteUrl() {
    let convexSiteUrl
    if (VITE_CONVEX_URL.includes('.cloud')) {
        convexSiteUrl = VITE_CONVEX_URL.replace(/\.cloud$/, '.site')
    } else {
        const url = new URL(VITE_CONVEX_URL)
        url.port = String(Number(url.port) + 1)
        convexSiteUrl = url.toString()
    }
    return convexSiteUrl
}

export const chatQueryOptions = (message: Doc<'messages'>) =>
    queryOptions({
        queryKey: ['chat', message.threadId.toString(), message._id.toString()],
        queryFn: streamedQuery({
            refetchMode: 'replace',
            queryFn: async function* () {
                const response = await fetch(`${VITE_RAILWAY_API_URL}/connect/${message._id}`)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                const reader = response.body?.getReader()
                const decoder = new TextDecoder()
                if (!reader) {
                    throw new Error('No response body')
                }
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) {
                        break
                    }
                    yield decoder.decode(value, { stream: true })
                }
                return ''
            }
        }),
        staleTime: Infinity
    })
