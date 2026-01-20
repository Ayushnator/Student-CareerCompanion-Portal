import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value.trim();
    const password = form.password.value;
    if (!email || !password) return;

    setLoading(true);
    setError('');
    try {
      await signin({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-md mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800">Login</h1>
        <p className="text-gray-600 mt-1">Access your Student Nexus dashboard</p>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-3 mt-6">
          <input
            name="email"
            type="email"
            className="border rounded px-3 py-2 w-full"
            placeholder="Email"
            autoComplete="email"
          />
          <input
            name="password"
            type="password"
            className="border rounded px-3 py-2 w-full"
            placeholder="Password"
            autoComplete="current-password"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          Don’t have an account?{' '}
          <Link className="text-blue-600" to="/signup">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}

