'use client';

import { useState } from 'react';
import { rplRequests, RPLRequest, EvidenceDoc } from '@/lib/mock-data';

type TabFilter = 'All' | 'Pending' | 'Accepted' | 'Rejected';
type TradeFilter = 'All' | 'Gas Engineering' | 'Electrical' | 'Plumbing';

// ─── Evidence Modal ──────────────────────────────────────────────────────────

function EvidenceModal({ request, onClose }: { request: RPLRequest; onClose: () => void }) {
  const iconFor = (type: EvidenceDoc['type']) => {
    if (type === 'PDF') return (
      <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
        <span className="text-red-600 text-xs font-bold">PDF</span>
      </div>
    );
    if (type === 'Word') return (
      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
        <span className="text-blue-600 text-xs font-bold">DOC</span>
      </div>
    );
    return (
      <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
        <span className="text-green-600 text-xs font-bold">IMG</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Evidence Documents</p>
            <h2 className="text-base font-bold text-gray-900">{request.student}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{request.package}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 space-y-3 max-h-80 overflow-y-auto">
          {request.evidenceDocs.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              {iconFor(doc.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{doc.size} · Uploaded {doc.uploadDate}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2.5 py-1.5 rounded-md border border-blue-200 hover:border-blue-400 transition-colors">
                  Preview
                </button>
                <button className="text-xs font-medium text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-md border border-gray-200 hover:border-gray-400 transition-colors">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
        {request.notes && (
          <div className="mx-6 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs font-semibold text-amber-700 mb-1">Admin Notes</p>
            <p className="text-sm text-amber-800">{request.notes}</p>
          </div>
        )}
        <div className="px-6 pb-5 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Accept/Reject Confirmation ──────────────────────────────────────────────

function ConfirmModal({
  request, action, onClose, onConfirm,
}: {
  request: RPLRequest; action: 'accept' | 'reject'; onClose: () => void; onConfirm: () => void;
}) {
  const [notes, setNotes] = useState(request.notes ?? '');
  const isAccept = action === 'accept';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {isAccept ? 'Accept RPL Request' : 'Reject RPL Request'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAccept
              ? 'This will generate a Reference ID and Certificate ID for the student.'
              : 'The student will be notified with the reason provided.'}
          </p>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-sm font-medium text-gray-900">{request.student}</p>
            <p className="text-xs text-gray-500 mt-0.5">{request.package} · {request.ao}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {isAccept ? 'Notes (optional)' : 'Rejection Reason (recommended)'}
            </label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder={isAccept ? 'Add any notes about this approval...' : 'Explain why the request was rejected...'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
          </div>
        </div>
        <div className="px-6 pb-5 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${isAccept ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isAccept ? 'Confirm Accept' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function RPLRequestsPage() {
  const [tab, setTab] = useState<TabFilter>('All');
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>('All');
  const [search, setSearch] = useState('');
  const [evidenceFor, setEvidenceFor] = useState<RPLRequest | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ request: RPLRequest; action: 'accept' | 'reject' } | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, 'Pending' | 'Accepted' | 'Rejected'>>({});

  const getStatus = (r: RPLRequest) => localStatuses[r.id] ?? r.status;

  const filtered = rplRequests.filter(r => {
    const s = getStatus(r);
    const matchTab = tab === 'All' || s === tab;
    const matchTrade = tradeFilter === 'All' || r.trade === tradeFilter;
    const matchSearch = r.student.toLowerCase().includes(search.toLowerCase()) ||
      r.package.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchTrade && matchSearch;
  });

  const counts = {
    All: rplRequests.length,
    Pending: rplRequests.filter(r => getStatus(r) === 'Pending').length,
    Accepted: rplRequests.filter(r => getStatus(r) === 'Accepted').length,
    Rejected: rplRequests.filter(r => getStatus(r) === 'Rejected').length,
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    setLocalStatuses(prev => ({
      ...prev,
      [confirmAction.request.id]: confirmAction.action === 'accept' ? 'Accepted' : 'Rejected',
    }));
    setConfirmAction(null);
  };

  const tradeColors: Record<string, string> = {
    'Gas Engineering': 'bg-orange-100 text-orange-700',
    'Electrical': 'bg-yellow-100 text-yellow-700',
    'Plumbing': 'bg-blue-100 text-blue-700',
  };

  return (
    <>
      {evidenceFor && <EvidenceModal request={evidenceFor} onClose={() => setEvidenceFor(null)} />}
      {confirmAction && (
        <ConfirmModal
          request={confirmAction.request}
          action={confirmAction.action}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleConfirm}
        />
      )}

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Assessment Center</p>
            <h1 className="text-2xl font-bold text-gray-900">RPL Requests</h1>
            <p className="text-gray-500 text-sm mt-1">Recognition of Prior Learning — review student evidence and issue certificates</p>
          </div>
          <button className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Tabs + Filters */}
        <div className="bg-white rounded-xl border border-gray-200 mb-5">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100 px-4">
            {(['All', 'Pending', 'Accepted', 'Rejected'] as TabFilter[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative px-4 py-3.5 text-sm font-medium transition-colors flex items-center gap-2 ${
                  tab === t ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t}
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  tab === t ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {counts[t]}
                </span>
              </button>
            ))}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-3 p-4">
            <div className="flex-1 min-w-48 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search student or package..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <select
              value={tradeFilter} onChange={e => setTradeFilter(e.target.value as TradeFilter)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-700"
            >
              <option>All</option>
              <option>Gas Engineering</option>
              <option>Electrical</option>
              <option>Plumbing</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Package</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Evidence</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">AO</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ref / Cert</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                    No RPL requests match your filters.
                  </td>
                </tr>
              )}
              {filtered.map(r => {
                const status = getStatus(r);
                const statusColors: Record<string, string> = {
                  Pending: 'bg-amber-100 text-amber-700',
                  Accepted: 'bg-green-100 text-green-700',
                  Rejected: 'bg-red-100 text-red-700',
                };

                return (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                          {r.student.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{r.student}</p>
                          <p className="text-xs text-gray-400">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-gray-900 font-medium">{r.package}</p>
                      <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${tradeColors[r.trade]}`}>
                        {r.trade}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{r.dateRequested}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setEvidenceFor(r)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-2.5 py-1.5 rounded-md transition-colors"
                      >
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                        {r.evidenceDocs.length} file{r.evidenceDocs.length !== 1 ? 's' : ''}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{r.ao}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {status === 'Accepted' && (r.refId || localStatuses[r.id] === 'Accepted') ? (
                        <div className="space-y-1">
                          <p className="text-xs font-mono text-gray-600">{r.refId ?? 'REF-2026-AUTO'}</p>
                          <p className="text-xs font-mono text-gray-600">{r.certId ?? 'CERT-AUTO'}</p>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {status === 'Pending' && (
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => setConfirmAction({ request: r, action: 'accept' })}
                            className="text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-md transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => setConfirmAction({ request: r, action: 'reject' })}
                            className="text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-md transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {status !== 'Pending' && (
                        <button className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md transition-colors">
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-3">Showing {filtered.length} of {rplRequests.length} requests</p>
      </div>
    </>
  );
}
