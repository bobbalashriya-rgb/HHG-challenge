import React, { useState } from 'react';
import { askFinolitics } from '../services/api';
import { Loader2 } from 'lucide-react';

export default function AskFinolitics({ context }) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAsk = async (e) => {
        e.preventDefault();
        if(!question.trim()) return;
        setLoading(true);
        try {
            const res = await askFinolitics(context, question);
            setAnswer(res.answer);
        } catch (err) {
            setAnswer("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Ask Finolitics</h3>
            <p className="text-sm text-slate-500 mb-4">Ask interactive questions strictly about the data currently loaded above.</p>
            <form onSubmit={handleAsk} className="flex gap-4 mb-4">
                <input 
                    type="text" 
                    value={question} 
                    onChange={(e)=>setQuestion(e.target.value)} 
                    placeholder="e.g. Why did the company fail my valuation principle?"
                    className="flex-1 border border-slate-300 rounded-md px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none shadow-inner"
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !question.trim()} className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center hover:bg-blue-700 transition">
                    {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />} Ask AI
                </button>
            </form>
            {answer && (
                <div className="p-5 bg-blue-50 border border-blue-100 rounded-md shadow-sm">
                    <p className="text-blue-900 whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
                </div>
            )}
        </div>
    );
}

