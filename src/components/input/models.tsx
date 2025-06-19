import { useParams } from '@tanstack/react-router'
import { ChevronDownIcon } from 'lucide-react'

import { useStore } from '@/lib/zustand/store'

export function InputModelsSelect() {
    const model = useStore((state) => state.model)
    const models = useStore((state) => state.models)
    const { threadId } = useParams({ strict: false })
    const setModel = useStore((state) => state.setModel)

    return (
        <div className="grid grid-cols-1 text-sm">
            {threadId}
            <select
                className="col-start-1 row-start-1 h-9 cursor-pointer appearance-none rounded-md border bg-background pr-7 pl-2 shadow-xs outline-none hover:bg-accent hover:text-accent-foreground"
                value={model?._id}
                onChange={(event) => {
                    const modelId = event.target.value
                    const model = models.find((m) => m._id === modelId)
                    if (model) {
                        setModel(model)
                    }
                }}
            >
                {models.map((model) => (
                    <option key={model._id} value={model._id}>
                        {model.label}
                    </option>
                ))}
            </select>
            <ChevronDownIcon aria-hidden="true" className="pointer-events-none col-start-1 row-start-1 mr-2 self-center justify-self-end sm:size-4" />
        </div>
    )
}
