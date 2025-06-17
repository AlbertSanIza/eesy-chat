import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/index.css'
import { routeTree } from '@/lib/route-tree.gen'
import { VITE_CLERK_PUBLISHABLE_KEY, VITE_CONVEX_URL } from '@/lib/utils'

const convex = new ConvexReactClient(VITE_CONVEX_URL)
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ClerkProvider publishableKey={VITE_CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <RouterProvider router={router} />
            </ConvexProviderWithClerk>
        </ClerkProvider>
    </StrictMode>
)
