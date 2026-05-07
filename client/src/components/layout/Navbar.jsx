import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate('/login');
    }

    return (
        <nav className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
            {/* Logo */}
            <div
                className="text-xl font-bold text-white cursor-pointer"
                onClick={() => navigate('/dashboard')}
            >
                Sync<span className="text-primary-500">Space</span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* User info */}
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-slate-300 text-sm hidden md:block">
                        {user?.name}
                    </span>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}