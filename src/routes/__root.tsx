import { Outlet, createRootRoute } from '@tanstack/react-router'

import { AppSidebar } from '@/components/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

export const Route = createRootRoute({
    component: RootComponent
})

function RootComponent() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main>
                <Outlet />
            </main>
        </SidebarProvider>
    )
}
