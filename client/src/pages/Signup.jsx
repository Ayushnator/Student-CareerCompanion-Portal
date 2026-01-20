import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    // Default role is basic
    if (!name || !email || !password) return;

    setLoading(true);
    setError('');
    try {
      await signup({ name, email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-md mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800">Signup</h1>
        <p className="text-gray-600 mt-1">Create your Student Nexus account</p>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-3 mt-6">
          <input
            name="name"
            type="text"
            className="border rounded px-3 py-2 w-full"
            placeholder="Full name"
            autoComplete="name"
          />
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
            placeholder="Password (min 6 chars)"
            autoComplete="new-password"
          />
          {/* Role selection removed - default to basic */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link className="text-blue-600" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

