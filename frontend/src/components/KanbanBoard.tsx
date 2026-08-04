'use client';

import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Deal, DealStage, User } from '../lib/types';
import Column from './Column';
import { api } from '../lib/api';

interface KanbanBoardProps {
  deals: Deal[];
  isAdmin: boolean;
  users?: User[];
  onDealStageChange: (dealId: string, newStage: DealStage) => Promise<void>;
  onReassignDeal?: (dealId: string, assignedUserId: string) => Promise<void>;
}

const STAGES: { stage: DealStage; title: string }[] = [
  { stage: 'LEAD_ACQUIRED', title: 'Lead Acquired' },
  { stage: 'CONTACTED', title: 'Contacted' },
  { stage: 'PROPOSAL_SENT', title: 'Proposal Sent' },
  { stage: 'NEGOTIATION', title: 'Negotiation' },
  { stage: 'CLOSED_WON', title: 'Closed Won' },
  { stage: 'CLOSED_LOST', title: 'Closed Lost' },
];

export default function KanbanBoard({
  deals,
  isAdmin,
  users,
  onDealStageChange,
  onReassignDeal,
}: KanbanBoardProps) {
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStage = destination.droppableId as DealStage;
    await onDealStageChange(draggableId, newStage);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x">
        {STAGES.map(({ stage, title }) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          return (
            <Column
              key={stage}
              stage={stage}
              title={title}
              deals={stageDeals}
              isAdmin={isAdmin}
              users={users}
              onReassign={onReassignDeal}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}
