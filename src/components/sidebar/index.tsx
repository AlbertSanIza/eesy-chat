import { Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenuButton, SidebarRail } from '@/components/ui/sidebar'
import { api } from '@/convex/_generated/api'

export function AppSidebar() {
    const tasks = useQuery(api.threads.findAll)

    return (
        <Sidebar>
            <SidebarHeader>
                <h1 className="my-1 border-b border-transparent text-center text-xl font-bold">eesy.chat</h1>
                <Button asChild>
                    <Link to="/">New Chat</Link>
                </Button>
            </SidebarHeader>
            <SidebarContent>{JSON.stringify(tasks, null, 2)}</SidebarContent>
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
            <SidebarRail />
        </Sidebar>
    )
}
