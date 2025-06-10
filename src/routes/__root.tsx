import { Outlet, createRootRoute } from '@tanstack/react-router'

import { AppSidebar } from '@/components/sidebar'
import { AppSidebarTrigger } from '@/components/sidebar/trigger'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export const Route = createRootRoute({
    component: RootComponent
})

function RootComponent() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <SidebarProvider>
                <AppSidebar />
                <AppSidebarTrigger />
                <SidebarInset>
                    <Outlet />
                </SidebarInset>
            </SidebarProvider>
        </ThemeProvider>
    )
}
