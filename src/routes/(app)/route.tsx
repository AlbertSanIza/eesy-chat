import { createFileRoute, Outlet } from '@tanstack/react-router'

import { Cache } from '@/components/cache'
import { Input } from '@/components/input'
import { AppSidebar } from '@/components/sidebar'
import { AppSidebarTrigger } from '@/components/sidebar/trigger'
import { ThemeToggle } from '@/components/theme/toggle'
import { SidebarProvider } from '@/components/ui/sidebar'

export const Route = createFileRoute('/(app)')({
    component: RouteComponent
})

function RouteComponent() {
    return (
        <SidebarProvider>
            <Cache />
            <AppSidebar />
            <AppSidebarTrigger />
            <ThemeToggle />
            <Outlet />
            <Input />
        </SidebarProvider>
    )
}
