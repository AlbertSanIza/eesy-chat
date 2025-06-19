import { SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'
import { Unauthenticated } from 'convex/react'
// import { SearchIcon } from 'lucide-react'

import { AppSidebarContent } from '@/components/sidebar/content'
import { AppSidebarSearch } from '@/components/sidebar/search'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarFooter, SidebarHeader, SidebarMenuButton } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/zustand/store'

export function AppSidebar() {
    const { isLoaded, isSignedIn } = useUser()
    const user = useStore((state) => state.user)
    // const threadSearch = useStore((state) => state.threadSearch)
    // const setThreadSearch = useStore((state) => state.setThreadSearch)

    return (
        <Sidebar variant="floating">
            <SidebarHeader className="pb-0">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <h1 className="my-1.5 border-transparent text-center text-xl font-light">eesy.chat</h1>
                    </TooltipTrigger>
                    <TooltipContent side="right">THIS IS NOT THE REAL T3.CHAT BUT JUST A TRIBUTE TO IT</TooltipContent>
                </Tooltip>
                <Button className="bg-linear-to-t from-primary via-sidebar-accent/10 to-primary" asChild>
                    <Link to="/">New Chat</Link>
                </Button>
                {/* <div className="mx-2 mt-3 flex items-center gap-1 border-b border-sidebar-border pb-1">
                    <SearchIcon className="size-3! min-w-4 text-sidebar-foreground" />
                    <input
                        placeholder="Search your threads..."
                        className="w-full text-sm leading-6 outline-none"
                        value={threadSearch}
                        onChange={(event) => setThreadSearch(event.target.value)}
                    />
                </div> */}
                <AppSidebarSearch />
            </SidebarHeader>
            <AppSidebarContent />
            <SidebarFooter className="relative">
                <div className={cn('clerk-user-button transition-opacity', (!isLoaded || !isSignedIn) && 'hidden')}>
                    <UserButton showName />
                </div>
                <div
                    className={cn(
                        'pointer-events-none absolute bottom-[8px] flex items-center gap-2 p-2 transition-opacity',
                        isLoaded || isSignedIn ? 'opacity-0' : 'opacity-100'
                    )}
                >
                    {user.isSignedIn ? (
                        <>
                            <Avatar className="size-7">
                                <AvatarImage src={user.imageUrl} />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div className="text-sm font-normal">{user.fullName}</div>
                        </>
                    ) : (
                        <>
                            <Skeleton className="size-7 min-w-7 rounded-full" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </>
                    )}
                </div>
                <Unauthenticated>
                    <SidebarMenuButton size="lg" className="cursor-pointer" asChild>
                        <SignInButton />
                    </SidebarMenuButton>
                </Unauthenticated>
            </SidebarFooter>
        </Sidebar>
    )
}
