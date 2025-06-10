import { Link } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function AppSidebarTrigger() {
    const { open, isMobile } = useSidebar()

    return (
        <div
            className={cn(
                'fixed top-0 left-0 z-10 gap-2 rounded-br-lg border-r border-b bg-sidebar transition-all duration-75 ease-linear',
                open && !isMobile ? 'border-transparent p-0 pt-2 pl-2' : 'p-2'
            )}
        >
            <SidebarTrigger className="size-9" size="icon" variant="ghost" />
            {(!open || isMobile) && (
                <Button size="icon" variant="ghost" asChild>
                    <Link to="/">
                        <PlusIcon className="size-5" />
                    </Link>
                </Button>
            )}
        </div>
    )
}
