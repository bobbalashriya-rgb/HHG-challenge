const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const analyzeCompany = async (ticker) => {
    const res = await fetch(`${BASE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to analyze company.');
    }
    return res.json();
};

export const fetchPrinciples = async () => {
    const res = await fetch(`${BASE_URL}/principles`);
    if (!res.ok) throw new Error('Failed to fetch principles');
    return res.json();
};

export const updatePrinciple = async (identifier, threshold) => {
    const res = await fetch(`${BASE_URL}/principles/${identifier}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: parseFloat(threshold) })
    });
    if (!res.ok) throw new Error('Failed to update principle');
    return res.json();
};

export const askFinolitics = async (context, question) => {
    const res = await fetch(`${BASE_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, question })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to ask question.');
    }
    return res.json();
};

export const compareCompanies = async (tickers) => {
    const res = await fetch(`${BASE_URL}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to compare companies.');
    }
    return res.json();
};

// ==========================================
// Authentication & Django Users / Groups API
// ==========================================

export const loginUser = async ({ username, password }) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.detail || 'Invalid username or password.');
    }
    if (data.user) {
        localStorage.setItem('finolitics_user', JSON.stringify(data.user));
    }
    return data;
};

export const loginOAuth = async ({ provider, email, name, oauth_id, credential, avatar_url }) => {
    const res = await fetch(`${BASE_URL}/auth/oauth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ provider, email, name, oauth_id, credential, avatar_url })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.detail || 'OAuth authentication failed.');
    }
    if (data.user) {
        localStorage.setItem('finolitics_user', JSON.stringify(data.user));
    }
    return data;
};

export const logoutUser = async () => {
    try {
        await fetch(`${BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (e) {
        console.error('Logout error', e);
    } finally {
        localStorage.removeItem('finolitics_user');
    }
};

export const fetchCurrentUser = async () => {
    try {
        const res = await fetch(`${BASE_URL}/auth/me`, { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            if (data.authenticated && data.user) {
                localStorage.setItem('finolitics_user', JSON.stringify(data.user));
                return data.user;
            }
        }
    } catch (e) {
        console.warn('Could not fetch server session', e);
    }
    
    // Fallback to local storage
    const cached = localStorage.getItem('finolitics_user');
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (_) {}
    }
    return null;
};

export const fetchGroups = async () => {
    const res = await fetch(`${BASE_URL}/auth/groups`);
    if (!res.ok) throw new Error('Failed to fetch Django groups');
    return res.json();
};

export const fetchUsers = async () => {
    const res = await fetch(`${BASE_URL}/auth/users`);
    if (!res.ok) throw new Error('Failed to fetch Django users');
    return res.json();
};
