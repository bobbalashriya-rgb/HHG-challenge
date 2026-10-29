import React, { useState } from 'react';
import { 
    ChevronDown, ChevronUp, Eye, EyeOff, Calculator, 
    TrendingUp, History, Users, DollarSign, ShieldAlert, CheckCircle2, AlertTriangle
} from 'lucide-react';
import ValuationMetricCard from './ValuationMetricCard';
import ValuationTooltip from './ValuationTooltip';
import { formatCurrency, formatPercentage, formatRatio } from '../utils/formatters';

export default function ValuationDashboard({ valuation, profile }) {
    if (!valuation) return null;

    const currency = profile?.currency || (profile?.ticker?.toUpperCase()?.endsWith('.NS') ? 'INR' : 'USD');
    const currSym = currency === 'INR' ? '₹' : '$';

    // Module collapse state (all default to true/expanded)
    const [collapsed, setCollapsed] = useState({
        earnings: false,
        growth: false,
        historical: false,
        relative: false,
        dcf: false,
        quality: false
    });

    // Eye explanation state for each section
    const [showExplanation, setShowExplanation] = useState({
        earnings: false,
        growth: false,
        historical: false,
        relative: false,
        dcf: false,
        quality: false
    });

    const toggleCollapse = (key) => {
        setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleExplanation = (e, key) => {
        e.stopPropagation(); // Prevent accordion from toggling
        setShowExplanation(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const {
        earnings_valuation,
        growth_valuation,
        historical_valuation,
        relative_valuation,
        dcf_valuation,
        quality_risk
    } = valuation;

    return (
        <div className="space-y-6 mt-8 animate-in fade-in">
            {/* Main Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#2A344A] gap-2">
                <div>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-blue-500" />
                        Quantitative Valuation Dashboard
                    </h2>
                    <p className="text-xs sm:text-sm text-[#8B9CC3] mt-1">
                        Comprehensive 6-pillar valuation analysis evaluating {profile?.name || profile?.ticker || 'company'} with institutional precision and full calculation transparency.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="px-2.5 py-1 rounded-md bg-[#131B2F] border border-slate-700 text-cyan-400 font-mono">
                        Base Currency: {currency} ({currSym})
                    </span>
                </div>
            </div>

            {/* ======================================================== */}
            {/* MODULE 1: EARNINGS-BASED VALUATION (8 Metrics) */}
            {/* ======================================================== */}
            <div className="bg-[#131B2F] border border-[#2A344A] rounded-2xl overflow-hidden shadow-lg transition-all">
                {/* Header with Title + Eye Icon + Collapse Trigger */}
                <div 
                    onClick={() => toggleCollapse('earnings')}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors select-none"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                            1
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                    Earnings-Based Valuation
                                </h3>
                                {/* Section Eye Icon (Toggles explanation without collapsing) */}
                                <button
                                    type="button"
                                    onClick={(e) => toggleExplanation(e, 'earnings')}
                                    title="Toggle section explanation"
                                    aria-label="Toggle Earnings-Based Valuation explanation"
                                    className="p-1 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                                >
                                    {showExplanation.earnings ? <EyeOff className="w-4 h-4 text-blue-400" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-[#8B9CC3]">
                                8 standard multiples comparing share price and enterprise value against current & forward earning power.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-medium hidden sm:inline">8 Metrics</span>
                        {collapsed.earnings ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
                    </div>
                </div>

                {/* Section Explanation Banner (Revealed by Eye icon) */}
                {showExplanation.earnings && (
                    <div className="px-5 py-3.5 bg-blue-950/30 border-y border-blue-800/40 text-xs text-blue-200 leading-relaxed flex items-start gap-2.5 animate-in fade-in">
                        <Eye className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="font-bold text-blue-300 block mb-0.5">About Earnings-Based Valuation:</span>
                            Earnings-based multiples answer the fundamental question: <em>"How many rupees or dollars are investors paying for every unit of profit, sales, or cash flow the company produces?"</em> These 8 metrics examine valuation from both an equity shareholder perspective (P/E, Forward P/E, P/S, P/B) and a total enterprise takeover perspective (EV/EBITDA, EV/EBIT, EV/Sales).
                        </div>
                    </div>
                )}

                {/* Expandable Module Content */}
                {!collapsed.earnings && (
                    <div className="p-5 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
                        <ValuationMetricCard
                            abbreviation={earnings_valuation.pe.abbreviation}
                            name={earnings_valuation.pe.name}
                            value={earnings_valuation.pe.value}
                            formattedValue={earnings_valuation.pe.formatted_value}
                            formula={earnings_valuation.pe.formula}
                            explanation={earnings_valuation.pe.explanation}
                            interpretation={earnings_valuation.pe.interpretation}
                            source={earnings_valuation.pe.source}
                            badge="Equity Multiple"
                            subtext="Trailing 12-month net income"
                        />
                        <ValuationMetricCard
                            abbreviation={earnings_valuation.forward_pe.abbreviation}
                            name={earnings_valuation.forward_pe.name}
                            value={earnings_valuation.forward_pe.value}
                            formattedValue={earnings_valuation.forward_pe.formatted_value}
                            formula={earnings_valuation.forward_pe.formula}
                            explanation={earnings_valuation.forward_pe.explanation}
                            interpretation={earnings_valuation.forward_pe.interpretation}
                            source={earnings_valuation.forward_pe.source}
                            badge="Forward Multiple"
                            subtext="Projected next 12M consensus"
                        />
                        <ValuationMetricCard
                            abbreviation={earnings_valuation.peg.abbreviation}
                            name={earnings_valuation.peg.name}
                            value={earnings_valuation.peg.value}
                            formattedValue={earnings_valuation.peg.formatted_value}
                            formula={earnings_valuation.peg.formula}
                            explanation={earnings_valuation.peg.explanation}
                            interpretation={earnings_valuation.peg.interpretation}
                            source={earnings_valuation.peg.source}
                            badge="Growth-Adjusted"
                            subtext="P/E relative to EPS growth"
                        />
                        <ValuationMetricCard
                            abbreviation={earnings_valuation.ps.abbreviation}
                            name={earnings_valuation.ps.name}
                            value={earnings_valuation.ps.value}
                            formattedValue={earnings_valuation.ps.formatted_value}
                            formula={earnings_valuation.ps.formula}
                            explanation={earnings_valuation.ps.explanation}
                            interpretation={earnings_valuation.ps.interpretation}
                            source={earnings_valuation.ps.source}
                            badge="Top-Line Multiple"
                            subtext="Market value per rupee sales"
                        />
                        <ValuationMetricCard
                            abbreviation={earnings_valuation.pb.abbreviation}
                            name={earnings_valuation.pb.name}
                            value={earnings_valuation.pb.value}
                            formattedValue={earnings_valuation.pb.formatted_value}
                            formula={earnings_valuation.pb.formula}
                            explanation={earnings_valuation.pb.explanation}
                            interpretation={earnings_valuation.pb.interpretation}
                            source={earnings_valuation.pb.source}
                            badge="Asset Multiple"
                            subtext="Book equity on balance sheet"
                        />
                        <ValuationMetricCard
                            abbreviation={earnings_valuation.ev_ebitda.abbreviation}
                            name={earnings_valuation.ev_ebitda.name}
                            value={earnings_valuation.ev_ebitda.value}
                            formattedValue={earnings_valuation.ev_ebitda.formatted_value}
                            formula={earnings_valuation.ev_ebitda.formula}
                            explanation={earnings_valuation.ev_ebitda.explanation}
                            interpretation={earnings_valuation.ev_ebitda.interpretation}
                            source={earnings_valuation.ev_ebitda.source}
                            badge="Enterprise Multiple"
                            subtext="Debt-neutral cash proxy"
                        />
                        <ValuationMetricCard
                            abbreviation={earnings_valuation.ev_ebit.abbreviation}
                            name={earnings_valuation.ev_ebit.name}
                            value={earnings_valuation.ev_ebit.value}
                            formattedValue={earnings_valuation.ev_ebit.formatted_value}
                            formula={earnings_valuation.ev_ebit.formula}
                            explanation={earnings_valuation.ev_ebit.explanation}
                            interpretation={earnings_valuation.ev_ebit.interpretation}
                            source={earnings_valuation.ev_ebit.source}
                            badge="Operational Multiple"
                            subtext="Operating profit after D&A"
                        />
                        <ValuationMetricCard
                            abbreviation={earnings_valuation.ev_sales.abbreviation}
                            name={earnings_valuation.ev_sales.name}
                            value={earnings_valuation.ev_sales.value}
                            formattedValue={earnings_valuation.ev_sales.formatted_value}
                            formula={earnings_valuation.ev_sales.formula}
                            explanation={earnings_valuation.ev_sales.explanation}
                            interpretation={earnings_valuation.ev_sales.interpretation}
                            source={earnings_valuation.ev_sales.source}
                            badge="Enterprise Multiple"
                            subtext="Total takeover value per sales"
                        />
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* MODULE 2: GROWTH-ADJUSTED VALUATION */}
            {/* ======================================================== */}
            <div className="bg-[#131B2F] border border-[#2A344A] rounded-2xl overflow-hidden shadow-lg transition-all">
                <div 
                    onClick={() => toggleCollapse('growth')}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors select-none"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                            2
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                    Growth-Adjusted Valuation
                                </h3>
                                <button
                                    type="button"
                                    onClick={(e) => toggleExplanation(e, 'growth')}
                                    title="Toggle section explanation"
                                    aria-label="Toggle Growth-Adjusted Valuation explanation"
                                    className="p-1 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                                >
                                    {showExplanation.growth ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-[#8B9CC3]">
                                Checks whether premium multiples are backed by actual top-line and cash flow expansion.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-medium hidden sm:inline">5 Metrics</span>
                        {collapsed.growth ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
                    </div>
                </div>

                {showExplanation.growth && (
                    <div className="px-5 py-3.5 bg-emerald-950/30 border-y border-emerald-800/40 text-xs text-emerald-200 leading-relaxed flex items-start gap-2.5 animate-in fade-in">
                        <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="font-bold text-emerald-300 block mb-0.5">About Growth-Adjusted Valuation:</span>
                            A stock trading at a 35x P/E might actually be much cheaper than a stock at 15x P/E if the 35x company is growing earnings at 40% annually while the 15x company has zero growth. Growth-adjusted valuation factors in earnings trajectory (PEG Ratio), Rule of 40 performance, and real Free Cash Flow expansion.
                        </div>
                    </div>
                )}

                {!collapsed.growth && (
                    <div className="p-5 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in">
                        <ValuationMetricCard
                            abbreviation={growth_valuation.peg_ratio.abbreviation}
                            name={growth_valuation.peg_ratio.name}
                            value={growth_valuation.peg_ratio.value}
                            formattedValue={growth_valuation.peg_ratio.formatted_value}
                            formula={growth_valuation.peg_ratio.formula}
                            explanation={growth_valuation.peg_ratio.explanation}
                            interpretation={growth_valuation.peg_ratio.interpretation}
                            badge="PEG"
                            subtext="Hurdle: < 1.0 attractive"
                        />
                        <ValuationMetricCard
                            abbreviation={growth_valuation.rule_of_40.abbreviation}
                            name={growth_valuation.rule_of_40.name}
                            value={growth_valuation.rule_of_40.value}
                            formattedValue={growth_valuation.rule_of_40.formatted_value}
                            formula={growth_valuation.rule_of_40.formula}
                            explanation={growth_valuation.rule_of_40.explanation}
                            interpretation={growth_valuation.rule_of_40.interpretation}
                            badge="Benchmark"
                            subtext="Hurdle: > 40% healthy"
                        />
                        <ValuationMetricCard
                            abbreviation={growth_valuation.price_to_fcf.abbreviation}
                            name={growth_valuation.price_to_fcf.name}
                            value={growth_valuation.price_to_fcf.value}
                            formattedValue={growth_valuation.price_to_fcf.formatted_value}
                            formula={growth_valuation.price_to_fcf.formula}
                            explanation={growth_valuation.price_to_fcf.explanation}
                            interpretation={growth_valuation.price_to_fcf.interpretation}
                            badge="Cash Multiple"
                            subtext="Price per rupee of FCF"
                        />
                        <ValuationMetricCard
                            abbreviation={growth_valuation.fcf_growth.abbreviation}
                            name={growth_valuation.fcf_growth.name}
                            value={growth_valuation.fcf_growth.value}
                            formattedValue={growth_valuation.fcf_growth.formatted_value}
                            formula={growth_valuation.fcf_growth.formula}
                            explanation={growth_valuation.fcf_growth.explanation}
                            interpretation={growth_valuation.fcf_growth.interpretation}
                            badge="FCF YoY"
                            subtext="Cash generation expansion"
                        />
                        <ValuationMetricCard
                            abbreviation={growth_valuation.profit_growth.abbreviation}
                            name={growth_valuation.profit_growth.name}
                            value={growth_valuation.profit_growth.value}
                            formattedValue={growth_valuation.profit_growth.formatted_value}
                            formula={growth_valuation.profit_growth.formula}
                            explanation={growth_valuation.profit_growth.explanation}
                            interpretation={growth_valuation.profit_growth.interpretation}
                            badge="Net Profit YoY"
                            subtext="Bottom-line earnings pace"
                        />
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* MODULE 3: HISTORICAL VALUATION */}
            {/* ======================================================== */}
            <div className="bg-[#131B2F] border border-[#2A344A] rounded-2xl overflow-hidden shadow-lg transition-all">
                <div 
                    onClick={() => toggleCollapse('historical')}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors select-none"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                            3
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                    Historical Valuation
                                </h3>
                                <button
                                    type="button"
                                    onClick={(e) => toggleExplanation(e, 'historical')}
                                    title="Toggle section explanation"
                                    aria-label="Toggle Historical Valuation explanation"
                                    className="p-1 rounded-md text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition-colors"
                                >
                                    {showExplanation.historical ? <EyeOff className="w-4 h-4 text-purple-400" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-[#8B9CC3]">
                                Multi-period valuation trends across official reported annual financial statements.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {historical_valuation.avg_pe && (
                            <span className="text-xs px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 hidden sm:inline">
                                Historical Avg P/E: {historical_valuation.avg_pe.toFixed(1)}x
                            </span>
                        )}
                        {collapsed.historical ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
                    </div>
                </div>

                {showExplanation.historical && (
                    <div className="px-5 py-3.5 bg-purple-950/30 border-y border-purple-800/40 text-xs text-purple-200 leading-relaxed flex items-start gap-2.5 animate-in fade-in">
                        <History className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="font-bold text-purple-300 block mb-0.5">About Historical Valuation:</span>
                            Multiples mean very little in a vacuum. A company currently trading at 25x P/E may seem expensive, but if it has historically traded at a 40x P/E during healthy economic conditions, it is currently trading at a 37.5% historical discount. This module plots valuation multiples and margins across every reported financial statement.
                        </div>
                    </div>
                )}

                {!collapsed.historical && (
                    <div className="p-5 pt-2 space-y-4 animate-in fade-in">
                        {/* Summary Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-[#0C1222] p-3.5 rounded-xl border border-slate-800">
                                <span className="text-slate-400 text-xs block mb-1">Historical Average P/E</span>
                                <span className="text-lg font-bold text-white">
                                    {historical_valuation.avg_pe ? `${historical_valuation.avg_pe.toFixed(2)}x` : 'Not available'}
                                </span>
                            </div>
                            <div className="bg-[#0C1222] p-3.5 rounded-xl border border-slate-800">
                                <span className="text-slate-400 text-xs block mb-1">Current Multiple vs Historical Avg</span>
                                <span className={`text-lg font-bold ${
                                    historical_valuation.current_vs_avg_pe_pct !== null && historical_valuation.current_vs_avg_pe_pct !== undefined
                                        ? historical_valuation.current_vs_avg_pe_pct < 0 ? 'text-emerald-400' : 'text-amber-400'
                                        : 'text-slate-400'
                                }`}>
                                    {historical_valuation.current_vs_avg_pe_pct !== null && historical_valuation.current_vs_avg_pe_pct !== undefined
                                        ? `${historical_valuation.current_vs_avg_pe_pct >= 0 ? '+' : ''}${historical_valuation.current_vs_avg_pe_pct.toFixed(1)}%`
                                        : 'Not available'}
                                </span>
                            </div>
                            <div className="bg-[#0C1222] p-3.5 rounded-xl border border-slate-800">
                                <span className="text-slate-400 text-xs block mb-1">Valuation Status</span>
                                <span className="text-sm font-semibold text-purple-300">
                                    {historical_valuation.current_vs_avg_pe_pct !== null && historical_valuation.current_vs_avg_pe_pct !== undefined
                                        ? historical_valuation.current_vs_avg_pe_pct < -10
                                            ? "Trading below historical mean"
                                            : historical_valuation.current_vs_avg_pe_pct > 10
                                                ? "Trading above historical mean"
                                                : "In-line with historical mean"
                                        : "Insufficient historical depth"}
                                </span>
                            </div>
                        </div>

                        {/* Statement Historical Multiples Table */}
                        <div className="overflow-x-auto rounded-xl border border-slate-800">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#0C1222] text-slate-400 uppercase font-semibold border-b border-slate-800">
                                    <tr>
                                        <th className="px-4 py-2.5">Period Date</th>
                                        <th className="px-4 py-2.5">Revenue</th>
                                        <th className="px-4 py-2.5">Net Profit</th>
                                        <th className="px-4 py-2.5">Operating Margin</th>
                                        <th className="px-4 py-2.5">Net Margin</th>
                                        <th className="px-4 py-2.5 text-right">Implied P/E</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/80 font-mono">
                                    {historical_valuation.history.map((h, i) => (
                                        <tr key={h.date || i} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-2.5 text-slate-300 font-bold">{h.date}</td>
                                            <td className="px-4 py-2.5 text-slate-200">{formatCurrency(h.revenue, currency)}</td>
                                            <td className="px-4 py-2.5 text-slate-200">{formatCurrency(h.net_profit, currency)}</td>
                                            <td className="px-4 py-2.5 text-cyan-400">{formatPercentage(h.operating_margin)}</td>
                                            <td className="px-4 py-2.5 text-emerald-400">{formatPercentage(h.net_margin)}</td>
                                            <td className="px-4 py-2.5 text-right text-purple-300 font-bold">
                                                {h.estimated_pe ? `${h.estimated_pe.toFixed(1)}x` : 'Not available'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* MODULE 4: RELATIVE / PEER VALUATION */}
            {/* ======================================================== */}
            <div className="bg-[#131B2F] border border-[#2A344A] rounded-2xl overflow-hidden shadow-lg transition-all">
                <div 
                    onClick={() => toggleCollapse('relative')}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors select-none"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                            4
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                    Relative & Peer Valuation
                                </h3>
                                <button
                                    type="button"
                                    onClick={(e) => toggleExplanation(e, 'relative')}
                                    title="Toggle section explanation"
                                    aria-label="Toggle Relative Valuation explanation"
                                    className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                                >
                                    {showExplanation.relative ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-[#8B9CC3]">
                                Benchmarks company multiples against typical {relative_valuation.sector || 'Sector'} industry norms.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 hidden sm:inline">
                            {relative_valuation.status_badge}
                        </span>
                        {collapsed.relative ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
                    </div>
                </div>

                {showExplanation.relative && (
                    <div className="px-5 py-3.5 bg-amber-950/30 border-y border-amber-800/40 text-xs text-amber-200 leading-relaxed flex items-start gap-2.5 animate-in fade-in">
                        <Users className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="font-bold text-amber-300 block mb-0.5">About Relative / Peer Valuation:</span>
                            Different industries have completely different capital requirements, profit margins, and growth ceilings. For instance, utility firms and banks trade at much lower P/E multiples than software companies. This module benchmarks the stock against sector peer norms to determine whether it commands an unjustified premium or trades at a compelling discount.
                        </div>
                    </div>
                )}

                {!collapsed.relative && (
                    <div className="p-5 pt-2 space-y-4 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* P/E Benchmark Comparison */}
                            <div className="bg-[#0C1222] p-4 rounded-xl border border-slate-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-300">Price to Earnings (P/E)</span>
                                    <ValuationTooltip
                                        abbreviation="P/E vs Sector"
                                        name="Sector P/E Comparison"
                                        explanation="Compares the stock's current P/E multiple against the average P/E for companies in the same sector."
                                        formula="((Stock P/E - Sector Benchmark P/E) ÷ Sector Benchmark P/E) × 100"
                                        interpretation="A negative percentage means the stock trades at a discount to industry peers; positive means a valuation premium."
                                    />
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <div>
                                        <span className="text-2xl font-extrabold text-white">
                                            {relative_valuation.stock_pe ? `${relative_valuation.stock_pe.toFixed(1)}x` : 'Not available'}
                                        </span>
                                        <span className="text-xs text-slate-500 ml-1.5">Stock</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-semibold text-slate-400">
                                            {relative_valuation.benchmark_pe ? `${relative_valuation.benchmark_pe.toFixed(1)}x` : '—'}
                                        </span>
                                        <span className="text-[10px] text-slate-500 block">Sector Avg</span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Relative Difference:</span>
                                    <span className={`font-bold ${
                                        relative_valuation.pe_discount_premium_pct !== null && relative_valuation.pe_discount_premium_pct !== undefined
                                            ? relative_valuation.pe_discount_premium_pct < 0 ? 'text-emerald-400' : 'text-amber-400'
                                            : 'text-slate-500'
                                    }`}>
                                        {relative_valuation.pe_discount_premium_pct !== null && relative_valuation.pe_discount_premium_pct !== undefined
                                            ? `${relative_valuation.pe_discount_premium_pct >= 0 ? '+' : ''}${relative_valuation.pe_discount_premium_pct.toFixed(1)}%`
                                            : 'Not available'}
                                    </span>
                                </div>
                            </div>

                            {/* P/B Benchmark Comparison */}
                            <div className="bg-[#0C1222] p-4 rounded-xl border border-slate-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-300">Price to Book (P/B)</span>
                                    <ValuationTooltip
                                        abbreviation="P/B vs Sector"
                                        name="Sector P/B Comparison"
                                        explanation="Compares the stock's Price-to-Book multiple against the median peer P/B for the sector."
                                        formula="Stock P/B vs Sector Benchmark P/B"
                                        interpretation="Capital-intensive sectors typically carry low P/B multiples."
                                    />
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <div>
                                        <span className="text-2xl font-extrabold text-white">
                                            {relative_valuation.stock_pb ? `${relative_valuation.stock_pb.toFixed(1)}x` : 'Not available'}
                                        </span>
                                        <span className="text-xs text-slate-500 ml-1.5">Stock</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-semibold text-slate-400">
                                            {relative_valuation.benchmark_pb ? `${relative_valuation.benchmark_pb.toFixed(1)}x` : '—'}
                                        </span>
                                        <span className="text-[10px] text-slate-500 block">Sector Avg</span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Industry:</span>
                                    <span className="text-slate-300 font-medium truncate max-w-[150px]" title={relative_valuation.industry}>
                                        {relative_valuation.industry || 'General Industry'}
                                    </span>
                                </div>
                            </div>

                            {/* EV/EBITDA Benchmark Comparison */}
                            <div className="bg-[#0C1222] p-4 rounded-xl border border-slate-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-300">EV to EBITDA</span>
                                    <ValuationTooltip
                                        abbreviation="EV/EBITDA vs Sector"
                                        name="Sector EV/EBITDA Comparison"
                                        explanation="Compares the company's enterprise takeover multiple against typical sector peer transactions."
                                        formula="Enterprise Value ÷ EBITDA vs Sector Median"
                                        interpretation="Takes full account of debt and cash balances on the balance sheet."
                                    />
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <div>
                                        <span className="text-2xl font-extrabold text-white">
                                            {relative_valuation.stock_ev_ebitda ? `${relative_valuation.stock_ev_ebitda.toFixed(1)}x` : 'Not available'}
                                        </span>
                                        <span className="text-xs text-slate-500 ml-1.5">Stock</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-semibold text-slate-400">
                                            {relative_valuation.benchmark_ev_ebitda ? `${relative_valuation.benchmark_ev_ebitda.toFixed(1)}x` : '—'}
                                        </span>
                                        <span className="text-[10px] text-slate-500 block">Sector Avg</span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Sector Context:</span>
                                    <span className="text-amber-300 font-semibold">
                                        {relative_valuation.sector || 'General Market'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* MODULE 5: DISCOUNTED CASH FLOW (DCF) */}
            {/* ======================================================== */}
            <div className="bg-[#131B2F] border border-[#2A344A] rounded-2xl overflow-hidden shadow-lg transition-all">
                <div 
                    onClick={() => toggleCollapse('dcf')}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors select-none"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                            5
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                    Discounted Cash Flow (DCF) Model
                                </h3>
                                <button
                                    type="button"
                                    onClick={(e) => toggleExplanation(e, 'dcf')}
                                    title="Toggle section explanation"
                                    aria-label="Toggle DCF Valuation explanation"
                                    className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                                >
                                    {showExplanation.dcf ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-[#8B9CC3]">
                                5-year intrinsic valuation discounting future Free Cash Flows with fully disclosed assumptions.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {dcf_valuation.is_available ? (
                            <span className="text-xs px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hidden sm:inline">
                                Fair Value: {formatCurrency(dcf_valuation.intrinsic_value_per_share, currency)}
                            </span>
                        ) : (
                            <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 hidden sm:inline">
                                DCF Not available
                            </span>
                        )}
                        {collapsed.dcf ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
                    </div>
                </div>

                {showExplanation.dcf && (
                    <div className="px-5 py-3.5 bg-cyan-950/30 border-y border-cyan-800/40 text-xs text-cyan-200 leading-relaxed flex items-start gap-2.5 animate-in fade-in">
                        <DollarSign className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="font-bold text-cyan-300 block mb-0.5">About Discounted Cash Flow (DCF):</span>
                            DCF is the cornerstone of institutional fundamental analysis. It estimates what the entire business is worth today by calculating the sum of all future cash flows it will produce, discounted back to the present using an opportunity cost of capital (WACC). When Free Cash Flow is negative or unavailable, DCF is marked as unavailable to avoid speculative guesses.
                        </div>
                    </div>
                )}

                {!collapsed.dcf && (
                    <div className="p-5 pt-2 space-y-5 animate-in fade-in">
                        {/* If DCF is unavailable, display honest explanation without fabricating values */}
                        {!dcf_valuation.is_available ? (
                            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-300">DCF Calculation Not Available</h4>
                                    <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                                        {dcf_valuation.reason || "DCF requires positive and sustainable Free Cash Flow to avoid speculative extrapolation."}
                                    </p>
                                    <div className="mt-3 text-[11px] text-slate-400">
                                        Rule: Zero hallucination policy. We never invent forecasts or cash flow trajectories for loss-making or cash-burning periods.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Intrinsic Value vs Current Market Price Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-[#0C1222] p-4 rounded-xl border border-cyan-500/30 shadow-md">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold text-slate-400">Intrinsic Value / Share</span>
                                            <ValuationTooltip
                                                abbreviation="Fair Value"
                                                name="DCF Intrinsic Value Per Share"
                                                explanation="The estimated fundamental fair price of one share based on the present value of projected 5-year cash flows plus discounted terminal value."
                                                formula="(Enterprise Value - Net Debt) ÷ Diluted Shares Outstanding"
                                                interpretation="If Intrinsic Value > Market Price, the stock is theoretically undervalued."
                                            />
                                        </div>
                                        <div className="text-2xl font-black text-cyan-400">
                                            {formatCurrency(dcf_valuation.intrinsic_value_per_share, currency)}
                                        </div>
                                        <span className="text-[10px] text-slate-500 mt-1 block">5-Yr Discounted FCF Model</span>
                                    </div>

                                    <div className="bg-[#0C1222] p-4 rounded-xl border border-slate-800">
                                        <span className="text-xs font-semibold text-slate-400 block mb-1">Current Market Price</span>
                                        <div className="text-2xl font-black text-white">
                                            {formatCurrency(dcf_valuation.current_price, currency)}
                                        </div>
                                        <span className="text-[10px] text-slate-500 mt-1 block">Live market price</span>
                                    </div>

                                    <div className="bg-[#0C1222] p-4 rounded-xl border border-slate-800">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold text-slate-400">Implied Margin of Safety</span>
                                            <ValuationTooltip
                                                abbreviation="Margin of Safety"
                                                name="Discount to Intrinsic Value"
                                                explanation="The percentage difference between the calculated intrinsic fair value and the current market price."
                                                formula="((Intrinsic Value - Market Price) ÷ Market Price) × 100"
                                                interpretation="Positive indicates potential upside discount; negative indicates market price exceeds DCF model valuation."
                                            />
                                        </div>
                                        <div className={`text-2xl font-black ${
                                            (dcf_valuation.margin_of_safety_pct || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                        }`}>
                                            {dcf_valuation.margin_of_safety_pct !== null && dcf_valuation.margin_of_safety_pct !== undefined
                                                ? `${dcf_valuation.margin_of_safety_pct >= 0 ? '+' : ''}${dcf_valuation.margin_of_safety_pct.toFixed(1)}%`
                                                : 'Not available'}
                                        </div>
                                        <span className="text-[10px] text-slate-500 mt-1 block">
                                            {(dcf_valuation.margin_of_safety_pct || 0) >= 0 ? 'Implied Discount' : 'Implied Premium'}
                                        </span>
                                    </div>
                                </div>

                                {/* Disclosed Assumptions Table */}
                                <div className="p-4 bg-[#0C1222] border border-slate-800 rounded-xl space-y-3">
                                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                                        Disclosed Model Assumptions
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                        <div>
                                            <span className="text-slate-500 block text-[11px]">Base Free Cash Flow</span>
                                            <span className="font-mono font-bold text-slate-200">
                                                {formatCurrency(dcf_valuation.assumptions.base_fcf, currency)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block text-[11px]">5-Yr Growth Rate</span>
                                            <span className="font-mono font-bold text-cyan-400">
                                                {dcf_valuation.assumptions.growth_rate_pct}% p.a.
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block text-[11px]">Discount Rate (WACC)</span>
                                            <span className="font-mono font-bold text-slate-200">
                                                {dcf_valuation.assumptions.discount_rate_pct}%
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block text-[11px]">Terminal Growth Rate</span>
                                            <span className="font-mono font-bold text-slate-200">
                                                {dcf_valuation.assumptions.terminal_growth_rate_pct}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 5-Year Cash Flow Projection Schedule */}
                                <div className="overflow-x-auto rounded-xl border border-slate-800">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#0C1222] text-slate-400 uppercase font-semibold border-b border-slate-800">
                                            <tr>
                                                <th className="px-4 py-2">Forecast Horizon</th>
                                                <th className="px-4 py-2">Projected Free Cash Flow</th>
                                                <th className="px-4 py-2 text-right">Discounted Present Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/80 font-mono text-xs">
                                            {dcf_valuation.projected_fcf.map((p, idx) => (
                                                <tr key={idx} className="hover:bg-slate-800/30">
                                                    <td className="px-4 py-2 font-sans font-medium text-slate-300">{p.year}</td>
                                                    <td className="px-4 py-2 text-slate-200">{formatCurrency(p.projected_fcf, currency)}</td>
                                                    <td className="px-4 py-2 text-right text-cyan-400">{formatCurrency(p.present_value, currency)}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-cyan-950/20 font-bold border-t border-slate-700">
                                                <td className="px-4 py-2 font-sans text-cyan-300">Terminal Value (PV)</td>
                                                <td className="px-4 py-2 text-slate-300">{formatCurrency(dcf_valuation.terminal_value, currency)}</td>
                                                <td className="px-4 py-2 text-right text-cyan-300">{formatCurrency(dcf_valuation.present_value_terminal, currency)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* MODULE 6: VALUATION QUALITY AND RISK */}
            {/* ======================================================== */}
            <div className="bg-[#131B2F] border border-[#2A344A] rounded-2xl overflow-hidden shadow-lg transition-all">
                <div 
                    onClick={() => toggleCollapse('quality')}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors select-none"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-sm">
                            6
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                    Valuation Quality and Risk
                                </h3>
                                <button
                                    type="button"
                                    onClick={(e) => toggleExplanation(e, 'quality')}
                                    title="Toggle section explanation"
                                    aria-label="Toggle Valuation Quality and Risk explanation"
                                    className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                >
                                    {showExplanation.quality ? <EyeOff className="w-4 h-4 text-rose-400" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-[#8B9CC3]">
                                Solvency hurdles, interest coverage safety, earnings cash conversion, and systemic beta risk.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 hidden sm:inline">
                            {quality_risk.overall_risk_badge}
                        </span>
                        {collapsed.quality ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
                    </div>
                </div>

                {showExplanation.quality && (
                    <div className="px-5 py-3.5 bg-rose-950/30 border-y border-rose-800/40 text-xs text-rose-200 leading-relaxed flex items-start gap-2.5 animate-in fade-in">
                        <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="font-bold text-rose-300 block mb-0.5">About Valuation Quality & Risk:</span>
                            A company might appear statistically cheap on paper (e.g. 8x P/E) because it carries enormous hidden debt or because its reported profits are accounting paper gains that never convert into real cash. This module tests the structural integrity of the balance sheet and earnings quality to guard against "value traps".
                        </div>
                    </div>
                )}

                {!collapsed.quality && (
                    <div className="p-5 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
                        <ValuationMetricCard
                            abbreviation={quality_risk.interest_coverage.abbreviation}
                            name={quality_risk.interest_coverage.name}
                            value={quality_risk.interest_coverage.value}
                            formattedValue={quality_risk.interest_coverage.formatted_value}
                            formula={quality_risk.interest_coverage.formula}
                            explanation={quality_risk.interest_coverage.explanation}
                            interpretation={quality_risk.interest_coverage.interpretation}
                            badge="Solvency"
                            subtext="Hurdle: > 3.0x safe"
                        />
                        <ValuationMetricCard
                            abbreviation={quality_risk.debt_to_equity.abbreviation}
                            name={quality_risk.debt_to_equity.name}
                            value={quality_risk.debt_to_equity.value}
                            formattedValue={quality_risk.debt_to_equity.formatted_value}
                            formula={quality_risk.debt_to_equity.formula}
                            explanation={quality_risk.debt_to_equity.explanation}
                            interpretation={quality_risk.debt_to_equity.interpretation}
                            badge="Leverage"
                            subtext="Hurdle: < 0.5 conservative"
                        />
                        <ValuationMetricCard
                            abbreviation={quality_risk.cash_conversion.abbreviation}
                            name={quality_risk.cash_conversion.name}
                            value={quality_risk.cash_conversion.value}
                            formattedValue={quality_risk.cash_conversion.formatted_value}
                            formula={quality_risk.cash_conversion.formula}
                            explanation={quality_risk.cash_conversion.explanation}
                            interpretation={quality_risk.cash_conversion.interpretation}
                            badge="Earnings Quality"
                            subtext="Hurdle: > 0.90 high quality"
                        />
                        <ValuationMetricCard
                            abbreviation={quality_risk.beta.abbreviation}
                            name={quality_risk.beta.name}
                            value={quality_risk.beta.value}
                            formattedValue={quality_risk.beta.formatted_value}
                            formula={quality_risk.beta.formula}
                            explanation={quality_risk.beta.explanation}
                            interpretation={quality_risk.beta.interpretation}
                            badge="Market Risk"
                            subtext="Beta = 1.0 matches market"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

