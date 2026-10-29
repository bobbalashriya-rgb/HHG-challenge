import React from 'react';
import { formatCurrency, formatPercentage, formatNumber } from '../utils/formatters';

const MetricCard = ({ title, value, formatter }) => {
    const isAvail = value !== null && value !== undefined;
    const formatted = formatter(value);
    
    return (
        <div className="bg-[#10172A] p-4 rounded-xl shadow-sm border border-[#232D42] hover:border-blue-500/40 transition-all duration-200 group flex flex-col justify-between">
            <div>
                <p className="text-xs font-medium text-slate-400 group-hover:text-blue-400 transition-colors">{title}</p>
                <p className={`text-xl font-extrabold mt-2 ${!isAvail || formatted === 'Not available' ? 'text-slate-500 font-medium text-sm' : 'text-white'}`}>
                    {formatted}
                </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">Statement Derived</span>
                <span className="text-[9px] font-mono text-slate-600">{isAvail ? 'Audited' : 'N/A'}</span>
            </div>
        </div>
    );
};

export default function MetricGrid({ metrics }) {
    if (!metrics) return null;
    const m = metrics.metrics;
    
    return (
        <div className="bg-[#131B2F] border border-[#2A344A] rounded-2xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <span>Core Operating & Financial Metrics</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
                Primary fundamental accounting indicators derived from recent official financial statements.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 animate-in fade-in slide-in-from-bottom-2">
                <MetricCard title="Revenue" value={m.revenue} formatter={formatCurrency} />
                <MetricCard title="Revenue Growth" value={m.revenue_growth} formatter={formatPercentage} />
                <MetricCard title="Net Profit" value={m.net_profit} formatter={formatCurrency} />
                <MetricCard title="Profit Growth" value={m.profit_growth} formatter={formatPercentage} />
                <MetricCard title="ROE" value={m.roe} formatter={formatPercentage} />
                <MetricCard title="ROCE" value={m.roce} formatter={formatPercentage} />
                <MetricCard title="Debt to Equity" value={m.debt_to_equity} formatter={formatNumber} />
                <MetricCard title="Operating Margin" value={m.operating_margin} formatter={formatPercentage} />
                <MetricCard title="Free Cash Flow" value={m.free_cash_flow} formatter={formatCurrency} />
                <MetricCard title="P/E Ratio" value={m.pe_ratio} formatter={(v) => v !== null && v !== undefined ? `${Number(v).toFixed(2)}x` : 'Not available'} />
            </div>
        </div>
    );
}
