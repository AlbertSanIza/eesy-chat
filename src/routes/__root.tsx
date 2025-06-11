import { Outlet, createRootRoute } from '@tanstack/react-router'

import { Input } from '@/components/input'
import { AppSidebar } from '@/components/sidebar'
import { AppSidebarTrigger } from '@/components/sidebar/trigger'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { SidebarProvider } from '@/components/ui/sidebar'

export const Route = createRootRoute({
    component: RootComponent
})

function RootComponent() {
    return (
        <ThemeProvider>
            <SidebarProvider>
                <AppSidebar />
                <AppSidebarTrigger />
                <ThemeToggle />
                <Outlet />
                <Input />
            </SidebarProvider>
        </ThemeProvider>
    )
}
