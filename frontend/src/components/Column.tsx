'use client';

import { Droppable } from '@hello-pangea/dnd';
import { Deal, DealStage, User } from '../lib/types';
import DealCard from './DealCard';

interface ColumnProps {
  stage: DealStage;
  title: string;
  deals: Deal[];
  isAdmin: boolean;
  users?: User[];
  onReassign?: (dealId: string, assignedUserId: string) => void;
}

const STAGE_COLORS: Record<DealStage, string> = {
  LEAD_ACQUIRED: 'bg-blue-500',
  CONTACTED: 'bg-cyan-500',
  PROPOSAL_SENT: 'bg-amber-500',
  NEGOTIATION: 'bg-purple-500',
  CLOSED_WON: 'bg-emerald-500',
  CLOSED_LOST: 'bg-rose-500',
};

export default function Column({ stage, title, deals, isAdmin, users, onReassign }: ColumnProps) {
  const columnTotalValue = deals.reduce((sum, d) => sum + d.value, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex flex-col w-72 shrink-0 bg-slate-100/80 rounded-2xl p-3 border border-slate-200/70 max-h-[80vh]">
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-2 mb-2">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${STAGE_COLORS[stage]}`} />
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">{title}</h3>
          <span className="text-xs font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600">
            {deals.length}
          </span>
        </div>
      </div>

      {/* Column Total Value */}
      <div className="px-2 pb-2 mb-2 border-b border-slate-200/60 flex items-center justify-between text-xs font-medium text-slate-500">
        <span>Total Stage Value:</span>
        <span className="font-bold text-slate-800">{formatCurrency(columnTotalValue)}</span>
      </div>

      {/* Droppable Card Container */}
      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto px-1 pt-1 pb-4 rounded-xl transition-colors min-h-[150px] ${
              snapshot.isDraggingOver ? 'bg-blue-50/60 ring-2 ring-crm-400 ring-dashed' : ''
            }`}
          >
            {deals.map((deal, index) => (
              <DealCard
                key={deal.id}
                deal={deal}
                index={index}
                isAdmin={isAdmin}
                users={users}
                onReassign={onReassign}
              />
            ))}
            {provided.placeholder}

            {deals.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-28 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
                No deals in stage
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
