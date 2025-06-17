import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useAction, useMutation } from 'convex/react'
import { GitForkIcon, LinkIcon, Loader2Icon, PinIcon, PinOffIcon, TextCursorIcon, Trash2Icon, UnlinkIcon, XIcon } from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu'
import { SidebarMenuItem as ShadSidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'
import { useAiChat } from '@/hooks/use-ai-chat'
import { cn } from '@/lib/utils'

export function AppSidebarMenuItem({ thread }: { thread: Doc<'threads'> }) {
    const navigate = useNavigate()
    const inputRef = useRef<HTMLInputElement>(null)
    const { status } = useAiChat({ id: thread._id })
    const { threadId } = useParams({ strict: false })
    const [isEditing, setIsEditing] = useState(false)
    const deleteThread = useMutation(api.remove.thread)
    const renameThread = useAction(api.update.threadName)
    const [inputValue, setInputValue] = useState(thread.name)
    const toggleThreadPin = useMutation(api.threads.togglePin)
    const [optimisticName, setOptimisticName] = useState<string | null>(null)
    const toggleSharedThread = useMutation(api.threads.toggleShared)

    useEffect(() => {
        if (optimisticName && thread.name === optimisticName) {
            setOptimisticName(null)
        }
    }, [thread.name, optimisticName])

    const onEdit = () => {
        setInputValue(thread.name)
        setIsEditing(true)
        setTimeout(() => {
            inputRef.current?.focus()
        }, 260)
    }

    const handleSave = (value: string) => {
        const trimmedValue = value.trim()
        if (trimmedValue && trimmedValue !== thread.name) {
            setOptimisticName(trimmedValue)
            renameThread({ id: thread._id, name: trimmedValue })
        } else {
            setInputValue(thread.name)
        }
        setIsEditing(false)
    }

    const handleOnDelete = () => {
        deleteThread({ id: thread._id })
        if (threadId === thread._id) {
            navigate({ to: '/' })
        }
    }

    const displayName = optimisticName ?? thread.name

    return (
        <ThreadContextMenu
            thread={thread}
            onEdit={onEdit}
            onDelete={handleOnDelete}
            onTogglePin={() => toggleThreadPin({ id: thread._id })}
            onToggleShare={() => toggleSharedThread({ id: thread._id })}
        >
            <ShadSidebarMenuItem>
                <SidebarMenuButton
                    isActive={threadId === thread._id || isEditing}
                    className={cn('group/sidebar-menu-button m-0 gap-1 py-0 font-normal! transition-none', isEditing && 'm-0 p-0')}
                    asChild
                >
                    <Link to={`/$threadId`} params={{ threadId: thread._id }}>
                        {!isEditing && thread.shared && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="-ml-1 size-6 hover:bg-sidebar dark:hover:bg-sidebar"
                                onClick={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    window.open(`/shared/${thread._id}`, '_blank', 'noopener,noreferrer')
                                }}
                            >
                                <LinkIcon className="size-4" />
                            </Button>
                        )}
                        {!isEditing && thread.branched && <GitForkIcon className="size-4 opacity-60" />}
                        {isEditing && (
                            <input
                                className="h-full w-full rounded px-2 pb-[1px] outline-none"
                                ref={inputRef}
                                value={inputValue}
                                onBlur={() => handleSave(inputValue)}
                                onClick={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault()
                                        handleSave(inputValue)
                                    } else if (event.key === 'Escape') {
                                        event.preventDefault()
                                        setInputValue(thread.name)
                                        setIsEditing(false)
                                    }
                                }}
                                onChange={(event) => setInputValue(event.target.value)}
                            />
                        )}
                        {!isEditing && <div className="h-fit w-full truncate">{displayName}</div>}
                        {!isEditing && (
                            <div
                                className="-mr-1 hidden group-hover/sidebar-menu-button:flex"
                                onClick={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                }}
                            >
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-6 hover:bg-sidebar dark:hover:bg-sidebar"
                                    onClick={() => toggleThreadPin({ id: thread._id })}
                                >
                                    {thread.pinned ? <PinOffIcon className="size-4" /> : <PinIcon className="size-4" />}
                                </Button>
                                {!thread.pinned && (
                                    <DeleteThreadDialog thread={thread} onDelete={handleOnDelete}>
                                        <Button size="icon" variant="ghost" className="size-6 hover:bg-sidebar dark:hover:bg-sidebar">
                                            <XIcon className="size-4" />
                                        </Button>
                                    </DeleteThreadDialog>
                                )}
                            </div>
                        )}
                        {status === 'submitted' || (status === 'streaming' && <Loader2Icon className="animate-spin" />)}
                    </Link>
                </SidebarMenuButton>
            </ShadSidebarMenuItem>
        </ThreadContextMenu>
    )
}

function ThreadContextMenu({
    thread,
    onEdit,
    onTogglePin,
    onToggleShare,
    onDelete,
    children
}: {
    thread: Doc<'threads'>
    onEdit: () => void
    onTogglePin: () => void
    onToggleShare: () => void
    onDelete: () => void
    children: React.ReactNode
}) {
    const handleShareToggle = () => {
        if (thread.shared) {
            navigator.clipboard.writeText(`${window.location.origin}/shared/${thread._id}`)
        }
        onToggleShare()
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem className="hover:bg-sidebar! dark:hover:bg-background!" onClick={onEdit}>
                    <TextCursorIcon />
                    Rename
                </ContextMenuItem>
                <ContextMenuItem className="hover:bg-sidebar! dark:hover:bg-background!" onClick={onTogglePin}>
                    {thread.pinned ? <PinOffIcon /> : <PinIcon />}
                    {thread.pinned ? 'Unpin' : 'Pin'}
                </ContextMenuItem>
                <ContextMenuItem className="hover:bg-sidebar! dark:hover:bg-background!" onClick={handleShareToggle}>
                    {thread.shared ? <UnlinkIcon /> : <LinkIcon />}
                    {thread.shared ? 'Unshare' : 'Share'}
                </ContextMenuItem>
                {!thread.pinned && <ContextMenuSeparator />}
                {!thread.pinned && (
                    <DeleteThreadDialog thread={thread} onDelete={onDelete}>
                        <ContextMenuItem className="hover:bg-sidebar! dark:hover:bg-background!" onSelect={(event) => event.preventDefault()}>
                            <Trash2Icon />
                            Delete
                        </ContextMenuItem>
                    </DeleteThreadDialog>
                )}
            </ContextMenuContent>
        </ContextMenu>
    )
}

function DeleteThreadDialog({ thread, onDelete, children }: { thread: Doc<'threads'>; onDelete: () => void; children: ReactNode }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Thread</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete thread &quot;{thread.name}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button variant="destructive" onClick={onDelete} asChild>
                        <AlertDialogAction>Delete</AlertDialogAction>
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
