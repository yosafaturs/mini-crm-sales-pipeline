'use client';

import { useState } from 'react';
import { DealStage, User } from '../lib/types';
import { X, Plus, DollarSign, FileText, UserCheck } from 'lucide-react';
import { api } from '../lib/api';

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  users?: User[];
  onDealCreated: () => void;
}

export default function AddDealModal({
  isOpen,
  onClose,
  isAdmin,
  users,
  onDealCreated,
}: AddDealModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState<DealStage>('LEAD_ACQUIRED');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/deals', {
        title,
        description: description || undefined,
        value: parseFloat(value),
        stage,
        assignedUserId: isAdmin && assignedUserId ? assignedUserId : undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setValue('');
      setStage('LEAD_ACQUIRED');
      setAssignedUserId('');
      onDealCreated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create deal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-crm-100 text-crm-700 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Create New Deal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Deal Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Corp Enterprise Plan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-crm-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Value ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="50000"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-crm-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Initial Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStage)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-crm-500 focus:bg-white"
              >
                <option value="LEAD_ACQUIRED">Lead Acquired</option>
                <option value="CONTACTED">Contacted</option>
                <option value="PROPOSAL_SENT">Proposal Sent</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="CLOSED_WON">Closed Won</option>
                <option value="CLOSED_LOST">Closed Lost</option>
              </select>
            </div>
          </div>

          {isAdmin && users && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Assign Sales Executive (Admin Option)
              </label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-crm-500 focus:bg-white"
              >
                <option value="">Assign to Me / Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Description / Requirements
            </label>
            <textarea
              rows={3}
              placeholder="Add key background context, contact info, or deal scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-crm-500 focus:bg-white"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-crm-600 hover:bg-crm-700 text-white rounded-lg text-sm font-semibold transition shadow-sm hover:shadow disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
