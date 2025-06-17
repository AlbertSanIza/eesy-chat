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
    const VITE_CONVEX_URL = import.meta.env.VITE_CONVEX_URL
    if (!VITE_CONVEX_URL) {
        throw new Error('VITE_CONVEX_URL is not defined in the environment variables.')
    }
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
