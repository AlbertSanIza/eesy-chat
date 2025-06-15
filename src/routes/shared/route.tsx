import { createFileRoute, Outlet } from '@tanstack/react-router'

import { ThemeToggle } from '@/components/theme/toggle'

export const Route = createFileRoute('/shared')({
    component: RouteComponent
})

function RouteComponent() {
    return (
        <>
            <ThemeToggle />
            <Outlet />
        </>
    )
}
