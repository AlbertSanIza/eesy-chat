import { useParams } from '@tanstack/react-router'
import { ChevronDownIcon } from 'lucide-react'
import { useEffect } from 'react'

import { useStore } from '@/lib/zustand/store'

export function InputModelsSelect() {
    const model = useStore((state) => state.model)
    const models = useStore((state) => state.models)
    const { threadId } = useParams({ strict: false })
    const setModel = useStore((state) => state.setModel)
    const thread = useStore((state) => state.threads.find((thread) => thread._id === threadId))

    const availableModels = models.filter((model) => {
        if (!thread || (thread.type === 'text' && model.model !== 'dall-e-3' && model.model !== 'eleven_monolingual_v2')) {
            return true
        }
        if (thread.type === 'image' && model.model === 'dall-e-3') {
            return true
        }
        if (thread.type === 'sound' && model.model === 'eleven_monolingual_v2') {
            return true
        }
        return false
    })

    useEffect(() => {
        if (!availableModels.some((m) => m._id === model?._id)) {
            let defaultModel
            if (thread?.type === 'text') {
                defaultModel = models.find((m) => m.model === 'openai/gpt-4.1-nano')
            }
            setModel(defaultModel || availableModels[0])
        }
    }, [availableModels, model?._id, models, setModel, thread?.type])

    return (
        !!availableModels.length && (
            <div className="grid grid-cols-1 text-sm">
                <select
                    className="col-start-1 row-start-1 h-9 cursor-pointer appearance-none rounded-md border bg-background pr-7 pl-2 shadow-xs outline-none hover:bg-accent hover:text-accent-foreground"
                    value={model?._id}
                    onChange={(event) => {
                        const model = models.find((m) => m._id === event.target.value)
                        if (model) {
                            setModel(model)
                        }
                    }}
                >
                    {availableModels.map((model) => (
                        <option key={model._id} value={model._id}>
                            {model.provider}: {model.label}
                        </option>
                    ))}
                </select>
                <ChevronDownIcon aria-hidden="true" className="pointer-events-none col-start-1 row-start-1 mr-2 self-center justify-self-end sm:size-4" />
            </div>
        )
    )
}
