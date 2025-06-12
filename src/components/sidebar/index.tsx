import { Link } from '@tanstack/react-router'

import { AppSidebarContent } from '@/components/sidebar/content'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarFooter, SidebarHeader, SidebarMenuButton } from '@/components/ui/sidebar'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

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
                <SignedIn>
                    <div className="clerk-user-button">
                        <UserButton appearance={{ layout: {} }} showName />
                    </div>
                </SignedIn>
                <SignedOut>
                    <SidebarMenuButton size="lg" asChild>
                        <SignInButton />
                    </SidebarMenuButton>
                </SignedOut>
            </SidebarFooter>
        </Sidebar>
    )
}
