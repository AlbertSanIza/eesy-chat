import { Link } from '@tanstack/react-router'

import { AppSidebarContent } from '@/components/sidebar/content'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarFooter, SidebarHeader, SidebarMenuButton, SidebarRail, useSidebar } from '@/components/ui/sidebar'

export function AppSidebar() {
    const sidebar = useSidebar()

    return (
        <Sidebar variant="floating">
            <SidebarHeader>
                <h1 className="my-2 border-transparent text-center text-xl font-light">eesy.chat</h1>
                <Button asChild>
                    <Link to="/">New Chat</Link>
                </Button>
            </SidebarHeader>
            <AppSidebarContent />
            <SidebarFooter>
                <SidebarMenuButton size="lg" asChild>
                    <Link to="/">
                        <Avatar>
                            <AvatarImage src="https://github.com/albertsaniza.png" alt="@albertsaniza" />
                            <AvatarFallback>AS</AvatarFallback>
                        </Avatar>
                        Albert Sanchez
                    </Link>
                </SidebarMenuButton>
            </SidebarFooter>
            {sidebar.state === 'expanded' && <SidebarRail />}
        </Sidebar>
    )
}
