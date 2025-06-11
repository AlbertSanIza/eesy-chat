import { createFileRoute } from '@tanstack/react-router'

import Input2 from '@/components/input2'
import Messages from '@/components/messages'

export const Route = createFileRoute('/test/')({
    component: RouteComponent
})

function RouteComponent() {
    return (
        <div className="w-full pt-8 pb-38">
            <Messages />
            <Input2 />
        </div>
    )
}
