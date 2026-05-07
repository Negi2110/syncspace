import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import Editor from '../../components/editor/Editor';

export default function SharedDocumentPage() {
    const { token } = useParams();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetch() {
            try {
                const res = await documentService.getByShareToken(token);
                setDocument(res.data.data);
            } catch {
                setError('Invalid or expired share link');
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, [token]);

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-slate-400">Loading...</div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <p className="text-red-400">{error}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <div className="h-14 bg-slate-900 border-b border-slate-800 px-6
                            flex items-center justify-between fixed top-0 left-0 right-0 z-50">
                <h1 className="text-white font-semibold">{document?.title}</h1>
                <span className="text-slate-500 text-xs">View only</span>
            </div>
            <div className="flex-1 pt-14">
                <div className="max-w-4xl mx-auto">
                    <Editor
                        content={document?.content}
                        onChange={() => {}}
                        editable={false}
                    />
                </div>
            </div>
        </div>
    );
}