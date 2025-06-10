import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$threadId')({
    component: RouteComponent
})

function RouteComponent() {
    return <div className="w-full pt-8 pb-38">Hello "/$thread"!</div>
}
