import { useMemo } from 'react'

import { AppSidebarMenuItem } from '@/components/sidebar/menu-item'
import { SidebarContent as ShadSidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar'
import type { Doc } from '@/convex/_generated/dataModel'
import { useStore } from '@/lib/store'

interface GroupedThreads {
    [key: string]: Doc<'threads'>[]
}

function getTimeGroup(timestamp: number): string {
    const now = new Date()
    const threadDate = new Date(timestamp)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfYesterday = new Date(startOfToday)
    startOfYesterday.setDate(startOfYesterday.getDate() - 1)
    if (threadDate >= startOfToday) {
        return 'Today'
    } else if (threadDate >= startOfYesterday) {
        return 'Yesterday'
    } else {
        const diff = now.getTime() - threadDate.getTime()
        const dayInMs = 24 * 60 * 60 * 1000
        const weekInMs = 7 * dayInMs
        const monthInMs = 30 * dayInMs
        const yearInMs = 365 * dayInMs
        if (diff < weekInMs) {
            const days = Math.floor(diff / dayInMs)
            return `${days} Days ago`
        } else if (diff < monthInMs) {
            const weeks = Math.floor(diff / weekInMs)
            return weeks === 1 ? '1 Week Ago' : `${weeks} Weeks Ago`
        } else if (diff < yearInMs) {
            const months = Math.floor(diff / monthInMs)
            return months === 1 ? '1 Month Ago' : `${months} Months Ago`
        } else {
            const years = Math.floor(diff / yearInMs)
            return years === 1 ? '1 Year Ago' : `${years} Years Ago`
        }
    }
}

export function AppSidebarContent() {
    const { threads, threadSearch } = useStore()

    const groupedThreads = useMemo(() => {
        if (!threads) {
            return {}
        }

        let filteredThreads = threads
        if (threadSearch && threadSearch.trim()) {
            const searchTerms = threadSearch.trim().toLowerCase().split(/\s+/)
            filteredThreads = threads.filter((thread) => {
                const threadName = thread.name.toLowerCase()
                return searchTerms.every((term) => threadName.includes(term))
            })
        }

        const groups: GroupedThreads = {}
        const pinnedThreads = filteredThreads.filter((thread) => thread.pinned)
        const unpinnedThreads = filteredThreads.filter((thread) => !thread.pinned)
        if (pinnedThreads.length > 0) {
            groups['Pinned'] = pinnedThreads
        }
        unpinnedThreads.forEach((thread) => {
            const group = getTimeGroup(thread.updateTime)
            if (!groups[group]) {
                groups[group] = []
            }
            groups[group].push(thread)
        })
        return groups
    }, [threadSearch, threads])

    const groupOrder = ['Pinned', 'Today', 'Yesterday']
    const sortedGroups = Object.keys(groupedThreads).sort((a, b) => {
        const aIndex = groupOrder.indexOf(a)
        const bIndex = groupOrder.indexOf(b)
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex
        } else if (aIndex !== -1) {
            return -1
        } else if (bIndex !== -1) {
            return 1
        } else {
            return groupedThreads[b][0].updateTime - groupedThreads[a][0].updateTime
        }
    })

    return (
        <ShadSidebarContent>
            {sortedGroups.map((groupTitle) => (
                <SidebarGroup key={groupTitle}>
                    <SidebarGroupLabel>{groupTitle}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {groupedThreads[groupTitle].map((thread) => (
                                <AppSidebarMenuItem key={thread._id} thread={thread} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </ShadSidebarContent>
    )
}
