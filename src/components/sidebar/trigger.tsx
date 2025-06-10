import { Link } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function AppSidebarTrigger() {
    const { open, isMobile } = useSidebar()

    return (
        <div className={cn('fixed top-1.5 left-1.5 z-10 rounded-lg border bg-sidebar p-0.5', open && !isMobile ? 'border-transparent' : '')}>
            <SidebarTrigger className="size-8" size="icon" variant="ghost" />
            {(!open || isMobile) && (
                <Button size="icon" variant="ghost" className="size-8 transition-none" asChild>
                    <Link to="/">
                        <PlusIcon />
                    </Link>
                </Button>
            )}
        </div>
    )
}
