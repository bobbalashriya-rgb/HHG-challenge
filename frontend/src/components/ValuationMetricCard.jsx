import React from 'react';
import ValuationTooltip from './ValuationTooltip';

export default function ValuationMetricCard({
    abbreviation,
    name,
    value,
    formattedValue,
    formula,
    explanation,
    interpretation,
    source,
    unit = "ratio",
    subtext,
    badge
}) {
    const isAvailable = value !== null && value !== undefined && formattedValue !== 'Not available';

    return (
        <div className="bg-[#10172A] border border-[#232D42] hover:border-blue-500/40 rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between group">
            {/* Top row: Title + Tooltip */}
            <div>
                <div className="flex items-start justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-[#C3D2FB] group-hover:text-blue-400 transition-colors">
                            {abbreviation}
                        </span>
                        <ValuationTooltip
                            abbreviation={abbreviation}
                            name={name}
                            explanation={explanation}
                            formula={formula}
                            interpretation={interpretation}
                            source={source}
                            unit={unit}
                        />
                    </div>
                    {badge && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
                            {badge}
                        </span>
                    )}
                </div>
                
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-1" title={name}>
                    {name}
                </p>
            </div>

            {/* Middle: Prominent Value */}
            <div className="my-3">
                <span className={`text-2xl font-extrabold tracking-tight ${
                    isAvailable ? 'text-white' : 'text-slate-500 font-medium text-base'
                }`}>
                    {formattedValue || (isAvailable ? `${value.toFixed(2)}x` : 'Not available')}
                </span>
            </div>

            {/* Bottom: Subtext context */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span className="truncate max-w-[170px]" title={subtext || formula}>
                    {subtext || "Calculated multiple"}
                </span>
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-600">
                    {isAvailable ? "Verified" : "Missing"}
                </span>
            </div>
        </div>
    );
}

