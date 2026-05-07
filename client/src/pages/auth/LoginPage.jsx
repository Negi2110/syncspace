import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Invalid email or password'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">
                        Sync<span className="text-primary-500">Space</span>
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Collaborative docs for developers
                    </p>
                </div>

                {/* Card */}
                <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                    <h2 className="text-xl font-semibold text-white mb-6">
                        Welcome back
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            disabled={loading}
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={loading}
                        />

                        <Button
                            type="submit"
                            loading={loading}
                            fullWidth
                            className="mt-2"
                        >
                            Sign in
                        </Button>
                    </form>

                    <p className="text-center text-slate-400 text-sm mt-6">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-primary-400 hover:text-primary-300 font-medium"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* Demo credentials */}
                <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <p className="text-slate-500 text-xs font-medium mb-2">
                        DEMO CREDENTIALS
                    </p>
                    <p className="text-slate-400 text-sm">
                        Email: <span className="text-slate-300">aman@syncspace.com</span>
                    </p>
                    <p className="text-slate-400 text-sm">
                        Password: <span className="text-slate-300">password123</span>
                    </p>
                </div>
            </div>
        </div>
    );
}