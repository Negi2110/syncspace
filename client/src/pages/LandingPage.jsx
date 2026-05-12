import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
    {
        icon: '⚡',
        title: 'Real-time Collaboration',
        desc: 'Multiple users edit simultaneously. Changes sync instantly via WebSocket — no refresh needed.'
    },
    {
        icon: '🎙️',
        title: 'Voice Rooms',
        desc: 'Start a voice call directly in the document. WebRTC peer-to-peer audio with speaking detection.'
    },
    {
        icon: '🤖',
        title: 'AI Writing Assistant',
        desc: 'Summarize, improve, fix grammar, or review specs with one click using Gemini AI.'
    },
    {
        icon: '🔒',
        title: 'Access Control',
        desc: 'JWT authentication, per-document permissions, share links with view or edit access.'
    },
    {
        icon: '📜',
        title: 'Version History',
        desc: 'Save snapshots anytime. Preview and restore any previous version of your document.'
    },
    {
        icon: '📤',
        title: 'Export Anywhere',
        desc: 'Download your document as Markdown or PDF with one click.'
    }
];

const TECH = [
    'Node.js', 'Express', 'PostgreSQL', 'Sequelize',
    'Socket.io', 'WebRTC', 'React', 'Tiptap',
    'Gemini AI', 'JWT', 'Jest', 'GitHub Actions'
];

export default function LandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.feature-card').forEach(el => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">

            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
                <span className="font-bold text-xl">
                    <span className="text-white">Sync</span>
                    <span className="text-indigo-400">Space</span>
                </span>
                <div className="flex items-center gap-4">
                    <a
                        href="https://github.com/Negi2110/syncspace"
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                    >
                        GitHub
                    </a>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition-all"
                    >
                        Sign in
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />

                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs mb-8">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        Live at syncspace-sand.vercel.app
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        Docs built for
                        <span className="block text-indigo-400">developers</span>
                    </h1>

                    <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                        Real-time collaborative editor with voice rooms, AI assistance, and version history.
                        Built with the stack you already know.
                    </p>

                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all hover:scale-105 shadow-lg shadow-indigo-500/25"
                        >
                            Try Demo →
                        </button>
                        <a
                            href="https://github.com/Negi2110/syncspace"
                            target="_blank"
                            rel="noreferrer"
                            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all border border-slate-700"
                        >
                            View Source
                        </a>
                    </div>

                    <p className="mt-6 text-slate-600 text-sm">
                        Demo: aman@syncspace.com / password123
                    </p>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600">
                    <span className="text-xs">scroll</span>
                    <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent" />
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-6 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Everything you need
                    </h2>
                    <p className="text-slate-400">
                        Built as a portfolio project to demonstrate full-stack engineering skills
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((f, i) => (
                        <div
                            key={i}
                            className="feature-card opacity-0 translate-y-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all duration-300"
                            style={{ transitionDelay: `${i * 50}ms` }}
                        >
                            <div className="text-3xl mb-4">{f.icon}</div>
                            <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tech Stack */}
            <section className="py-16 px-6 border-t border-slate-800">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-slate-500 text-sm mb-8 uppercase tracking-widest">
                        Tech Stack
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {TECH.map((t, i) => (
                            <span
                                key={i}
                                className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 text-sm rounded-lg hover:border-indigo-500/50 hover:text-slate-300 transition-all"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        See it in action
                    </h2>
                    <p className="text-slate-400 mb-8">
                        Open two tabs, log in as different users, and watch real-time collaboration work.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-lg transition-all hover:scale-105 shadow-xl shadow-indigo-500/25"
                    >
                        Try it free →
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-slate-800 text-center">
                <p className="text-slate-600 text-sm">
                    Built by{' '}
                    <a href="https://github.com/Negi2110" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                        Aman Negi
                    </a>
                    {' · '}
                    <a href="https://github.com/Negi2110/syncspace" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                        View on GitHub
                    </a>
                </p>
            </footer>

            <style>{`
                .feature-card.animate-in {
                    opacity: 1;
                    transform: translateY(0);
                    transition: opacity 0.5s ease, transform 0.5s ease;
                }
            `}</style>
        </div>
    );
}