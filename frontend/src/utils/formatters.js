export const formatCurrency = (value, currency = 'USD') => {
    if (value === null || value === undefined || isNaN(value)) return 'Not available';
    
    const isINR = currency === 'INR';
    const sym = isINR ? '₹' : '$';
    const absVal = Math.abs(value);

    if (isINR) {
        if (absVal >= 1e7) {
            return `${sym}${(value / 1e7).toFixed(2)} Cr`;
        } else if (absVal >= 1e5) {
            return `${sym}${(value / 1e5).toFixed(2)} Lakh`;
        }
    }

    if (absVal >= 1e12) {
        return `${sym}${(value / 1e12).toFixed(2)}T`;
    } else if (absVal >= 1e9) {
        return `${sym}${(value / 1e9).toFixed(2)}B`;
    } else if (absVal >= 1e6) {
        return `${sym}${(value / 1e6).toFixed(2)}M`;
    }

    try {
        return new Intl.NumberFormat(isINR ? 'en-IN' : 'en-US', {
            style: 'currency',
            currency: isINR ? 'INR' : 'USD',
            maximumFractionDigits: 2
        }).format(value);
    } catch {
        return `${sym}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
};

export const formatPercentage = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'Not available';
    // If fractional like 0.15, multiply by 100
    const pct = Math.abs(value) <= 1.0 ? value * 100 : value;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
};

export const formatRatio = (value, suffix = 'x') => {
    if (value === null || value === undefined || isNaN(value)) return 'Not available';
    return `${Number(value).toFixed(2)}${suffix}`;
};

export const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'Not available';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
};
