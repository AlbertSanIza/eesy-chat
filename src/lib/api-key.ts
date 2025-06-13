import { useApiKeyStore } from '@/lib/store'

/**
 * Hook to get the current API key
 * @returns The current API key or empty string if not set
 */
export function useApiKey() {
    return useApiKeyStore((state) => state.apiKey)
}

/**
 * Function to get the API key outside of React components
 * @returns The current API key or empty string if not set
 */
export function getApiKey(): string {
    return useApiKeyStore.getState().apiKey
}

/**
 * Check if user has provided their own API key
 * @returns true if API key is set, false otherwise
 */
export function hasApiKey(): boolean {
    const apiKey = getApiKey()
    return apiKey.length > 0
}

/**
 * Get headers with API key for API requests
 * @param provider - The AI provider ('openai', 'anthropic', etc.)
 * @returns Headers object with Authorization
 */
export function getApiHeaders(provider: 'openai' | 'anthropic' | 'openrouter' = 'openai'): Record<string, string> {
    const apiKey = getApiKey()

    if (!apiKey) {
        throw new Error('No API key provided. Please add your API key in the settings.')
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    }

    switch (provider) {
        case 'openai':
            headers['Authorization'] = `Bearer ${apiKey}`
            break
        case 'anthropic':
            headers['x-api-key'] = apiKey
            headers['anthropic-version'] = '2023-06-01'
            break
        case 'openrouter':
            headers['Authorization'] = `Bearer ${apiKey}`
            headers['HTTP-Referer'] = window.location.origin
            break
        default:
            headers['Authorization'] = `Bearer ${apiKey}`
    }

    return headers
}
