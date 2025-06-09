import { createFileRoute } from '@tanstack/react-router'

import { ThemeToggle } from '@/components/theme-toggle'

export const Route = createFileRoute('/')({
    component: RouteComponent
})

function RouteComponent() {
    return (
        <div>
            <ThemeToggle />
        </div>
    )
}
