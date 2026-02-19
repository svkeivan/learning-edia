'use client';

import Link from 'next/link';
import { useState } from 'react';
import { assessments, Assessment } from '@/lib/mock-data';

type Trade = 'All' | 'Gas Engineering' | 'Electrical' | 'Plumbing';
type StatusFilter = 'All' | 'Active' | 'Draft' | 'Archived';
type TypeFilter = 'All' | 'Multiple Choice' | 'Short Answer' | 'Mixed' | 'File Upload';

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: Assessment['status'] }) {
  if (status === 'Active') return <Badge label="Active" color="bg-green-100 text-green-700" />;
  if (status === 'Draft') return <Badge label="Draft" color="bg-amber-100 text-amber-700" />;
  return <Badge label="Archived" color="bg-gray-100 text-gray-500" />;
}

function TypeBadge({ type }: { type: Assessment['type'] }) {
  const map: Record<string, string> = {
    'Multiple Choice': 'bg-purple-100 text-purple-700',
    'Short Answer': 'bg-sky-100 text-sky-700',
    'Mixed': 'bg-indigo-100 text-indigo-700',
    'File Upload': 'bg-teal-100 text-teal-700',
  };
  return <Badge label={type} color={map[type] ?? 'bg-gray-100 text-gray-600'} />;
}

function TradeDot({ trade }: { trade: Assessment['trade'] }) {
  const map: Record<string, string> = {
    'Gas Engineering': 'bg-orange-400',
    'Electrical': 'bg-yellow-400',
    'Plumbing': 'bg-blue-400',
  };
  return (
    <span className="flex items-center gap-1.5 text-sm text-gray-600">
      <span className={`w-2 h-2 rounded-full shrink-0 ${map[trade]}`} />
      {trade}
    </span>
  );
}

function PassRateBar({ rate, passMark }: { rate: number; passMark: number }) {
  if (rate === 0) return <span className="text-xs text-gray-400">—</span>;
  const color = rate >= passMark ? 'bg-green-500' : rate >= passMark - 10 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 bg-gray-100 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${rate}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700">{rate}%</span>
    </div>
  );
}

export default function AssessmentsPage() {
  const [search, setSearch] = useState('');
  const [trade, setTrade] = useState<Trade>('All');
  const [status, setStatus] = useState<StatusFilter>('All');
  const [type, setType] = useState<TypeFilter>('All');

  const filtered = assessments.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.module.toLowerCase().includes(search.toLowerCase());
    const matchTrade = trade === 'All' || a.trade === trade;
    const matchStatus = status === 'All' || a.status === status;
    const matchType = type === 'All' || a.type === type;
    return matchSearch && matchTrade && matchStatus && matchType;
  });

  const totalPending = assessments.reduce((s, a) => s + a.pendingGrading, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Assessment Center</p>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-500 text-sm mt-1">
            {assessments.filter(a => a.status === 'Active').length} active · {assessments.filter(a => a.status === 'Draft').length} draft · {totalPending} pending grading
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Assessment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-52 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search assessments..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
          />
        </div>

        <select value={trade} onChange={e => setTrade(e.target.value as Trade)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-700">
          <option>All</option>
          <option>Gas Engineering</option>
          <option>Electrical</option>
          <option>Plumbing</option>
        </select>

        <select value={status} onChange={e => setStatus(e.target.value as StatusFilter)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-700">
          <option>All</option>
          <option>Active</option>
          <option>Draft</option>
          <option>Archived</option>
        </select>

        <select value={type} onChange={e => setType(e.target.value as TypeFilter)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-700">
          <option>All</option>
          <option>Multiple Choice</option>
          <option>Short Answer</option>
          <option>Mixed</option>
          <option>File Upload</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assessment</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trade</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submissions</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pass Rate</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  No assessments match your filters.
                </td>
              </tr>
            )}
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.module} · {a.questionCount} questions</p>
                  {a.pendingGrading > 0 && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {a.pendingGrading} awaiting grading
                    </span>
                  )}
                </td>
                <td className="px-4 py-4"><TypeBadge type={a.type} /></td>
                <td className="px-4 py-4"><TradeDot trade={a.trade} /></td>
                <td className="px-4 py-4"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-4">
                  <p className="text-gray-900 font-medium">{a.totalSubmissions}</p>
                  {a.gradedSubmissions < a.totalSubmissions && (
                    <p className="text-xs text-gray-400">{a.gradedSubmissions} graded</p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <PassRateBar rate={a.passRate} passMark={a.passMark} />
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-600">{a.dueDate}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/assessment-center/assessments/${a.id}/results`}
                      className="text-xs font-medium text-gray-600 hover:text-orange-600 border border-gray-200 hover:border-orange-300 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Results
                    </Link>
                    <button className="text-xs font-medium text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md transition-colors">
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3">Showing {filtered.length} of {assessments.length} assessments</p>
    </div>
  );
}
