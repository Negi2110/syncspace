import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DocumentPage from './pages/document/DocumentPage';
import SharedDocumentPage from './pages/document/SharedDocumentPage';
import LandingPage from './pages/LandingPage';


function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-slate-400">Loading...</div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    return isAuthenticated
        ? <Navigate to="/dashboard" replace />
        : children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/document/:id" element={<ProtectedRoute><DocumentPage /></ProtectedRoute>} />
            <Route path="/document/shared/:token" element={<SharedDocumentPage />} />

        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <SocketProvider>
                    <AppRoutes />
                </SocketProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}