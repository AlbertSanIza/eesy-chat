import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import { SearchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Link } from '@tanstack/react-router'

export function AppSidebarSearch() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const results = useQuery(api.get.searchChunks, query.trim() === '' ? 'skip' : { query: query.trim() })

    const handleOpenChange = (open: boolean) => {
        if (open) {
            setQuery('')
        }
        setIsOpen(open)
    }

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
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Search All <SearchIcon />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Search</DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <div className="grid gap-2">
                    <Input type="text" placeholder="Search your messages..." value={query} onChange={(event) => setQuery(event.target.value)} />
                    <div className="flex max-h-[60vh] flex-col gap-1 overflow-auto">
                        {results === undefined && query.trim() !== '' && <div className="text-muted-foreground">Searching...</div>}
                        {results && Object.keys(groupedResults).length === 0 && <div className="text-muted-foreground">No results found.</div>}
                        {results &&
                            Object.entries(groupedResults).map(([threadId, { threadTitle, chunks }]) => (
                                <div key={threadId} className="mb-4">
                                    <div className="mb-1 font-semibold">{threadTitle || 'Untitled Thread'}</div>
                                    <ul className="flex flex-col gap-2">
                                        {chunks.map((chunk, index) => (
                                            <Link
                                                key={index}
                                                className="text-xs hover:underline"
                                                to="/$threadId"
                                                params={{ threadId: chunk.threadId }}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {chunk.text}
                                            </Link>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
