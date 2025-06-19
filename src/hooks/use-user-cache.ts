import { useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'

import { useStore } from '@/lib/zustand/store'

export function useUserCache() {
    const { isLoaded, isSignedIn, user } = useUser()
    const { setUser } = useStore()

    useEffect(() => {
        if (isLoaded) {
            setUser({ isSignedIn, fullName: user?.fullName || undefined, imageUrl: user?.imageUrl })
        }
    }, [isLoaded, isSignedIn, setUser, user?.fullName, user?.imageUrl])
}
