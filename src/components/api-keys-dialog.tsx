import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/zustand/store'
import { KeyIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { Label } from './ui/label'

export function ApiKeysDialog() {
    const { openRouterApiKey, openAiApiKey, setOpenRouterApiKey, setOpenAiApiKey } = useStore()
    const [tempOpenRouterApiKey, setTempOpenRouterApiKey] = useState(openRouterApiKey || '')
    const [tempOpenAiApiKey, setTempOpenAiApiKey] = useState(openAiApiKey || '')
    const [isOpen, setIsOpen] = useState(false)

    const handleSave = () => {
        setIsOpen(false)
        setOpenRouterApiKey(tempOpenRouterApiKey.trim())
        setOpenAiApiKey(tempOpenAiApiKey.trim())
    }

    const handleOpenChange = (open: boolean) => {
        if (open) {
            setTempOpenRouterApiKey(openRouterApiKey || '')
            setTempOpenAiApiKey(openAiApiKey || '')
        }
        setIsOpen(open)
    }

    const isValidOpenRouterApiKey = (key: string) => key.trim().length === 0 || key.startsWith('sk-or-v1-')
    const isValidOpenAiApiKey = (key: string) => key.trim().length === 0 || key.startsWith('sk-')

    const hasValidOpenRouterKey = isValidOpenRouterApiKey(tempOpenRouterApiKey)
    const hasValidOpenAiKey = isValidOpenAiApiKey(tempOpenAiApiKey)
    const allKeysValid = hasValidOpenRouterKey && hasValidOpenAiKey
    const hasAnyStoredKey = openRouterApiKey || openAiApiKey

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <KeyIcon />
                    {hasAnyStoredKey && <div className="absolute right-1.5 bottom-1.5 size-1 rounded-full bg-green-500" />}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>API Keys</DialogTitle>
                    <DialogDescription>Enter your API keys to unlock AI models. Your keys are only stored locally and never on our servers.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="openrouter-api-key">OpenRouter API Key</Label>
                        <div className="flex gap-2">
                            <Input
                                type="password"
                                autoComplete="off"
                                className="flex-1"
                                id="openrouter-api-key"
                                placeholder="sk-or-v1-..."
                                value={tempOpenRouterApiKey}
                                onChange={(event) => setTempOpenRouterApiKey(event.target.value)}
                            />
                            {tempOpenRouterApiKey && (
                                <Button variant="destructive" size="icon" onClick={() => setTempOpenRouterApiKey('')} type="button">
                                    <XIcon className="size-4" />
                                </Button>
                            )}
                        </div>
                        {tempOpenRouterApiKey && !hasValidOpenRouterKey && (
                            <p className="text-xs text-destructive">OpenRouter API key should start with "sk-or-v1-"</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="openai-api-key">OpenAI API Key (Image Gen)</Label>
                        <div className="flex gap-2">
                            <Input
                                type="password"
                                autoComplete="off"
                                className="flex-1"
                                id="openai-api-key"
                                placeholder="sk-..."
                                value={tempOpenAiApiKey}
                                onChange={(event) => setTempOpenAiApiKey(event.target.value)}
                            />
                            {tempOpenAiApiKey && (
                                <Button variant="destructive" size="icon" onClick={() => setTempOpenAiApiKey('')} type="button">
                                    <XIcon className="size-4" />
                                </Button>
                            )}
                        </div>
                        {tempOpenAiApiKey && !hasValidOpenAiKey && <p className="text-xs text-destructive">OpenAI API key should start with "sk-"</p>}
                    </div>
                </div>
                <DialogFooter className="gap-3">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button className="bg-sidebar text-sidebar-foreground dark:bg-pink-800" onClick={handleSave} disabled={!allKeysValid}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
