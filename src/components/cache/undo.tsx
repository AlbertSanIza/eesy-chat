import { useStore } from '@/lib/zustand/store'
import { useEffect } from 'react'

export function UndoCache() {
    const setUser = useStore((state) => state.setUser)
    const setModels = useStore((state) => state.setModels)
    const setThreads = useStore((state) => state.setThreads)

    useEffect(() => {
        setUser({ isSignedIn: false })
        setThreads([])
        setModels([])
    }, [setModels, setThreads, setUser])

    return null
}
