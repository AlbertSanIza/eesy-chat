import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import { Loader2Icon, SearchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/zustand/store'
import { Link } from '@tanstack/react-router'

export function AppSidebarSearch() {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const user = useStore((state) => state.user)
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
        <Dialog open={isOpen && user.isSignedIn} onOpenChange={handleOpenChange}>
            <DialogTrigger disabled={!user.isSignedIn} asChild>
                <Button variant="outline" size="sm" disabled={!user.isSignedIn}>
                    Search All <SearchIcon />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Search</DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <div className="grid gap-2">
                    <div className="flex items-center gap-3">
                        <Input
                            type="text"
                            className="flex-1"
                            placeholder="Search your messages..."
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                        {results === undefined && query.trim() !== '' ? <Loader2Icon className="size-5 animate-spin" /> : <SearchIcon className="size-5" />}
                    </div>
                    <div className="flex max-h-[60vh] flex-col gap-1 overflow-auto">
                        {results && Object.keys(groupedResults).length === 0 && <div className="mt-3 text-center text-muted-foreground">No results found.</div>}
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
