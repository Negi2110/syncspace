import { useState, useEffect } from 'react';
import { versionService } from '../../services/versionService';

function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
}

export default function VersionHistory({ isOpen, onClose, documentId, onRestore }) {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) fetchVersions();
    }, [isOpen, documentId]);

    async function fetchVersions() {
        setLoading(true);
        setError('');
        try {
            const res = await versionService.getAll(documentId);
            setVersions(res.data.data);
        } catch (err) {
            setError('Failed to load versions');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            await versionService.save(documentId);
            await fetchVersions();
        } catch (err) {
            setError('Failed to save version. Document may be empty.');
        } finally {
            setSaving(false);
        }
    }

    async function handleRestore(versionId) {
        if (!confirm('Restore document to this version?')) return;
        setRestoring(versionId);
        try {
            const res = await versionService.restore(documentId, versionId);
            onRestore(res.data.data.content);
            onClose();
        } catch (err) {
            setError('Failed to restore version');
        } finally {
            setRestoring(null);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-14 bottom-0 w-80 bg-slate-900
                        border-l border-slate-800 flex flex-col z-40 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3
                            border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🕐</span>
                    <h2 className="text-white font-semibold text-sm">
                        Version History
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-300"
                >
                    ✕
                </button>
            </div>

            {/* Save current version */}
            <div className="p-4 border-b border-slate-800">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2
                               px-3 py-2 rounded-lg bg-primary-600
                               hover:bg-primary-700 text-white text-xs
                               transition-all disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <div className="w-3 h-3 border border-white
                                            border-t-transparent rounded-full
                                            animate-spin" />
                            Saving...
                        </>
                    ) : (
                        '+ Save Current Version'
                    )}
                </button>
            </div>

            {/* Version list */}
            <div className="flex-1 overflow-y-auto">
                {error && (
                    <div className="p-4">
                        <p className="text-red-400 text-xs">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 border-primary-500
                                        border-t-transparent rounded-full
                                        animate-spin" />
                    </div>
                ) : versions.length === 0 ? (
                    <div className="p-4 text-center">
                        <p className="text-slate-500 text-xs">
                            No saved versions yet.
                            Click "Save Current Version" to create one.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {versions.map(version => (
                            <div
                                key={version.id}
                                className="p-4 hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-slate-200 text-xs font-medium">
                                            Version {version.versionNumber}
                                        </p>
                                        <p className="text-slate-500 text-xs mt-0.5">
                                            {timeAgo(version.createdAt)}
                                        </p>
                                        {version.savedBy && (
                                            <p className="text-slate-600 text-xs mt-0.5">
                                                by {version.savedBy.name}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleRestore(version.id)}
                                        disabled={restoring === version.id}
                                        className="flex-shrink-0 px-2.5 py-1 rounded-lg
                                                   bg-slate-700 hover:bg-slate-600
                                                   text-slate-300 text-xs transition-all
                                                   disabled:opacity-50"
                                    >
                                        {restoring === version.id
                                            ? 'Restoring...'
                                            : 'Restore'
                                        }
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}