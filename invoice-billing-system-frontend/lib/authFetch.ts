async function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');

    if(!token){
        throw new Error('No authentication token found');
    }
    
    const headers = {
        ...(options.headers || {}),
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Request failed');
    }

    return response;
}

export default authFetch;