import { Link } from '@tanstack/react-router'
import { PlusIcon, SearchIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useGlobal } from '@/lib/zustand/global'

export function AppSidebarTrigger() {
    const { open, isMobile } = useSidebar()
    const setSearchDialogOpen = useGlobal((state) => state.setSearchDialogOpen)

    return (
        <div
            className={cn(
                'fixed top-3 left-3 z-10 mt-3 rounded-lg border bg-sidebar p-1 sm:mt-0 lg:transition-all',
                open && !isMobile ? 'mt-3 border-transparent bg-transparent' : ''
            )}
        >
            <SidebarTrigger className="size-7 text-sidebar-foreground" size="icon" variant="ghost" />
            {(!open || isMobile) && (
                <>
                    <Button size="icon" variant="ghost" className="size-7 transition-none" onClick={() => setSearchDialogOpen(true)}>
                        <SearchIcon />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-7 transition-none" asChild>
                        <Link to="/">
                            <PlusIcon />
                        </Link>
                    </Button>
                </>
            )}
        </div>
    )
}
