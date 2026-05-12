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

function extractPreview(content) {
    if (!content) return 'Empty document';
    try {
        const parsed = JSON.parse(content);
        const texts = [];

        function walk(node) {
            if (node.type === 'text' && node.text) {
                texts.push(node.text);
            }
            if (node.content) {
                node.content.forEach(walk);
            }
        }

        walk(parsed);
        const text = texts.join(' ').trim();
        return text.length > 0
            ? text.slice(0, 120) + (text.length > 120 ? '...' : '')
            : 'Empty document';
    } catch {
        return 'Empty document';
    }
}

export default function DocumentCard({ document, onDelete }) {
    const navigate = useNavigate();
    const preview = extractPreview(document.content);
    const isEmpty = preview === 'Empty document';

    return (
        <div
            onClick={() => navigate(`/document/${document.id}`)}
            className="group relative bg-slate-800 rounded-xl p-5
                       border border-slate-700 cursor-pointer
                       hover:border-primary-500/50 hover:bg-slate-750
                       transition-all duration-200 hover:-translate-y-0.5
                       hover:shadow-lg hover:shadow-slate-900/50"
        >
            {/* Delete button */}
            <button
                onClick={e => {
                    e.stopPropagation();
                    onDelete(document.id);
                }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100
                           w-6 h-6 flex items-center justify-center
                           rounded-md text-slate-500 hover:text-red-400
                           hover:bg-slate-700 transition-all text-xs"
            >
                ✕
            </button>

            {/* Doc icon */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary-600/20
                                flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-primary-400"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-white font-medium text-sm truncate pr-6">
                    {document.title}
                </h3>
            </div>

            {/* Preview text */}
            <p className={`text-xs leading-relaxed mb-3 line-clamp-3 ${
                isEmpty ? 'text-slate-600 italic' : 'text-slate-400'
            }`}>
                {preview}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <span className="text-slate-600 text-xs">
                    {timeAgo(document.updatedAt)}
                </span>
                {document.collaboratorCount > 0 && (
                    <span className="flex items-center gap-1 text-slate-600 text-xs">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {document.collaboratorCount}
                    </span>
                )}
            </div>
        </div>
    );
}