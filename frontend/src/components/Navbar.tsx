'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, Shield, User as UserIcon, Download, Bell, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { useState } from 'react';

interface NavbarProps {
  onOpenAddModal?: () => void;
}

export default function Navbar({ onOpenAddModal }: NavbarProps) {
  const { user, logout } = useAuth();
  const [triggeringCron, setTriggeringCron] = useState(false);
  const [cronMessage, setCronMessage] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const response = await api.get('/deals/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `deals_export_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Failed to export deals data');
    }
  };

  const handleTriggerCron = async () => {
    setTriggeringCron(true);
    setCronMessage(null);
    try {
      const res = await api.post('/cron/trigger-stale-check');
      setCronMessage(`Check complete! Evaluated ${res.data.result.processedCount} deals. Found ${res.data.result.staleCount} stale deal(s).`);
      setTimeout(() => setCronMessage(null), 6000);
    } catch (e: any) {
      setCronMessage('Error triggering background check.');
    } finally {
      setTriggeringCron(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="flex items-center space-x-2 text-crm-700 font-bold text-xl tracking-tight">
            <div className="bg-crm-600 text-white p-2 rounded-lg shadow-md shadow-crm-600/30">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span>PipelineCRM</span>
          </Link>
          <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            v1.0 Pro
          </span>
        </div>

        {/* User Actions */}
        {user && (
          <div className="flex items-center space-x-3 sm:space-x-4">
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="flex items-center space-x-1.5 bg-crm-600 hover:bg-crm-700 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Deal</span>
              </button>
            )}

            {user.role === 'ADMIN_MANAGER' && (
              <>
                <button
                  onClick={handleTriggerCron}
                  disabled={triggeringCron}
                  title="Manually run background stale deals check"
                  className="flex items-center space-x-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg text-xs font-medium transition"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden md:inline">Run Cron Check</span>
                </button>

                <button
                  onClick={handleExport}
                  title="Export all deals as JSON"
                  className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium transition"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden md:inline">Export JSON</span>
                </button>
              </>
            )}

            {/* Profile Info */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="flex flex-col text-right hidden sm:block">
                <span className="text-sm font-semibold text-slate-800 leading-tight">{user.name || user.email}</span>
                <span className="text-[10px] font-bold tracking-wide uppercase text-crm-600">
                  {user.role === 'ADMIN_MANAGER' ? 'Admin Manager' : 'Sales Exec'}
                </span>
              </div>
              <div className={`p-2 rounded-full ${user.role === 'ADMIN_MANAGER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {user.role === 'ADMIN_MANAGER' ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {cronMessage && (
        <div className="bg-amber-500 text-white text-xs py-1.5 px-4 text-center font-medium shadow-inner animate-pulse">
          {cronMessage}
        </div>
      )}
    </header>
  );
}
