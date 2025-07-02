import { SignOutButton, useUser } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { KeyIcon, LogOutIcon, TrashIcon, UserIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { api } from '@/convex/_generated/api'
import { useStore } from '@/lib/zustand/store'

export const Route = createFileRoute('/settings')({
    component: RouteComponent
})

function RouteComponent() {
    const { user } = useUser()
    const threads = useStore((state) => state.threads)
    const removeThread = useMutation(api.remove.thread)

    // API Keys management
    const storedApiKeys = useQuery(api.get.apiKeys)
    const setApiKey = useMutation(api.update.apiKey)
    const removeApiKey = useMutation(api.remove.apiKey)

    const [apiKeysOpen, setApiKeysOpen] = useState(false)
    const [deleteThreadsOpen, setDeleteThreadsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [tempApiKeys, setTempApiKeys] = useState({
        openRouter: '',
        openAi: '',
        elevenLabs: ''
    })

    const handleApiKeysOpen = (open: boolean) => {
        if (open) {
            setTempApiKeys({
                openRouter: '',
                openAi: '',
                elevenLabs: ''
            })
        }
        setApiKeysOpen(open)
    }

    const handleSaveApiKeys = async () => {
        try {
            // Save OpenRouter key
            if (tempApiKeys.openRouter.trim()) {
                await setApiKey({ service: 'openRouter', key: tempApiKeys.openRouter })
            }

            // Save OpenAI key
            if (tempApiKeys.openAi.trim()) {
                await setApiKey({ service: 'openAi', key: tempApiKeys.openAi })
            }

            // Save ElevenLabs key
            if (tempApiKeys.elevenLabs.trim()) {
                await setApiKey({ service: 'elevenLabs', key: tempApiKeys.elevenLabs })
            }

            setApiKeysOpen(false)
        } catch (error) {
            console.error('Failed to save API keys:', error)
        }
    }

    const handleRemoveApiKey = async (service: 'openRouter' | 'openAi' | 'elevenLabs') => {
        try {
            await removeApiKey({ service })
        } catch (error) {
            console.error('Failed to remove API key:', error)
        }
    }

    const handleDeleteAllThreads = async () => {
        setIsDeleting(true)
        try {
            await Promise.all(threads.map((thread) => removeThread({ id: thread._id })))
            setDeleteThreadsOpen(false)
        } catch (error) {
            console.error('Failed to delete threads:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    const hasValidOpenRouterKey = tempApiKeys.openRouter.trim().length === 0 || tempApiKeys.openRouter.startsWith('sk-or-v1-')
    const hasValidOpenAiKey = tempApiKeys.openAi.trim().length === 0 || tempApiKeys.openAi.startsWith('sk-')
    const hasValidElevenLabsKey = tempApiKeys.elevenLabs.trim().length === 0 || tempApiKeys.elevenLabs.length >= 32
    const allKeysValid = hasValidOpenRouterKey && hasValidOpenAiKey && hasValidElevenLabsKey

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-4xl px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="mt-2 text-muted-foreground">Manage your account and preferences</p>
                </div>

                {/* Account Section */}
                <div className="space-y-8">
                    <section>
                        <div className="mb-6 flex items-center gap-3">
                            <UserIcon className="size-5" />
                            <h2 className="text-xl font-semibold">Account</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <h3 className="font-medium">Profile</h3>
                                    <p className="text-sm text-muted-foreground">Signed in as {user?.fullName || user?.primaryEmailAddress?.emailAddress}</p>
                                </div>
                                <SignOutButton>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <LogOutIcon className="size-4" />
                                        Sign Out
                                    </Button>
                                </SignOutButton>
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* API Keys Section */}
                    <section>
                        <div className="mb-6 flex items-center gap-3">
                            <KeyIcon className="size-5" />
                            <h2 className="text-xl font-semibold">API Keys</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <h3 className="font-medium">OpenRouter API Key</h3>
                                    <p className="text-sm text-muted-foreground">{storedApiKeys?.openRouter ? 'Key configured' : 'No key configured'}</p>
                                </div>
                                <div className="flex gap-2">
                                    {storedApiKeys?.openRouter && (
                                        <Button variant="outline" size="sm" onClick={() => handleRemoveApiKey('openRouter')}>
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <h3 className="font-medium">OpenAI API Key</h3>
                                    <p className="text-sm text-muted-foreground">{storedApiKeys?.openAi ? 'Key configured' : 'No key configured'}</p>
                                </div>
                                <div className="flex gap-2">
                                    {storedApiKeys?.openAi && (
                                        <Button variant="outline" size="sm" onClick={() => handleRemoveApiKey('openAi')}>
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <h3 className="font-medium">ElevenLabs API Key</h3>
                                    <p className="text-sm text-muted-foreground">{storedApiKeys?.elevenLabs ? 'Key configured' : 'No key configured'}</p>
                                </div>
                                <div className="flex gap-2">
                                    {storedApiKeys?.elevenLabs && (
                                        <Button variant="outline" size="sm" onClick={() => handleRemoveApiKey('elevenLabs')}>
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4">
                                <Dialog open={apiKeysOpen} onOpenChange={handleApiKeysOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2">
                                            <KeyIcon className="size-4" />
                                            Add API Keys
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Add API Keys</DialogTitle>
                                            <DialogDescription>
                                                Enter your API keys to unlock AI models. Your keys are securely stored and encrypted.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="openrouter">OpenRouter API Key</Label>
                                                <Input
                                                    id="openrouter"
                                                    type="password"
                                                    placeholder="sk-or-v1-..."
                                                    value={tempApiKeys.openRouter}
                                                    onChange={(e) => setTempApiKeys((prev) => ({ ...prev, openRouter: e.target.value }))}
                                                />
                                                {tempApiKeys.openRouter && !hasValidOpenRouterKey && (
                                                    <p className="text-xs text-destructive">Key should start with "sk-or-v1-"</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="openai">OpenAI API Key</Label>
                                                <Input
                                                    id="openai"
                                                    type="password"
                                                    placeholder="sk-..."
                                                    value={tempApiKeys.openAi}
                                                    onChange={(e) => setTempApiKeys((prev) => ({ ...prev, openAi: e.target.value }))}
                                                />
                                                {tempApiKeys.openAi && !hasValidOpenAiKey && (
                                                    <p className="text-xs text-destructive">Key should start with "sk-"</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="elevenlabs">ElevenLabs API Key</Label>
                                                <Input
                                                    id="elevenlabs"
                                                    type="password"
                                                    placeholder="sk_..."
                                                    value={tempApiKeys.elevenLabs}
                                                    onChange={(e) => setTempApiKeys((prev) => ({ ...prev, elevenLabs: e.target.value }))}
                                                />
                                                {tempApiKeys.elevenLabs && !hasValidElevenLabsKey && (
                                                    <p className="text-xs text-destructive">Key should be at least 32 characters</p>
                                                )}
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setApiKeysOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSaveApiKeys} disabled={!allKeysValid}>
                                                Save Keys
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* Data Management Section */}
                    <section>
                        <div className="mb-6 flex items-center gap-3">
                            <TrashIcon className="size-5" />
                            <h2 className="text-xl font-semibold">Data Management</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <h3 className="font-medium">Delete All Threads</h3>
                                    <p className="text-sm text-muted-foreground">Permanently delete all your chat threads ({threads.length} total)</p>
                                </div>
                                <Dialog open={deleteThreadsOpen} onOpenChange={setDeleteThreadsOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" size="sm" disabled={threads.length === 0}>
                                            Delete All
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Delete All Threads</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete all {threads.length} threads? This action cannot be undone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setDeleteThreadsOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button variant="destructive" onClick={handleDeleteAllThreads} disabled={isDeleting}>
                                                {isDeleting ? 'Deleting...' : 'Delete All Threads'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
