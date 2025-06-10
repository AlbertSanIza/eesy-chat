import { Link } from '@tanstack/react-router'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenuButton, SidebarRail } from '@/components/ui/sidebar'
import { api } from '@/convex/_generated/api'

import { useCachedQuery } from '@/hooks/use-cached-query'

export function AppSidebar() {
    const threads = useCachedQuery(api.threads.findAll)

    return (
        <Sidebar>
            <SidebarHeader>
                <h1 className="my-1 border-b border-transparent text-center text-xl font-bold">eesy.chat</h1>
                <Button asChild>
                    <Link to="/">New Chat</Link>
                </Button>
            </SidebarHeader>
            <SidebarContent>
                <div className="bg-orange-50 whitespace-pre-wrap">{JSON.stringify(threads, null, 2)}</div>
            </SidebarContent>
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
