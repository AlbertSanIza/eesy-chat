import { useEesyChatStore } from '@/lib/store/use-eesy-chat-store'

export const useThreads = () => {
    const { threads, addThread, updateThread, deleteThread, getThread } = useEesyChatStore()

    const createThread = (title: string) => {
        const newThread = {
            id: crypto.randomUUID(),
            title,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        addThread(newThread)
        return newThread
    }

    // Helper function to add a message to a thread
    const addMessage = (threadId: string, role: 'user' | 'assistant', content: string) => {
        const thread = getThread(threadId)
        if (!thread) return

        const newMessage = {
            id: crypto.randomUUID(),
            role,
            content,
            timestamp: Date.now()
        }

        updateThread(threadId, {
            messages: [...thread.messages, newMessage],
            updatedAt: Date.now()
        })
    }

    // Get threads sorted by last updated
    const getSortedThreads = () => {
        return Object.values(threads).sort((a, b) => b.updatedAt - a.updatedAt)
    }

    return {
        threads,
        createThread,
        addMessage,
        updateThread,
        deleteThread,
        getThread,
        getSortedThreads
    }
}
