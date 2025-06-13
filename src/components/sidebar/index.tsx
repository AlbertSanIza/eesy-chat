import { SignInButton, UserButton } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'

import { AppSidebarContent } from '@/components/sidebar/content'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarFooter, SidebarHeader, SidebarMenuButton } from '@/components/ui/sidebar'
import { Loader2Icon } from 'lucide-react'

export function AppSidebar() {
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
                    <Loader2Icon className="m-2 mb-[15px] size-4 animate-spin" />
                </AuthLoading>
            </SidebarFooter>
        </Sidebar>
    )
}
