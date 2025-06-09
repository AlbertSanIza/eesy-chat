import { createRouter, RouterProvider } from '@tanstack/react-router'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/index.css'
import { routeTree } from '@/lib/route-tree.gen'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ConvexProvider client={convex}>
            <RouterProvider router={router} />
        </ConvexProvider>
    </StrictMode>
)
