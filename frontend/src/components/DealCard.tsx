'use client';

import Link from 'next/link';
import { Draggable } from '@hello-pangea/dnd';
import { Deal, User } from '../lib/types';
import { DollarSign, User as UserIcon, MessageSquare, Clock, ArrowRight } from 'lucide-react';

interface DealCardProps {
  deal: Deal;
  index: number;
  isAdmin: boolean;
  users?: User[];
  onReassign?: (dealId: string, assignedUserId: string) => void;
}

export default function DealCard({ deal, index, isAdmin, users, onReassign }: DealCardProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isStale = () => {
    if (deal.stage === 'CLOSED_WON' || deal.stage === 'CLOSED_LOST') return false;
    const updatedAt = new Date(deal.updatedAt).getTime();
    const fourDaysAgo = Date.now() - 4 * 24 * 60 * 60 * 1000;
    return updatedAt < fourDaysAgo;
  };

  const stale = isStale();

  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-xl p-4 mb-3 border transition-all duration-200 shadow-sm hover:shadow-md ${
            snapshot.isDragging
              ? 'ring-2 ring-crm-500 shadow-xl rotate-1 scale-[1.02] bg-blue-50/50'
              : stale
              ? 'border-amber-300 bg-amber-50/30'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {/* Card Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link
              href={`/deals/${deal.id}`}
              className="font-bold text-slate-800 hover:text-crm-600 transition text-sm leading-snug line-clamp-2"
            >
              {deal.title}
            </Link>
            {stale && (
              <span
                className="shrink-0 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300 animate-pulse"
                title="No activity for >4 days!"
              >
                Stale
              </span>
            )}
          </div>

          {/* Description snippet */}
          {deal.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
              {deal.description}
            </p>
          )}

          {/* Value */}
          <div className="flex items-center text-slate-900 font-extrabold text-base mb-3">
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-0.5 shrink-0" />
              {formatCurrency(deal.value).replace('$', '')}
            </span>
          </div>

          {/* Footer Metadata */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            {/* Assigned User / Reassign Selector */}
            <div className="flex items-center space-x-1 max-w-[65%]">
              <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {isAdmin && users && onReassign ? (
                <select
                  value={deal.assignedUserId || ''}
                  onChange={(e) => onReassign(deal.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-crm-500 max-w-full truncate"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-[11px] font-medium text-slate-600 truncate">
                  {deal.assignedUser?.name || deal.assignedUser?.email || 'Unassigned'}
                </span>
              )}
            </div>

            {/* Interaction Count & Link */}
            <Link
              href={`/deals/${deal.id}`}
              className="flex items-center space-x-1 text-crm-600 hover:text-crm-800 font-medium text-[11px] group"
            >
              <MessageSquare className="w-3.5 h-3.5 text-crm-500" />
              <span>{deal._count?.interactions ?? deal.interactions?.length ?? 0}</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      )}
    </Draggable>
  );
}
