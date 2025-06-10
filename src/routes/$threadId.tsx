import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$threadId')({
    component: RouteComponent
})

function RouteComponent() {
    return <div>Hello "/$thread"!</div>
}
