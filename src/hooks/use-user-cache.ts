import { useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'

import { useStore } from '@/lib/zustand/store'

export function useUserCache() {
    const { user, isLoaded } = useUser()
    const { setUser } = useStore()

    useEffect(() => {
        if (isLoaded) {
            setUser({ fullName: user?.fullName || undefined, imageUrl: user?.imageUrl })
        }
    }, [isLoaded, setUser, user])
}
