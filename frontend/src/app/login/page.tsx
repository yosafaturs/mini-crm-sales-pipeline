'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Lock, Mail, UserPlus, LogIn, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('admin@crm.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN_MANAGER' | 'SALES_EXECUTIVE'>('ADMIN_MANAGER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        await register(email, password, name, role);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (emailVal: string) => {
    setEmail(emailVal);
    setPassword('password123');
    setIsRegister(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Overlay */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-crm-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="bg-crm-600 text-white p-3 rounded-2xl shadow-xl shadow-crm-600/40">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <span className="text-3xl font-black tracking-tight text-white">PipelineCRM</span>
        </div>
        <h2 className="text-center text-sm font-semibold text-slate-400">
          Mini CRM & Sales Pipeline Tracker
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-100">
              {isRegister ? 'Create an Account' : 'Sign in to Pipeline'}
            </h3>
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs font-semibold text-crm-400 hover:text-crm-300 transition"
            >
              {isRegister ? 'Already registered? Login' : 'Need account? Register'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alice Manager"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-crm-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Role (RBAC)
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-crm-500"
                  >
                    <option value="ADMIN_MANAGER">ADMIN_MANAGER (Global View & Reassign)</option>
                    <option value="SALES_EXECUTIVE">SALES_EXECUTIVE (Own Deals Only)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@crm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-crm-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-crm-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-crm-600 hover:bg-crm-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-crm-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>{loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick Demo Accounts (Seed Data)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@crm.com')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition"
              >
                <div className="text-xs font-bold text-crm-400">Admin Manager</div>
                <div className="text-[10px] text-slate-400">admin@crm.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('bob@crm.com')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition"
              >
                <div className="text-xs font-bold text-blue-400">Sales Exec</div>
                <div className="text-[10px] text-slate-400">bob@crm.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
