import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/zustand/store'
import { KeyIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { Label } from './ui/label'

export function ApiKeyDialog() {
    const { openRouterApiKey, setOpenRouterApiKey } = useStore()
    const [tempApiKey, setTempApiKey] = useState(openRouterApiKey || '')
    const [isOpen, setIsOpen] = useState(false)

    const handleSave = () => {
        setOpenRouterApiKey(tempApiKey.trim())
        setIsOpen(false)
    }

    const handleClear = () => {
        setOpenRouterApiKey('')
        setTempApiKey('')
        setIsOpen(false)
    }

    const handleCancel = () => {
        setTempApiKey(openRouterApiKey || '')
        setIsOpen(false)
    }

    const handleOpenChange = (open: boolean) => {
        if (open) {
            setTempApiKey(openRouterApiKey || '')
        }
        setIsOpen(open)
    }

    const isValidApiKey = (key: string) => {
        return key.trim().length > 0 && key.startsWith('sk-or-v1-')
    }

    const hasValidKey = isValidApiKey(tempApiKey)

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <KeyIcon />
                    {openRouterApiKey && <div className="absolute right-1.5 bottom-1.5 size-1 rounded-full bg-green-500" />}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>OpenRouter API Key</DialogTitle>
                    <DialogDescription>
                        Enter your OpenRouter API key to use AI models. Your key is stored locally and never sent to our servers.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <Input
                            id="api-key"
                            type="password"
                            autoComplete="off"
                            className="col-span-3"
                            placeholder="sk-or-v1-..."
                            value={tempApiKey}
                            onChange={(event) => setTempApiKey(event.target.value)}
                        />
                        {tempApiKey && !hasValidKey && <p className="text-sm text-destructive">API key should start with "sk-or-v1-"</p>}
                    </div>
                    {openRouterApiKey && (
                        <div className="text-sm text-muted-foreground">
                            Current key: {openRouterApiKey.slice(0, 8)}...{openRouterApiKey.slice(-4)}
                        </div>
                    )}
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    {openRouterApiKey && (
                        <Button variant="destructive" onClick={handleClear}>
                            <Trash2Icon className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={!hasValidKey}>
                        Save API Key
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
