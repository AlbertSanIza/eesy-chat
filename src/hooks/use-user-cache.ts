import { useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'

import { useStore } from '@/lib/zustand/store'

export function useUserCache() {
    const { setUser } = useStore()
    const { isLoaded, isSignedIn, user } = useUser()

    useEffect(() => {
        if (isLoaded) {
            setUser({ isSignedIn, fullName: user?.fullName || undefined, imageUrl: user?.imageUrl })
        }
    }, [isLoaded, isSignedIn, setUser, user?.fullName, user?.imageUrl])
}
