'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { useAuth } from '../../context/AuthContext';
import { fetcher, api } from '../../lib/api';
import { Deal, DealStage, MetricsData, User } from '../../lib/types';
import Navbar from '../../components/Navbar';
import MetricsPanel from '../../components/MetricsPanel';
import KanbanBoard from '../../components/KanbanBoard';
import AddDealModal from '../../components/AddDealModal';
import { useSocket } from '../../hooks/useSocket';
import { Filter, RefreshCw, AlertCircle, Shield, Briefcase } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // SWR Deals fetch
  const { data: dealsData, mutate: mutateDeals, isValidating } = useSWR<{ deals: Deal[] }>(
    '/deals',
    fetcher,
    { revalidateOnFocus: true }
  );

  // SWR Metrics fetch (If Admin Manager or for personal totals)
  const { data: metricsData, mutate: mutateMetrics } = useSWR<MetricsData>(
    '/deals/metrics',
    fetcher
  );

  // SWR Users fetch (If Admin Manager, for deal re-assignment)
  const { data: usersData } = useSWR<{ users: User[] }>(
    user?.role === 'ADMIN_MANAGER' ? '/users' : null,
    fetcher
  );

  // Socket.io Real-time synchronization callback
  const handleRealtimeUpdate = useCallback((updatedDeal: Deal) => {
    mutateDeals((currentData) => {
      if (!currentData) return currentData;

      const exists = currentData.deals.some((d) => d.id === updatedDeal.id);
      let newDeals: Deal[];

      if (exists) {
        newDeals = currentData.deals.map((d) =>
          d.id === updatedDeal.id ? { ...d, ...updatedDeal } : d
        );
      } else {
        newDeals = [updatedDeal, ...currentData.deals];
      }

      return { ...currentData, deals: newDeals };
    }, false);

    // Revalidate metrics
    mutateMetrics();
  }, [mutateDeals, mutateMetrics]);

  // Hook up WebSocket
  useSocket(handleRealtimeUpdate);

  const isAdmin = user?.role === 'ADMIN_MANAGER';
  const deals = dealsData?.deals || [];

  // Optimistic Stage update handler
  const handleStageChange = async (dealId: string, newStage: DealStage) => {
    // Optimistic cache update
    mutateDeals(
      (current) => {
        if (!current) return current;
        return {
          deals: current.deals.map((d) =>
            d.id === dealId ? { ...d, stage: newStage } : d
          ),
        };
      },
      false
    );

    try {
      await api.patch(`/deals/${dealId}/stage`, { stage: newStage });
      mutateMetrics();
    } catch (error) {
      console.error('Failed stage update, reverting optimistic cache:', error);
      mutateDeals(); // Revert
    }
  };

  // Re-assign deal owner (Admin only)
  const handleReassignDeal = async (dealId: string, assignedUserId: string) => {
    try {
      await api.patch(`/deals/${dealId}/assign`, { assignedUserId });
      mutateDeals();
      mutateMetrics();
    } catch (error) {
      alert('Failed to reassign deal');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenAddModal={() => setIsAddModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Banner / Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-crm-600" />
              Sales Pipeline Board
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isAdmin
                ? 'Showing all active organization deals & stage totals across all representatives.'
                : 'Showing deals assigned exclusively to your sales account.'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
              isAdmin ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
              <span>{isAdmin ? 'ADMIN_MANAGER Access' : 'SALES_EXECUTIVE Access'}</span>
            </span>

            <button
              onClick={() => { mutateDeals(); mutateMetrics(); }}
              disabled={isValidating}
              className="p-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-lg shadow-sm transition"
              title="Refresh Pipeline"
            >
              <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin text-crm-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Metrics Panel (Optimised aggregation) */}
        {metricsData && <MetricsPanel metrics={metricsData} />}

        {/* Interactive Drag & Drop Kanban Board */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm">
          <KanbanBoard
            deals={deals}
            isAdmin={isAdmin}
            users={usersData?.users}
            onDealStageChange={handleStageChange}
            onReassignDeal={handleReassignDeal}
          />
        </div>
      </main>

      {/* Add Deal Modal */}
      <AddDealModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        isAdmin={isAdmin}
        users={usersData?.users}
        onDealCreated={() => { mutateDeals(); mutateMetrics(); }}
      />
    </div>
  );
}
