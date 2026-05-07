import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import Editor from '../../components/editor/Editor';

// Debounce helper
function useDebounce(callback, delay) {
    const timeoutRef = useRef(null);

    return useCallback((...args) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
}

export default function DocumentPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('saved');
    const [title, setTitle] = useState('');
    const [editingTitle, setEditingTitle] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDocument();
    }, [id]);

    async function fetchDocument() {
        try {
            const res = await documentService.getById(id);
            setDocument(res.data.data);
            setTitle(res.data.data.title);
        } catch (err) {
            setError('Document not found or access denied');
        } finally {
            setLoading(false);
        }
    }

    // Autosave content — debounced 3 seconds
    const saveContent = useCallback(async (content) => {
        try {
            setSaveStatus('saving');
            await documentService.update(id, { content });
            setSaveStatus('saved');
        } catch (err) {
            setSaveStatus('error');
        }
    }, [id]);

    const debouncedSave = useDebounce(saveContent, 3000);

    function handleContentChange(content) {
        setDocument(prev => ({ ...prev, content }));
        setSaveStatus('unsaved');
        debouncedSave(content);
    }

    // Save title on blur
    async function handleTitleSave() {
        setEditingTitle(false);
        if (title !== document.title) {
            try {
                await documentService.update(id, { title });
                setDocument(prev => ({ ...prev, title }));
            } catch (err) {
                setTitle(document.title);
            }
        }
    }

    const isOwner = document?.ownerId === user?.id;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-slate-400">Loading document...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
                <p className="text-red-400">{error}</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-primary-400 hover:text-primary-300"
                >
                    Back to dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            {/* Doc Header */}
            <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
                {/* Back + Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        ←
                    </button>

                    {editingTitle ? (
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
                            autoFocus
                            className="bg-transparent text-white font-semibold
                                       outline-none border-b border-primary-500
                                       px-1 text-lg"
                        />
                    ) : (
                        <h1
                            className="text-white font-semibold text-lg cursor-pointer
                                       hover:text-slate-300 transition-colors"
                            onClick={() => setEditingTitle(true)}
                            title="Click to edit title"
                        >
                            {title}
                        </h1>
                    )}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {/* Save status */}
                    <span className={`text-xs ${
                        saveStatus === 'saved' ? 'text-slate-500' :
                        saveStatus === 'saving' ? 'text-yellow-400' :
                        saveStatus === 'unsaved' ? 'text-slate-400' :
                        'text-red-400'
                    }`}>
                        {saveStatus === 'saved' && '✓ Saved'}
                        {saveStatus === 'saving' && 'Saving...'}
                        {saveStatus === 'unsaved' && 'Unsaved changes'}
                        {saveStatus === 'error' && 'Save failed'}
                    </span>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 pt-14">
                <div className="max-w-4xl mx-auto min-h-full">
                    <Editor
                        content={document?.content}
                        onChange={handleContentChange}
                        editable={true}
                    />
                </div>
            </div>
        </div>
    );
}