import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/shared/$threadId')({
    component: RouteComponent
})

function RouteComponent() {
    return <div>Hello "/shared"!</div>
}
