'use client';

import { useState } from 'react';
import { InteractionLog, InteractionType } from '../lib/types';
import { Phone, Mail, Users, FileText, Plus, Calendar, Clock, Send } from 'lucide-react';
import { api } from '../lib/api';

interface InteractionTimelineProps {
  dealId: string;
  interactions: InteractionLog[];
  onInteractionAdded: () => void;
}

const TYPE_ICONS: Record<InteractionType, any> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  NOTE: FileText,
};

const TYPE_COLORS: Record<InteractionType, string> = {
  CALL: 'bg-blue-100 text-blue-700 border-blue-200',
  EMAIL: 'bg-purple-100 text-purple-700 border-purple-200',
  MEETING: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  NOTE: 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function InteractionTimeline({
  dealId,
  interactions,
  onInteractionAdded,
}: InteractionTimelineProps) {
  const [type, setType] = useState<InteractionType>('CALL');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.post(`/deals/${dealId}/interactions`, {
        type,
        notes,
        date: date ? new Date(date).toISOString() : undefined,
      });

      setNotes('');
      setDate('');
      onInteractionAdded();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to record interaction log');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-crm-600" />
        Audit Trail & Interaction History
      </h3>

      {/* Add New Interaction Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Record New Interaction Log
        </h4>

        {error && (
          <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase">
              Interaction Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as InteractionType)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-crm-500"
            >
              <option value="CALL">Phone Call</option>
              <option value="EMAIL">Email Sent/Received</option>
              <option value="MEETING">Meeting held</option>
              <option value="NOTE">Internal Note</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase">
              Occurrence Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-crm-500"
            />
          </div>
        </div>

        <div className="mb-3">
          <textarea
            rows={2}
            required
            placeholder="Type notes, key takeaways, next steps..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-crm-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !notes.trim()}
            className="flex items-center space-x-1.5 bg-crm-600 hover:bg-crm-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Saving...' : 'Add Log Entry'}</span>
          </button>
        </div>
      </form>

      {/* Timeline view */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 before:z-0">
        {interactions.map((log) => {
          const Icon = TYPE_ICONS[log.type];
          return (
            <div key={log.id} className="relative z-10 flex items-start space-x-4 group">
              <div
                className={`p-2 rounded-full border shadow-sm ${TYPE_COLORS[log.type]} shrink-0`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm group-hover:border-slate-300 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {log.type}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600 font-medium">
                      {log.createdBy?.name || log.createdBy?.email || 'System User'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatDate(log.date || log.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {log.notes}
                </p>
              </div>
            </div>
          );
        })}

        {interactions.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No interactions logged yet for this deal.
          </div>
        )}
      </div>
    </div>
  );
}
