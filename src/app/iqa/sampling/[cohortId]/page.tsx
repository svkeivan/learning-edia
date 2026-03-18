'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  getIqaChecks,
  getIqaTutors,
  addIqaCheck,
  updateIqaCheck,
  autoAssignReviewer,
} from '@/lib/iqa-data';
import { cohorts, submissions, assessments, getStudentPackage } from '@/lib/mock-data';
import type { IqaCheck, IqaTutor, IqaCheckStatus } from '@/lib/iqa-data';

const tradeColors: Record<string, string> = {
  'Gas Engineering': 'bg-orange-100 text-orange-700',
  Electrical: 'bg-yellow-100 text-yellow-700',
  Plumbing: 'bg-blue-100 text-blue-700',
};

const statusStyles: Record<IqaCheckStatus, string> = {
  Pending: 'bg-blue-100 text-blue-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

interface CohortSubmission {
  submission: (typeof submissions)[number];
  assessment: (typeof assessments)[number] | undefined;
  check: IqaCheck | undefined;
  assignedReviewer: IqaTutor | undefined;
  assessor: IqaTutor | undefined;
}

// ── Assign Reviewer Modal ────────────────────────────────────────────────────

function AssignReviewerModal({
  title,
  count,
  tutors,
  onAssign,
  onClose,
}: {
  title?: string;
  count?: number;
  tutors: IqaTutor[];
  onAssign: (tutorId: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reviewerTutors = useMemo(() => tutors.filter(t => t.role !== 'assessor'), [tutors]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return reviewerTutors;
    return reviewerTutors.filter(t => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q));
  }, [reviewerTutors, search]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const selectedName = reviewerTutors.find(t => t.id === selectedId)?.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title ?? 'Assign Reviewer'}</h2>
            {count !== undefined && count > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">
                {count} assessment{count !== 1 ? 's' : ''} will be assigned
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pt-4 pb-3 shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No reviewers match your search.</p>
          ) : (
            <div className="space-y-1">
              {filtered.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                    selectedId === t.id
                      ? 'bg-orange-50 border-2 border-orange-300'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <p className={`text-sm font-medium ${selectedId === t.id ? 'text-orange-900' : 'text-gray-900'}`}>
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => selectedId && onAssign(selectedId)}
            disabled={!selectedId}
            className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {selectedId && selectedName ? `Assign to ${selectedName}` : 'Select a reviewer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ percent }: { percent: number }) {
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent >= 100 ? '#22c55e' : percent >= 50 ? '#f97316' : '#3b82f6';

  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-900">{percent}%</span>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CohortDetailPage() {
  const { cohortId } = useParams<{ cohortId: string }>();
  const [checks, setChecks] = useState<IqaCheck[]>([]);
  const [tutors, setTutors] = useState<IqaTutor[]>([]);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState('');

  const [filterExam, setFilterExam] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulkAssign, setShowBulkAssign] = useState(false);

  const refresh = useCallback(() => {
    setChecks(getIqaChecks());
    setTutors(getIqaTutors());
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();
    window.addEventListener('iqa-checks-updated', refresh);
    window.addEventListener('iqa-tutors-updated', refresh);
    return () => {
      window.removeEventListener('iqa-checks-updated', refresh);
      window.removeEventListener('iqa-tutors-updated', refresh);
    };
  }, [refresh]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(''), 3500); return () => clearTimeout(t); }
  }, [toast]);

  const cohort = cohorts.find(c => c.id === cohortId);

  const items: CohortSubmission[] = useMemo(() => {
    if (!cohort) return [];
    const studentEmails = new Set(cohort.students.map(s => s.email));
    const cohortSubs = submissions.filter(
      s => studentEmails.has(s.email) && cohort.examIds.includes(s.assessmentId),
    );
    return cohortSubs.map(sub => {
      const assessment = assessments.find(a => a.id === sub.assessmentId);
      const check = checks.find(c => c.submissionId === sub.id);
      const assignedReviewer = check?.assignedTo ? tutors.find(t => t.id === check.assignedTo) : undefined;
      const assessor = tutors.find(t => t.id === sub.gradedBy);
      return { submission: sub, assessment, check, assignedReviewer, assessor };
    });
  }, [cohort, checks, tutors]);

  const stats = useMemo(() => {
    const total = items.length;
    const approved = items.filter(i => i.check?.status === 'Approved').length;
    const rejected = items.filter(i => i.check?.status === 'Rejected').length;
    const pending = items.filter(i => i.check?.status === 'Pending').length;
    const notInQueue = total - approved - rejected - pending;
    const reviewed = approved + rejected;
    const percent = total > 0 ? Math.round((reviewed / total) * 100) : 0;
    return { total, approved, rejected, pending, notInQueue, reviewed, percent };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      if (filterExam !== 'all' && i.submission.assessmentId !== filterExam) return false;
      if (filterStatus !== 'all') {
        const st = i.check?.status ?? 'Not in Queue';
        if (filterStatus !== st) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (!i.submission.student.toLowerCase().includes(q) && !i.submission.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [items, filterExam, filterStatus, search]);

  const displayItems = filteredItems;
  const allSelected = displayItems.length > 0 && displayItems.every(i => selected.has(i.submission.id));

  const handleAddToQueueAndAssign = (submissionId: string, tutorId?: string) => {
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub?.gradedBy) return;
    const existingCheck = checks.find(c => c.submissionId === submissionId);
    if (existingCheck) {
      if (tutorId) updateIqaCheck(existingCheck.id, { assignedTo: tutorId });
    } else {
      const assessorCategoryId = tutors.find(t => t.id === sub.gradedBy)?.categoryId;
      const reviewer = tutorId ?? autoAssignReviewer(sub.gradedBy, assessorCategoryId) ?? undefined;
      addIqaCheck({ submissionId, assessorId: sub.gradedBy, status: 'Pending', assignedTo: reviewer });
    }
    refresh();
  };

  const handleAssignSingle = (tutorId: string) => {
    if (!assignTarget) return;
    handleAddToQueueAndAssign(assignTarget, tutorId);
    const name = tutors.find(t => t.id === tutorId)?.name;
    setToast(`Assigned to ${name ?? 'reviewer'}`);
    setAssignTarget(null);
  };

  const handleBulkAssign = (tutorId: string) => {
    let count = 0;
    selected.forEach(id => {
      handleAddToQueueAndAssign(id, tutorId);
      count++;
    });
    const name = tutors.find(t => t.id === tutorId)?.name;
    setToast(`Assigned ${count} assessment${count !== 1 ? 's' : ''} to ${name ?? 'reviewer'}`);
    setSelected(new Set());
    setShowBulkAssign(false);
  };

  const handleAddToQueue = (submissionId: string) => {
    handleAddToQueueAndAssign(submissionId);
    setToast('Added to IQA queue');
  };

  if (!mounted) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-40 w-full bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!cohort) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <h3 className="text-gray-900 font-semibold mb-1">Cohort not found</h3>
          <p className="text-gray-500 text-sm mb-4">The cohort you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/iqa/sampling" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Sampling
          </Link>
        </div>
      </div>
    );
  }

  const assessorTutor = tutors.find(t => t.id === cohort.assessorId);
  const cohortExams = cohort.examIds.map(id => assessments.find(a => a.id === id)).filter(Boolean);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">
          <Link href="/iqa/review-queue" className="hover:text-orange-600 transition-colors">IQA</Link>
          {' / '}
          <Link href="/iqa/sampling" className="hover:text-orange-600 transition-colors">Sampling</Link>
          {' / '}
          <span className="text-gray-900 font-medium">{cohort.name}</span>
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">{cohort.name}</h1>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${tradeColors[cohort.trade]}`}>
            {cohort.trade}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1">{cohort.packageName}</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-2">
          <svg className="text-green-600 shrink-0" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p className="text-sm text-green-800 font-medium">{toast}</p>
        </div>
      )}

      {/* Info cards row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Cohort Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Cohort Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Assessor</p>
              <p className="text-sm text-gray-900 font-medium mt-0.5">{assessorTutor?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Students</p>
              <p className="text-sm text-gray-900 font-medium mt-0.5">{cohort.students.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Exams</p>
              <div className="space-y-1 mt-1">
                {cohortExams.map((ex, i) => (
                  <div key={ex!.id} className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{ex!.title}</span>
                    <span className="text-xs text-gray-400">({cohort.examDates[i]})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* IQA Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">IQA Review Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Approved', value: stats.approved, color: 'bg-green-100 text-green-700' },
              { label: 'Rejected', value: stats.rejected, color: 'bg-red-100 text-red-700' },
              { label: 'Pending', value: stats.pending, color: 'bg-blue-100 text-blue-700' },
              { label: 'Not in Queue', value: stats.notInQueue, color: 'bg-gray-100 text-gray-500' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.color}`}>{row.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{row.value}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total</span>
              <span className="text-sm font-bold text-gray-900">{stats.total}</span>
            </div>
          </div>
        </div>

        {/* Coverage Ring */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Review Coverage</h3>
          <ProgressRing percent={stats.percent} />
          <p className="text-sm text-gray-500 mt-3">
            <span className="font-semibold text-gray-900">{stats.reviewed}</span>
            {' of '}
            <span className="font-semibold text-gray-900">{stats.total}</span>
            {' reviewed'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
          />
        </div>

        <select
          value={filterExam}
          onChange={e => setFilterExam(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-white"
        >
          <option value="all">All Exams</option>
          {cohortExams.map(ex => <option key={ex!.id} value={ex!.id}>{ex!.title}</option>)}
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Pending">Pending</option>
          <option value="Not in Queue">Not in Queue</option>
        </select>

        {(filterExam !== 'all' || filterStatus !== 'all' || search) && (
          <button
            onClick={() => { setFilterExam('all'); setFilterStatus('all'); setSearch(''); }}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 mb-4 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-medium text-orange-900">
            {selected.size} assessment{selected.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkAssign(true)}
              className="text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Assign Reviewer
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Submissions table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {displayItems.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-500 text-sm">No submissions match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="py-3 px-4 text-left w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => {
                        if (allSelected) setSelected(new Set());
                        else setSelected(new Set(displayItems.map(i => i.submission.id)));
                      }}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Student</th>
                  <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Assessment</th>
                  <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Result</th>
                  <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Submitted</th>
                  <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Reviewer</th>
                  <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">IQA Status</th>
                  <th className="py-3 px-4 text-right font-semibold text-xs text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map(item => {
                  const { submission: sub, assessment, check, assignedReviewer } = item;
                  const isPassing = sub.status === 'Pass';

                  return (
                    <tr
                      key={sub.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${selected.has(sub.id) ? 'bg-orange-50/40' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selected.has(sub.id)}
                          onChange={() => setSelected(prev => {
                            const next = new Set(prev);
                            if (next.has(sub.id)) next.delete(sub.id); else next.add(sub.id);
                            return next;
                          })}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{sub.student}</p>
                        <p className="text-xs text-gray-400">{sub.email}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{assessment?.title ?? '—'}</p>
                        <p className="text-xs text-gray-400">{assessment?.module}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPassing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {isPassing ? 'Pass' : 'Fail'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-500">{sub.submittedAt}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {assignedReviewer ? assignedReviewer.name : <span className="text-gray-400">—</span>}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {check ? (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[check.status]}`}>
                            {check.status}
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            Not in Queue
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {!check && (
                            <button
                              onClick={() => handleAddToQueue(sub.id)}
                              className="text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Add to Queue
                            </button>
                          )}
                          <button
                            onClick={() => setAssignTarget(sub.id)}
                            className="text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Assign
                          </button>
                          {check && (
                            <Link
                              href={`/iqa/review-queue/${check.id}`}
                              className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Review
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing {displayItems.length} of {items.length} submission{items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Single assign modal */}
      {assignTarget && (
        <AssignReviewerModal
          tutors={tutors}
          onAssign={handleAssignSingle}
          onClose={() => setAssignTarget(null)}
        />
      )}

      {/* Bulk assign modal */}
      {showBulkAssign && (
        <AssignReviewerModal
          title="Bulk Assign Reviewer"
          count={selected.size}
          tutors={tutors}
          onAssign={handleBulkAssign}
          onClose={() => setShowBulkAssign(false)}
        />
      )}
    </div>
  );
}
