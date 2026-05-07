import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { documentService } from '../../services/documentService';
import Navbar from '../../components/layout/Navbar';
import DocumentCard from '../../components/ui/DocumentCard';
import Button from '../../components/ui/Button';

export default function DashboardPage() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDocuments();
    }, []);

    async function fetchDocuments() {
        try {
            const res = await documentService.getAll();
            setDocuments(res.data.data);
        } catch (err) {
            setError('Failed to load documents');
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        setCreating(true);
        try {
            const res = await documentService.create({
                title: 'Untitled Document'
            });
            navigate(`/document/${res.data.data.id}`);
        } catch (err) {
            setError('Failed to create document');
        } finally {
            setCreating(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this document?')) return;
        try {
            await documentService.delete(id);
            setDocuments(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            setError('Failed to delete document');
        }
    }

    const filtered = documents.filter(doc =>
        doc.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar />

            <main className="pt-14 p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 mt-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            My Documents
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Welcome back, {user?.name}
                        </p>
                    </div>
                    <Button
                        onClick={handleCreate}
                        loading={creating}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Document
                    </Button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search documents..."
                        className="w-full max-w-md px-4 py-2.5 rounded-lg
                                   bg-slate-800 border border-slate-700
                                   text-slate-100 placeholder-slate-500
                                   focus:outline-none focus:ring-2 focus:ring-primary-500
                                   focus:border-transparent"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-slate-800 rounded-xl p-5 h-36 animate-pulse"
                            />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-slate-400 font-medium mb-2">
                            {search ? 'No documents found' : 'No documents yet'}
                        </h3>
                        <p className="text-slate-600 text-sm mb-4">
                            {search
                                ? 'Try a different search term'
                                : 'Create your first document to get started'}
                        </p>
                        {!search && (
                            <Button onClick={handleCreate} loading={creating}>
                                Create Document
                            </Button>
                        )}
                    </div>
                ) : (
                    /* Document grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtered.map(doc => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}