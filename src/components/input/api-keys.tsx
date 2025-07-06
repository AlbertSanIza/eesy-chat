import { useMutation, useQuery } from 'convex/react'
import { KeyIcon, XIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/convex/_generated/api'
import { useStore } from '@/lib/zustand/store'

export function InputApiKeys() {
    const [isOpen, setIsOpen] = useState(false)
    const user = useStore((state) => state.user)
    const storedApiKeys = useQuery(api.get.apiKeys)
    const setApiKey = useMutation(api.update.apiKey)
    const removeApiKey = useMutation(api.remove.apiKey)
    const [tempKey, setTempKey] = useState({ openRouter: '', openAi: '', elevenLabs: '' })

    const handleOpenChange = (open: boolean) => {
        if (open) {
            setTempKey({ openRouter: '', openAi: '', elevenLabs: '' })
        }
        setIsOpen(open)
    }

    const handleSave = async () => {
        setIsOpen(false)
        if (!storedApiKeys?.openRouter && tempKey.openRouter.trim()) {
            await setApiKey({ service: 'openRouter', key: tempKey.openRouter })
        }
        if (!storedApiKeys?.openAi && tempKey.openAi.trim()) {
            await setApiKey({ service: 'openAi', key: tempKey.openAi })
        }
        if (!storedApiKeys?.elevenLabs && tempKey.elevenLabs.trim()) {
            await setApiKey({ service: 'elevenLabs', key: tempKey.elevenLabs })
        }
    }

    const hasValidOpenRouterKey = tempKey.openRouter.trim().length === 0 || tempKey.openRouter.startsWith('sk-or-v1-') || false
    const hasValidOpenAiKey = tempKey.openAi.trim().length === 0 || tempKey.openAi.startsWith('sk-') || false
    const hasValidElevenLabsKey = tempKey.elevenLabs.trim().length === 0 || (tempKey.elevenLabs.length ?? 0) >= 32
    // Only require validity for keys that are being set (not for disabled inputs)
    const allKeysValid =
        (!tempKey.openRouter || hasValidOpenRouterKey) && (!tempKey.openAi || hasValidOpenAiKey) && (!tempKey.elevenLabs || hasValidElevenLabsKey)

    const hasStoredOpenRouterKey = !!storedApiKeys?.openRouter
    const hasStoredOpenAiKey = !!storedApiKeys?.openAi
    const hasStoredElevenLabsKey = !!storedApiKeys?.elevenLabs
    const hasAllStoredKeys = hasStoredOpenRouterKey && hasStoredOpenAiKey && hasStoredElevenLabsKey
    const hasPartialStoredKeys = (hasStoredOpenRouterKey || hasStoredOpenAiKey || hasStoredElevenLabsKey) && !hasAllStoredKeys
    const hasNoStoredKeys = !hasStoredOpenRouterKey && !hasStoredOpenAiKey && !hasStoredElevenLabsKey

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="relative" disabled={!user?.isSignedIn}>
                    <KeyIcon />
                    {hasAllStoredKeys && <div className="absolute right-1.5 bottom-1.5 size-1 rounded-full bg-green-500" />}
                    {hasPartialStoredKeys && <div className="absolute right-1.5 bottom-1.5 size-1 rounded-full bg-orange-500" />}
                    {hasNoStoredKeys && <div className="absolute right-1.5 bottom-1.5 size-1 rounded-full bg-red-500" />}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>API Keys</DialogTitle>
                    <DialogDescription>Enter your API keys to unlock AI models. Your keys are securely stored and encrypted on our servers.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="openrouter-api-key">OpenRouter API Key</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="password"
                                autoComplete="off"
                                className="flex-1"
                                id="openrouter-api-key"
                                placeholder="sk-or-v1-..."
                                disabled={hasStoredOpenRouterKey}
                                value={storedApiKeys?.openRouter ? '•••••••' : tempKey.openRouter}
                                onChange={(event) => setTempKey({ ...tempKey, openRouter: event.target.value })}
                            />
                            {tempKey.openRouter && <span className="text-xs text-orange-600">Pending</span>}
                            {!hasStoredOpenRouterKey && !tempKey.openRouter && <span className="text-xs text-gray-400">Not set</span>}
                            {storedApiKeys?.openRouter && (
                                <Button
                                    size="icon"
                                    type="button"
                                    variant="destructive"
                                    onClick={async () => {
                                        await removeApiKey({ service: 'openRouter' })
                                        setTempKey({ ...tempKey, openRouter: '' })
                                    }}
                                >
                                    <XIcon className="size-4" />
                                </Button>
                            )}
                        </div>
                        {tempKey.openRouter && !hasValidOpenRouterKey && !storedApiKeys?.openRouter && (
                            <p className="text-xs text-destructive">OpenRouter API key should start with "sk-or-v1-"</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="openai-api-key">OpenAI API Key (Image Gen)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="password"
                                autoComplete="off"
                                className="flex-1"
                                id="openai-api-key"
                                placeholder="sk-..."
                                disabled={hasStoredOpenAiKey}
                                value={storedApiKeys?.openAi ? '•••••••' : tempKey.openAi}
                                onChange={(event) => setTempKey({ ...tempKey, openAi: event.target.value })}
                            />
                            {tempKey.openAi && <span className="text-xs text-orange-600">Pending</span>}
                            {!hasStoredOpenAiKey && !tempKey.openAi && <span className="text-xs text-gray-400">Not set</span>}
                            {storedApiKeys?.openAi && (
                                <Button
                                    size="icon"
                                    type="button"
                                    variant="destructive"
                                    onClick={async () => {
                                        await removeApiKey({ service: 'openAi' })
                                        setTempKey({ ...tempKey, openAi: '' })
                                    }}
                                >
                                    <XIcon className="size-4" />
                                </Button>
                            )}
                        </div>
                        {tempKey.openAi && !hasValidOpenAiKey && !storedApiKeys?.openAi && (
                            <p className="text-xs text-destructive">OpenAI API key should start with "sk-"</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="elevenlabs-api-key">ElevenLabs API Key (Voice Gen)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="password"
                                autoComplete="off"
                                className="flex-1"
                                placeholder="sk_..."
                                id="elevenlabs-api-key"
                                disabled={hasStoredElevenLabsKey}
                                value={storedApiKeys?.elevenLabs ? '•••••••' : tempKey.elevenLabs}
                                onChange={(event) => setTempKey({ ...tempKey, elevenLabs: event.target.value })}
                            />
                            {tempKey.elevenLabs && <span className="text-xs text-orange-600">Pending</span>}
                            {!hasStoredElevenLabsKey && !tempKey.elevenLabs && <span className="text-xs text-gray-400">Not set</span>}
                            {storedApiKeys?.elevenLabs && (
                                <Button
                                    size="icon"
                                    type="button"
                                    variant="destructive"
                                    onClick={async () => {
                                        await removeApiKey({ service: 'elevenLabs' })
                                        setTempKey({ ...tempKey, elevenLabs: '' })
                                    }}
                                >
                                    <XIcon className="size-4" />
                                </Button>
                            )}
                        </div>
                        {tempKey.elevenLabs && !hasValidElevenLabsKey && !storedApiKeys?.elevenLabs && (
                            <p className="text-xs text-destructive">ElevenLabs API key should be at least 32 characters</p>
                        )}
                    </div>
                </div>
                <DialogFooter className="gap-3">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-sidebar text-sidebar-foreground dark:bg-pink-800"
                        onClick={handleSave}
                        disabled={!allKeysValid || (!tempKey.openRouter && !tempKey.openAi && !tempKey.elevenLabs)}
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
