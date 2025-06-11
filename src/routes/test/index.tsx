import { createFileRoute } from '@tanstack/react-router'

import { Input } from '@/components/input'
import { Messages } from '@/components/messages'

export const Route = createFileRoute('/test/')({
    component: RouteComponent
})

function RouteComponent() {
    return (
        <div className="w-full pt-8 pb-38">
            <Messages />
            <Input />
        </div>
    )
}
