import { useNavigate } from 'react-router-dom';

function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

export default function DocumentCard({ document, onDelete }) {
    const navigate = useNavigate();

    function handleDelete(e) {
        e.stopPropagation(); // prevent card click
        onDelete(document.id);
    }

    return (
        <div
            onClick={() => navigate(`/document/${document.id}`)}
            className="bg-slate-800 border border-slate-700 rounded-xl p-5
                       hover:border-primary-500/50 hover:bg-slate-750
                       cursor-pointer transition-all duration-200 group"
        >
            {/* Doc icon + title */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-600/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-white font-medium text-sm truncate max-w-[160px]">
                        {document.title}
                    </h3>
                </div>

                {/* Delete button */}
                <button
                    onClick={handleDelete}
                    className="opacity-0 group-hover:opacity-100 text-slate-500
                               hover:text-red-400 transition-all p-1 rounded"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Preview */}
            <p className="text-slate-500 text-xs mb-4 line-clamp-2">
                {document.content
                    ? 'Click to open and edit'
                    : 'Empty document'}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <span className="text-slate-600 text-xs">
                    {timeAgo(document.updatedAt)}
                </span>
                {document.collaborators?.length > 0 && (
                    <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-slate-500 text-xs">
                            {document.collaborators.length}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}