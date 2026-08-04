'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '../../../context/AuthContext';
import { fetcher, api } from '../../../lib/api';
import { Deal, DealStage, User } from '../../../lib/types';
import Navbar from '../../../components/Navbar';
import InteractionTimeline from '../../../components/InteractionTimeline';
import { ArrowLeft, DollarSign, Calendar, User as UserIcon, Building2, Tag, Shield } from 'lucide-react';
import { useState } from 'react';

const STAGE_OPTIONS: { value: DealStage; label: string }[] = [
  { value: 'LEAD_ACQUIRED', label: 'Lead Acquired' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'PROPOSAL_SENT', label: 'Proposal Sent' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'CLOSED_WON', label: 'Closed Won' },
  { value: 'CLOSED_LOST', label: 'Closed Lost' },
];

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params?.id as string;
  const { user } = useAuth();

  const { data: deal, mutate: mutateDeal, error } = useSWR<Deal>(
    dealId ? `/deals/${dealId}` : null,
    fetcher
  );

  const { data: usersData } = useSWR<{ users: User[] }>(
    user?.role === 'ADMIN_MANAGER' ? '/users' : null,
    fetcher
  );

  const [savingStage, setSavingStage] = useState(false);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Deal Access Restricted</h2>
            <p className="text-sm text-slate-500 mb-6">
              You do not have permission to view this deal or it has been deleted.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-crm-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-400 font-semibold text-sm animate-pulse">Loading Deal details...</div>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN_MANAGER';

  const handleStageChange = async (newStage: DealStage) => {
    setSavingStage(true);
    try {
      await api.patch(`/deals/${dealId}/stage`, { stage: newStage });
      mutateDeal();
    } catch (e) {
      alert('Failed to update deal stage');
    } finally {
      setSavingStage(false);
    }
  };

  const handleReassign = async (newAssignedUserId: string) => {
    try {
      await api.patch(`/deals/${dealId}/assign`, { assignedUserId: newAssignedUserId });
      mutateDeal();
    } catch (e) {
      alert('Failed to reassign deal owner');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-crm-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pipeline Board</span>
        </button>

        {/* Deal Header Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-crm-50 text-crm-700 border border-crm-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  ID: {deal.id.substring(0, 8)}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Created {new Date(deal.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {deal.title}
              </h1>
              {deal.description && (
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  {deal.description}
                </p>
              )}
            </div>

            {/* Deal Value Pill */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shrink-0 flex flex-col justify-center min-w-[200px] shadow-lg">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Contract Value</span>
              <span className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(deal.value)}</span>
            </div>
          </div>

          {/* Controls & Metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Stage Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-crm-600" />
                Pipeline Stage
              </label>
              <select
                value={deal.stage}
                disabled={savingStage}
                onChange={(e) => handleStageChange(e.target.value as DealStage)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-crm-500"
              >
                {STAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned Executive */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-crm-600" />
                Assigned Sales Exec
              </label>
              {isAdmin && usersData?.users ? (
                <select
                  value={deal.assignedUserId || ''}
                  onChange={(e) => handleReassign(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-crm-500"
                >
                  <option value="">Unassigned</option>
                  {usersData.users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800">
                  {deal.assignedUser?.name || deal.assignedUser?.email || 'Unassigned'}
                </div>
              )}
            </div>

            {/* Creator */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-crm-600" />
                Created By
              </label>
              <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800">
                {deal.createdBy?.name || deal.createdBy?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Audit Trail & Interaction Timeline */}
        <InteractionTimeline
          dealId={deal.id}
          interactions={deal.interactions || []}
          onInteractionAdded={() => mutateDeal()}
        />
      </main>
    </div>
  );
}
