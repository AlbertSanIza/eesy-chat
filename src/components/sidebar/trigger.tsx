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
                'fixed top-3 left-3 z-10 mt-0 rounded-lg border bg-sidebar p-1 transition-all',
                open && !isMobile ? 'mt-3 border-transparent bg-transparent' : ''
            )}
        >
            <SidebarTrigger className="size-7" size="icon" variant="ghost" />
            {(!open || isMobile) && (
                <Button size="icon" variant="ghost" className="size-7 transition-none" asChild>
                    <Link to="/">
                        <PlusIcon />
                    </Link>
                </Button>
            )}
        </div>
    )
}
