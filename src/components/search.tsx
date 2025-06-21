import { Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { api } from '@/convex/_generated/api'
import { SmileIcon } from 'lucide-react'

export function SearchCommandDialog() {
    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false)
    const results = useQuery(api.get.searchChunks, query.trim() === '' ? 'skip' : { query: query.trim() })

    useEffect(() => {
        const down = (event: KeyboardEvent) => {
            if (event.key === 'j' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

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

    const handleSelect = () => {
        setOpen(false)
    }

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Search your messages..." value={query} onValueChange={setQuery} />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {Object.entries(groupedResults).map(([threadId, { threadTitle, chunks }]) => (
                    <CommandGroup key={threadId} heading={threadTitle}>
                        {chunks.map((chunk, index) => (
                            <Link key={index} to="/$threadId" params={{ threadId: chunk.threadId }}>
                                <CommandItem onSelect={handleSelect}>
                                    <SmileIcon />
                                    <span>{chunk.text}</span>
                                </CommandItem>
                            </Link>
                        ))}
                    </CommandGroup>
                ))}
            </CommandList>
        </CommandDialog>
    )
}
