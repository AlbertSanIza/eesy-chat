import { SignInButton, UserButton } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'

import { AppSidebarContent } from '@/components/sidebar/content'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarFooter, SidebarHeader, SidebarMenuButton } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useCachedUser } from '@/hooks/use-cached-user'

export function AppSidebar() {
    const { user } = useCachedUser()

    return (
        <Sidebar variant="floating">
            <SidebarHeader>
                <h1 className="my-1.5 border-transparent text-center text-xl font-light">eesy.chat</h1>
                <Button asChild>
                    <Link to="/">New Chat</Link>
                </Button>
            </SidebarHeader>
            <AppSidebarContent />
            <SidebarFooter>
                <Authenticated>
                    <div className="clerk-user-button">
                        <UserButton showName />
                    </div>
                </Authenticated>
                <Unauthenticated>
                    <SidebarMenuButton size="lg" className="cursor-pointer" asChild>
                        <SignInButton />
                    </SidebarMenuButton>
                </Unauthenticated>
                <AuthLoading>
                    <div className="pointer-events-none top-0 flex items-center gap-2 p-2 opacity-50">
                        {user ? (
                            <>
                                <Avatar className="size-7">
                                    <AvatarImage src={user.imageUrl} />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <div className="text-sm">{user.fullName}</div>
                            </>
                        ) : (
                            <>
                                <Skeleton className="size-7 min-w-7 rounded-full" />
                                <Skeleton className="h-5 w-2/3 rounded-full" />
                            </>
                        )}
                    </div>
                </AuthLoading>
            </SidebarFooter>
        </Sidebar>
    )
}
