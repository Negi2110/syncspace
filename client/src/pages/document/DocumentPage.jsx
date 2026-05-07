import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Editor from '../../components/editor/Editor';
import PresenceAvatars from '../../components/ui/PresenceAvatars';
import VoiceRoom from '../../components/editor/VoiceRoom';

function useDebounce(callback, delay) {
    const timeoutRef = useRef(null);
    return useCallback((...args) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => callback(...args), delay);
    }, [callback, delay]);
}

export default function DocumentPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket } = useSocket();

    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('saved');
    const [title, setTitle] = useState('');
    const [editingTitle, setEditingTitle] = useState(false);
    const [error, setError] = useState('');
    const [presence, setPresence] = useState([]);

    useEffect(() => {
        fetchDocument();
    }, [id]);

    // Socket real-time setup
    useEffect(() => {
        if (!socket) return;

        // Join document room
        socket.emit('join-document', id);

        // Listen for presence updates
        socket.on('presence-update', (users) => {
            // Filter out current user from display
            setPresence(users.filter(u => u.userId !== user?.id));
        });

        // Listen for document changes from others
        socket.on('document-update', (data) => {
            setDocument(prev => {
                if (!prev) return prev;
                return { ...prev, content: data.delta };
            });
        });

        return () => {
            socket.emit('leave-document', id);
            socket.off('presence-update');
            socket.off('document-update');
        };
    }, [socket, id, user]);

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

        // Broadcast change to other users
        if (socket) {
            socket.emit('document-change', {
                documentId: id,
                delta: content,
                timestamp: Date.now()
            });
        }
    }

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
            {/* Header */}
            <div className="h-14 bg-slate-900 border-b border-slate-800 px-6
                            flex items-center justify-between
                            fixed top-0 left-0 right-0 z-50">
                {/* Left — back + title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-slate-400 hover:text-slate-200 transition-colors text-lg"
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
                            onClick={() => setEditingTitle(true)}
                            className="text-white font-semibold text-lg
                                       cursor-pointer hover:text-slate-300"
                            title="Click to edit title"
                        >
                            {title}
                        </h1>
                    )}
                </div>

                {/* Right — voice + presence + save status */}
<div className="flex items-center gap-4">
    <VoiceRoom documentId={id} />
    <PresenceAvatars users={presence} />
    <span className={`text-xs ${
        saveStatus === 'saved'   ? 'text-slate-500' :
        saveStatus === 'saving'  ? 'text-yellow-400' :
        saveStatus === 'unsaved' ? 'text-slate-400' :
        'text-red-400'
    }`}>
        {saveStatus === 'saved'   && '✓ Saved'}
        {saveStatus === 'saving'  && 'Saving...'}
        {saveStatus === 'unsaved' && 'Unsaved changes'}
        {saveStatus === 'error'   && 'Save failed'}
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