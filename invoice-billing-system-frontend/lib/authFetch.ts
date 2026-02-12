async function authFetch(url: string, options: RequestInit = {}) {
    // 1. We no longer need to get the token from localStorage

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (!response.ok) {
        // Handle 401 Unauthorized specifically (e.g., redirect to login)
        if (response.status === 401) {
            // In a real app we might want to use a more robust navigation or event,
            // but window.location is safe for a utility function to ensure full reload/redirect.
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw new Error('UNAUTHORIZED');
        }

        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Request failed');
    }

    return response;
}

export default authFetch;