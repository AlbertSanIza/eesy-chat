import { useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'

const USER_CACHE_KEY = 'cached-user'
const CACHE_DURATION = 10 * 60 * 1000

export function useCachedUser(): {
    user: ReturnType<typeof useUser>['user'] | undefined
    isSignedIn?: boolean
    isLoaded: boolean
} {
    const { user: freshUser, isSignedIn, isLoaded } = useUser()

    const [cachedUser, setCachedUser] = useState<ReturnType<typeof useUser>['user'] | undefined>(() => {
        try {
            const cached = localStorage.getItem(USER_CACHE_KEY)
            const timestamp = localStorage.getItem(`${USER_CACHE_KEY}:timestamp`)
            if (cached && timestamp) {
                if (Date.now() - parseInt(timestamp) < CACHE_DURATION) {
                    return JSON.parse(cached)
                } else {
                    clearUserCache()
                }
            }
            return undefined
        } catch {
            return undefined
        }
    })

    useEffect(() => {
        if (freshUser !== undefined) {
            try {
                localStorage.setItem(USER_CACHE_KEY, JSON.stringify(freshUser))
                localStorage.setItem(`${USER_CACHE_KEY}:timestamp`, Date.now().toString())
                setCachedUser(freshUser)
            } catch (error) {
                console.warn('Failed to cache user data:', error)
            }
        }
    }, [freshUser])

    return { user: freshUser !== undefined ? freshUser : cachedUser, isSignedIn, isLoaded }
}

function clearUserCache() {
    try {
        localStorage.removeItem(USER_CACHE_KEY)
        localStorage.removeItem(`${USER_CACHE_KEY}:timestamp`)
    } catch (error) {
        console.warn(`Failed to clear user cache:`, error)
    }
}
