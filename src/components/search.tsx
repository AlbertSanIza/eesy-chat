import { Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { api } from '@/convex/_generated/api'

export function SearchCommandDialog() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const results = useQuery(api.get.searchChunks, query.trim() === '' ? 'skip' : { query: query.trim() })

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Search your messages..." value={query} onValueChange={setQuery} />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem>
                        <Calendar />
                        <span>Calendar</span>
                    </CommandItem>
                    <CommandItem>
                        <Smile />
                        <span>Search Emoji</span>
                    </CommandItem>
                    <CommandItem>
                        <Calculator />
                        <span>Calculator</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                    <CommandItem>
                        <User />
                        <span>Profile</span>
                        <CommandShortcut>⌘P</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                        <CreditCard />
                        <span>Billing</span>
                        <CommandShortcut>⌘B</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                        <Settings />
                        <span>Settings</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
