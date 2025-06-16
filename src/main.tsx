import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/index.css'
import { routeTree } from '@/lib/route-tree.gen'

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key')
}
if (!import.meta.env.VITE_CONVEX_URL) {
    throw new Error('Missing Convex URL')
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <RouterProvider router={router} />
            </ConvexProviderWithClerk>
        </ClerkProvider>
    </StrictMode>
)
