import { useState } from 'react';
import { documentService } from '../../services/documentService';

export default function ShareModal({ isOpen, onClose, document, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [access, setAccess] = useState('view');
    const [error, setError] = useState('');

    if (!isOpen || !document) return null;

    const shareUrl = document.shareToken
        ? `${window.location.origin}/document/shared/${document.shareToken}`
        : null;

    async function generateLink() {
        setLoading(true);
        setError('');
        try {
            const res = await documentService.generateShareLink(
                document.id,
                access
            );
            onUpdate(res.data.data);
        } catch (err) {
            setError('Failed to generate share link');
        } finally {
            setLoading(false);
        }
    }

    async function revokeLink() {
        if (!confirm('Revoke this share link? Anyone with the link will lose access.')) return;
        setLoading(true);
        try {
            const res = await documentService.revokeShareLink(document.id);
            onUpdate(res.data.data);
        } catch (err) {
            setError('Failed to revoke link');
        } finally {
            setLoading(false);
        }
    }

    async function copyLink() {
        if (!shareUrl) return;
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm
                        flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700
                            w-full max-w-md shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6
                                border-b border-slate-700">
                    <h2 className="text-white font-semibold">
                        Share Document
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {shareUrl ? (
                        /* Has share link */
                        <div className="flex flex-col gap-3">
                            <p className="text-slate-400 text-sm">
                                Share this link:
                            </p>
                            <div className="flex items-center gap-2">
                                <input
                                    readOnly
                                    value={shareUrl}
                                    className="flex-1 px-3 py-2 bg-slate-900 rounded-lg
                                               text-slate-300 text-xs border border-slate-700
                                               outline-none truncate"
                                />
                                <button
                                    onClick={copyLink}
                                    className="px-3 py-2 bg-primary-600 hover:bg-primary-700
                                               text-white text-xs rounded-lg transition-all
                                               whitespace-nowrap"
                                >
                                    {copied ? '✓ Copied' : 'Copy'}
                                </button>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>Access:</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                    ${document.shareAccess === 'edit'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {document.shareAccess}
                                </span>
                            </div>

                            <button
                                onClick={revokeLink}
                                disabled={loading}
                                className="text-red-400 hover:text-red-300 text-xs
                                           text-left transition-colors disabled:opacity-50"
                            >
                                Revoke link
                            </button>
                        </div>
                    ) : (
                        /* No share link yet */
                        <div className="flex flex-col gap-4">
                            <p className="text-slate-400 text-sm">
                                Generate a share link for this document.
                            </p>

                            <div className="flex flex-col gap-2">
                                <p className="text-slate-300 text-sm font-medium">
                                    Access level
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setAccess('view')}
                                        className={`flex-1 py-2 rounded-lg text-sm
                                                    transition-all border
                                                    ${access === 'view'
                                                        ? 'bg-primary-600 border-primary-500 text-white'
                                                        : 'border-slate-600 text-slate-400 hover:border-slate-500'
                                                    }`}
                                    >
                                        View only
                                    </button>
                                    <button
                                        onClick={() => setAccess('edit')}
                                        className={`flex-1 py-2 rounded-lg text-sm
                                                    transition-all border
                                                    ${access === 'edit'
                                                        ? 'bg-primary-600 border-primary-500 text-white'
                                                        : 'border-slate-600 text-slate-400 hover:border-slate-500'
                                                    }`}
                                    >
                                        Can edit
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={generateLink}
                                disabled={loading}
                                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700
                                           text-white rounded-lg text-sm transition-all
                                           disabled:opacity-50"
                            >
                                {loading ? 'Generating...' : 'Generate Link'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}