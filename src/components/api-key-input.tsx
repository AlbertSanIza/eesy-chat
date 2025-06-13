import { Eye, EyeOff, Key, Save, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApiKeyStore } from '@/lib/store'

export function ApiKeyInput() {
    const { apiKey, setApiKey, clearApiKey } = useApiKeyStore()
    const [tempKey, setTempKey] = useState(apiKey)
    const [showKey, setShowKey] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    const handleSave = () => {
        setApiKey(tempKey)
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 2000)
    }

    const handleClear = () => {
        setTempKey('')
        clearApiKey()
    }

    const maskKey = (key: string) => {
        if (!key || key.length < 8) return key
        return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4)
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Key className="size-4" />
                <h3 className="text-sm font-medium">API Key</h3>
            </div>

            <div className="space-y-2">
                <div className="relative">
                    <Input
                        type={showKey ? 'text' : 'password'}
                        placeholder="Enter your API key (e.g., sk-...)"
                        value={showKey ? tempKey : maskKey(tempKey)}
                        onChange={(e) => setTempKey(e.target.value)}
                        className="pr-10"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                        onClick={() => setShowKey(!showKey)}
                    >
                        {showKey ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={!tempKey.trim() || tempKey === apiKey} size="sm" className="flex-1">
                        <Save className="mr-1 size-3" />
                        {isSaved ? 'Saved!' : 'Save'}
                    </Button>

                    <Button onClick={handleClear} disabled={!tempKey && !apiKey} variant="outline" size="sm" className="flex-1">
                        <Trash2 className="mr-1 size-3" />
                        Clear
                    </Button>
                </div>
            </div>

            {apiKey && (
                <div className="text-xs text-muted-foreground">
                    <p>✓ API key saved securely in your browser</p>
                </div>
            )}

            <div className="space-y-1 text-xs text-muted-foreground">
                <p>Your API key is stored locally and never sent to our servers.</p>
                <p>Supports OpenAI, Anthropic, and other compatible APIs.</p>
            </div>
        </div>
    )
}
