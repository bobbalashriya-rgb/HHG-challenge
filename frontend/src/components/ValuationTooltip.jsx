import React, { useState, useRef, useEffect } from 'react';
import { Info, HelpCircle } from 'lucide-react';

export default function ValuationTooltip({ 
    abbreviation, 
    name, 
    explanation, 
    formula, 
    interpretation, 
    source = "YFinance & Statements",
    unit 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close tooltip on outside click or Escape key
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const toggleTooltip = (e) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(prev => !prev);
        }
    };

    return (
        <div 
            ref={containerRef} 
            className="relative inline-flex items-center"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                type="button"
                onClick={toggleTooltip}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setIsOpen(false)}
                aria-label={`Learn about ${name || abbreviation}`}
                aria-expanded={isOpen}
                tabIndex={0}
                className="text-slate-400 hover:text-blue-400 focus:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-full p-0.5 transition-colors"
            >
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer" />
            </button>

            {isOpen && (
                <div 
                    role="tooltip"
                    className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3.5 bg-[#0C1222] border border-blue-500/30 rounded-xl shadow-2xl text-left text-xs backdrop-blur-md animate-in fade-in zoom-in-95 pointer-events-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                        <span className="font-bold text-blue-300 text-xs tracking-wide">
                            {abbreviation} {name && name !== abbreviation ? `— ${name}` : ''}
                        </span>
                        {unit && (
                            <span className="text-[10px] uppercase font-semibold text-slate-500 px-1.5 py-0.5 bg-slate-900 rounded">
                                {unit}
                            </span>
                        )}
                    </div>

                    {/* Explanation */}
                    <div className="text-slate-300 text-xs leading-relaxed mb-2.5">
                        {explanation}
                    </div>

                    {/* Formula */}
                    {formula && (
                        <div className="bg-[#141E33] border border-slate-800/80 rounded-lg p-2 mb-2 text-[11px] font-mono text-cyan-300">
                            <span className="text-slate-400 font-sans block text-[10px] uppercase font-bold tracking-wider mb-0.5">Formula:</span>
                            {formula}
                        </div>
                    )}

                    {/* Interpretation */}
                    {interpretation && (
                        <div className="text-[11px] text-slate-400 leading-snug pt-1 border-t border-slate-800/60">
                            <span className="text-amber-400 font-semibold">How to read: </span>
                            {interpretation}
                        </div>
                    )}

                    {/* Source footer */}
                    {source && (
                        <div className="mt-2 text-[9px] text-slate-500 text-right">
                            Source: {source}
                        </div>
                    )}

                    {/* Triangle pointer */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#0C1222]" />
                </div>
            )}
        </div>
    );
}

