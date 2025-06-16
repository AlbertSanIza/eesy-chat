import { useEffect } from 'react'

export function useDocumentTitle(title?: string) {
    useEffect(() => {
        if (title) {
            document.title = title
        } else {
            document.title = 'eesy.chat'
        }
        return () => {
            document.title = 'eesy.chat'
        }
    }, [title])
}
