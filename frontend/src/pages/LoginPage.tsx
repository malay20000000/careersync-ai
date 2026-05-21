import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-inter">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-200">
        <div className="text-center mb-8">
          <div className="text-2xl font-black text-sky-600 tracking-tight mb-4">CareerSync AI</div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 font-medium">Sign in to continue to your dashboard</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-slate-900/10 mt-2">
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 font-medium">
          Don't have an account? <Link to="/register" className="text-sky-600 font-bold hover:text-sky-500 transition">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
