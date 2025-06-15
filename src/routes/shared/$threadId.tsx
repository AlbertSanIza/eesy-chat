import { createFileRoute } from '@tanstack/react-router'

import { ThemeToggle } from '@/components/theme/toggle'

export const Route = createFileRoute('/shared/$threadId')({
    component: RouteComponent
})

function RouteComponent() {
    return (
        <>
            <ThemeToggle />
        </>
    )
}
