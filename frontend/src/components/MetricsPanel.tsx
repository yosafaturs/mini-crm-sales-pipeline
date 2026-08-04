'use client';

import { MetricsData, DealStage } from '../lib/types';
import { DollarSign, Briefcase, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

interface MetricsPanelProps {
  metrics: MetricsData;
}

const STAGE_LABELS: Record<DealStage, string> = {
  LEAD_ACQUIRED: 'Lead Acquired',
  CONTACTED: 'Contacted',
  PROPOSAL_SENT: 'Proposal Sent',
  NEGOTIATION: 'Negotiation',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost',
};

export default function MetricsPanel({ metrics }: MetricsPanelProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const wonMetric = metrics.stages.CLOSED_WON || { totalValue: 0, count: 0 };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-crm-600" />
          Pipeline Performance Metrics
        </h2>
        <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border">
          Global Overview (Prisma Aggregated)
        </span>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pipeline Value</p>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(metrics.totalPipelineValue)}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Active & Closed Deals</p>
            <p className="text-2xl font-black text-slate-900">{metrics.totalDeals} Deals</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Closed Won Revenue</p>
            <p className="text-2xl font-black text-emerald-600">{formatCurrency(wonMetric.totalValue)}</p>
          </div>
        </div>
      </div>

      {/* Stage value breakdown pill grid */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Value Sum per Stage Column</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {(Object.keys(STAGE_LABELS) as DealStage[]).map((stage) => {
            const stData = metrics.stages[stage] || { totalValue: 0, count: 0 };
            return (
              <div key={stage} className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg flex flex-col">
                <span className="text-[11px] font-medium text-slate-500 truncate">{STAGE_LABELS[stage]}</span>
                <span className="text-sm font-bold text-slate-800 mt-1">{formatCurrency(stData.totalValue)}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{stData.count} deal(s)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
