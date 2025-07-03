import { Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { api } from '@/convex/_generated/api'
import { useGlobal } from '@/lib/zustand/global'

export function SearchDialog() {
    const [query, setQuery] = useState('')
    const searchDialogOpenRef = useRef(false)
    const searchDialogOpen = useGlobal((state) => state.searchDialogOpen)
    const setSearchDialogOpen = useGlobal((state) => state.setSearchDialogOpen)
    const results = useQuery(api.get.searchChunks, query.trim() === '' ? 'skip' : { query: query.trim() })

    useEffect(() => {
        searchDialogOpenRef.current = searchDialogOpen
    }, [searchDialogOpen])

    useEffect(() => {
        console.log('SearchDialog mounted')
        const down = (event: KeyboardEvent) => {
            if (event.key === 'j' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                setSearchDialogOpen(!searchDialogOpenRef.current)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [setSearchDialogOpen])

    const groupedResults = useMemo(() => {
        if (!results) {
            return {}
        }
        return results.reduce(
            (
                acc: Record<string, { threadTitle: string; chunks: { threadId: string; text: string }[] }>,
                chunk: { threadId: string; threadTitle: string; text: string }
            ) => {
                if (!acc[chunk.threadId]) {
                    acc[chunk.threadId] = { threadTitle: chunk.threadTitle, chunks: [] }
                }
                acc[chunk.threadId].chunks.push({ threadId: chunk.threadId, text: chunk.text })
                return acc
            },
            {}
        )
    }, [results])

    return (
        <CommandDialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
            <CommandInput placeholder="Search your messages..." value={query} onValueChange={setQuery} />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {Object.entries(groupedResults).map(([threadId, { threadTitle, chunks }]) => (
                    <CommandGroup key={threadId} heading={threadTitle}>
                        {chunks.map((chunk, index) => (
                            <Link to="/$threadId" key={index} params={{ threadId: chunk.threadId }}>
                                <CommandItem onSelect={() => setSearchDialogOpen(false)}>{highlightText(chunk.text, query)}</CommandItem>
                            </Link>
                        ))}
                    </CommandGroup>
                ))}
            </CommandList>
        </CommandDialog>
    )
}

function highlightText(text: string, searchQuery: string) {
    if (!searchQuery.trim()) {
        return <span>{text}</span>
    }

    const searchWords = searchQuery
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0)

    if (searchWords.length === 0) {
        return <span>{text}</span>
    }

    const pattern = new RegExp(`(${searchWords.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    const parts = text.split(pattern)

    return (
        <span>
            {parts.map((part, index) => {
                const isMatch = searchWords.some((word) => part.toLowerCase() === word.toLowerCase())
                return isMatch ? (
                    <mark key={index} className="rounded bg-yellow-300 dark:bg-pink-300">
                        {part}
                    </mark>
                ) : (
                    <span key={index}>{part}</span>
                )
            })}
        </span>
    )
}
