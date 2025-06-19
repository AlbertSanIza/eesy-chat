import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Authenticated, Unauthenticated } from 'convex/react'

import { Cache } from '@/components/cache'
import { UndoCache } from '@/components/cache/undo'
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
            <AppSidebar />
            <AppSidebarTrigger />
            <ThemeToggle />
            <Outlet />
            <Input />
            <Authenticated>
                <Cache />
            </Authenticated>
            <Unauthenticated>
                <UndoCache />
            </Unauthenticated>
        </SidebarProvider>
    )
}
