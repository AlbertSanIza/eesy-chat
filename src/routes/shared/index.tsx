import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/shared/')({
    component: RouteComponent
})

function RouteComponent() {
    return <Navigate to="/" />
}
