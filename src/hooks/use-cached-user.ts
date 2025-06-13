import { useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'

import { useStore } from '@/lib/store'

export function useCachedUser() {
    const { user } = useUser()
    const { setUser } = useStore()

    useEffect(() => {
        if (user) {
            setUser(user)
        }
    }, [setUser, user])
}
