import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/zustand/store'
import { KeyIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { Label } from './ui/label'

export function ApiKeysDialog() {
    const { openRouterApiKey, openAiApiKey, elevenLabsApiKey, setOpenRouterApiKey, setOpenAiApiKey, setElevenLabsApiKey } = useStore()
    const [tempOpenRouterApiKey, setTempOpenRouterApiKey] = useState(openRouterApiKey || '')
    const [tempOpenAiApiKey, setTempOpenAiApiKey] = useState(openAiApiKey || '')
    const [tempElevenLabsApiKey, setTempElevenLabsApiKey] = useState(elevenLabsApiKey || '')
    const [isOpen, setIsOpen] = useState(false)

    const handleSave = () => {
        setIsOpen(false)
        setOpenRouterApiKey(tempOpenRouterApiKey.trim())
        setOpenAiApiKey(tempOpenAiApiKey.trim())
        setElevenLabsApiKey(tempElevenLabsApiKey.trim())
    }

    const handleOpenChange = (open: boolean) => {
        if (open) {
            setTempOpenRouterApiKey(openRouterApiKey || '')
            setTempOpenAiApiKey(openAiApiKey || '')
            setTempElevenLabsApiKey(elevenLabsApiKey || '')
        }
        setIsOpen(open)
    }

    const isValidOpenRouterApiKey = (key: string) => key.trim().length === 0 || key.startsWith('sk-or-v1-')
    const isValidOpenAiApiKey = (key: string) => key.trim().length === 0 || key.startsWith('sk-')
    const isValidElevenLabsApiKey = (key: string) => key.trim().length === 0 || key.length >= 32

    const hasValidOpenRouterKey = isValidOpenRouterApiKey(tempOpenRouterApiKey)
    const hasValidOpenAiKey = isValidOpenAiApiKey(tempOpenAiApiKey)
    const hasValidElevenLabsKey = isValidElevenLabsApiKey(tempElevenLabsApiKey)
    const allKeysValid = hasValidOpenRouterKey && hasValidOpenAiKey && hasValidElevenLabsKey

    const hasStoredOpenRouterKey = !!openRouterApiKey?.trim()
    const hasStoredOpenAiKey = !!openAiApiKey?.trim()
    const hasStoredElevenLabsKey = !!elevenLabsApiKey?.trim()
    const hasAllStoredKeys = hasStoredOpenRouterKey && hasStoredOpenAiKey && hasStoredElevenLabsKey
    const hasPartialStoredKeys = (hasStoredOpenRouterKey || hasStoredOpenAiKey || hasStoredElevenLabsKey) && !hasAllStoredKeys
    const hasNoStoredKeys = !hasStoredOpenRouterKey && !hasStoredOpenAiKey && !hasStoredElevenLabsKey

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <KeyIcon />
                    {hasAllStoredKeys && <div className="absolute right-1.5 bottom-1.5 size-1 rounded-full bg-green-500" />}
                    {hasPartialStoredKeys && <div className="absolute right-1.5 bottom-1.5 size-1 rounded-full bg-orange-500" />}
                    {hasNoStoredKeys && <div className="absolute right-1.5 bottom-1.5 size-1 rounded-full bg-red-500" />}
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
                    <div className="grid gap-2">
                        <Label htmlFor="elevenlabs-api-key">ElevenLabs API Key (Voice Gen)</Label>
                        <div className="flex gap-2">
                            <Input
                                type="password"
                                autoComplete="off"
                                className="flex-1"
                                id="elevenlabs-api-key"
                                placeholder="sk_..."
                                value={tempElevenLabsApiKey}
                                onChange={(event) => setTempElevenLabsApiKey(event.target.value)}
                            />
                            {tempElevenLabsApiKey && (
                                <Button variant="destructive" size="icon" onClick={() => setTempElevenLabsApiKey('')} type="button">
                                    <XIcon className="size-4" />
                                </Button>
                            )}
                        </div>
                        {tempElevenLabsApiKey && !hasValidElevenLabsKey && (
                            <p className="text-xs text-destructive">ElevenLabs API key should be at least 32 characters</p>
                        )}
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
