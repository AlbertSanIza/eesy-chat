import { SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'
import { Unauthenticated } from 'convex/react'

import { AppSidebarContent } from '@/components/sidebar/content'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarFooter, SidebarHeader, SidebarMenuButton } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/zustand/store'
import { SearchIcon } from 'lucide-react'

export function AppSidebar() {
    const { user, threadSearch, setThreadSearch } = useStore()
    const { isLoaded, isSignedIn } = useUser()

    return (
        <Sidebar variant="floating">
            <SidebarHeader className="pb-0">
                <h1 className="my-1.5 border-transparent text-center text-xl font-light">eesy.chat</h1>
                <Button className="bg-linear-to-t from-primary via-sidebar-accent/10 to-primary" asChild>
                    <Link to="/">New Chat</Link>
                </Button>
                <div className="mx-2 mt-3 flex items-center gap-1 border-b border-sidebar-border pb-1">
                    <SearchIcon className="size-3! min-w-4 text-sidebar-foreground" />
                    <input
                        placeholder="Search your threads..."
                        className="w-full text-sm leading-6 outline-none"
                        value={threadSearch}
                        onChange={(event) => setThreadSearch(event.target.value)}
                    />
                </div>
            </SidebarHeader>
            <AppSidebarContent />
            <SidebarFooter className="relative">
                <div className={cn('clerk-user-button transition-opacity', (!isLoaded || !isSignedIn) && 'opacity-0')}>
                    <UserButton showName />
                </div>
                <div
                    className={cn(
                        'pointer-events-none absolute bottom-[8px] flex items-center gap-2 p-2 transition-opacity',
                        isLoaded || isSignedIn ? 'opacity-0' : 'opacity-100'
                    )}
                >
                    {user.fullName && user.imageUrl ? (
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
                            <Skeleton className="h-5 w-2/3 rounded-full" />
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
