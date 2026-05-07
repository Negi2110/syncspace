import { useState } from 'react';
import { aiService } from '../../services/aiService';

const AI_ACTIONS = [
    {
        id: 'summarize',
        label: 'Summarize',
        icon: '📝',
        description: 'Get a concise summary of this document'
    },
    {
        id: 'improve',
        label: 'Improve Writing',
        icon: '✨',
        description: 'Improve clarity and professionalism'
    },
    {
        id: 'fix-grammar',
        label: 'Fix Grammar',
        icon: '🔤',
        description: 'Fix spelling and grammar errors'
    },
    {
        id: 'review-spec',
        label: 'Review Spec',
        icon: '🔍',
        description: 'Check for missing sections and ambiguities'
    }
];

export default function AISidebar({ isOpen, onClose, documentContent, documentTitle }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeAction, setActiveAction] = useState(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    async function handleAction(actionId) {
        if (!documentContent) {
            setError('Document is empty. Add some content first.');
            return;
        }

        // Parse content to plain text for AI
        let plainText = '';
        try {
            const parsed = JSON.parse(documentContent);
            plainText = extractText(parsed);
        } catch {
            plainText = documentContent;
        }

        if (!plainText.trim()) {
            setError('Document is empty. Add some content first.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);
        setActiveAction(actionId);

        try {
            let res;
            switch (actionId) {
                case 'summarize':
                    res = await aiService.summarize(plainText);
                    break;
                case 'improve':
                    res = await aiService.improve(plainText);
                    break;
                case 'fix-grammar':
                    res = await aiService.fixGrammar(plainText);
                    break;
                case 'review-spec':
                    res = await aiService.reviewSpec(plainText);
                    break;
                default:
                    break;
            }
            setResult(res.data.data.result);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'AI service unavailable. Check your API key.'
            );
        } finally {
            setLoading(false);
        }
    }

    function extractText(node) {
        if (!node) return '';
        if (node.type === 'text') return node.text || '';
        if (node.content) {
            return node.content.map(extractText).join(' ');
        }
        return '';
    }

    async function copyResult() {
        if (!result) return;
        await navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-14 bottom-0 w-80 bg-slate-900
                        border-l border-slate-800 flex flex-col z-40
                        shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3
                            border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <h2 className="text-white font-semibold text-sm">
                        AI Assistant
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* Actions */}
            <div className="p-4 border-b border-slate-800">
                <p className="text-slate-500 text-xs mb-3">
                    What would you like help with?
                </p>
                <div className="flex flex-col gap-2">
                    {AI_ACTIONS.map(action => (
                        <button
                            key={action.id}
                            onClick={() => handleAction(action.id)}
                            disabled={loading}
                            className={`flex items-center gap-3 px-3 py-2.5
                                        rounded-lg text-left transition-all
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        ${activeAction === action.id && (loading || result)
                                            ? 'bg-primary-600/20 border border-primary-500/30'
                                            : 'bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600'
                                        }`}
                        >
                            <span className="text-base">{action.icon}</span>
                            <div>
                                <p className="text-slate-200 text-xs font-medium">
                                    {action.label}
                                </p>
                                <p className="text-slate-500 text-xs">
                                    {action.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Result area */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <div className="w-6 h-6 border-2 border-primary-500
                                        border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-500 text-xs">
                            AI is thinking...
                        </p>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30
                                    rounded-lg">
                        <p className="text-red-400 text-xs">{error}</p>
                    </div>
                )}

                {result && !loading && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <p className="text-slate-400 text-xs font-medium">
                                Result
                            </p>
                            <button
                                onClick={copyResult}
                                className="text-xs text-primary-400
                                           hover:text-primary-300 transition-colors"
                            >
                                {copied ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3
                                        border border-slate-700">
                            <p className="text-slate-300 text-xs leading-relaxed
                                          whitespace-pre-wrap">
                                {result}
                            </p>
                        </div>
                    </div>
                )}

                {!loading && !result && !error && (
                    <div className="flex flex-col items-center justify-center
                                    py-8 text-center">
                        <p className="text-slate-600 text-xs">
                            Select an action above to get AI assistance
                            with your document
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}