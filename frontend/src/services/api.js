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
