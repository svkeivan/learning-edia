'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getIqaChecks,
  getIqaTutors,
  getIqaCategories,
  addIqaCheck,
  updateIqaCheck,
  autoAssignReviewer,
  getCohortIqaCompletedAt,
  setCohortIqaCompleted,
  getCohortIqaReviewerOverride,
} from '@/lib/iqa-data';
import { cohorts, submissions, assessments, getSubmissionVersionOptions } from '@/lib/mock-data';
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
  Skipped: 'bg-gray-200 text-gray-700',
};

interface CohortSubmission {
  submission: (typeof submissions)[number];
  assessment: (typeof assessments)[number] | undefined;
  check: IqaCheck | undefined;
  assignedReviewer: IqaTutor | undefined;
  assessor: IqaTutor | undefined;
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

export type CohortIqaCohortDetailVariant = 'sampling' | 'review-queue' | 'assessor-queue';

type CohortTab = 'in-queue' | 'not-in-queue';

// ── Page ─────────────────────────────────────────────────────────────────────

export function CohortIqaCohortDetail({ variant }: { variant: CohortIqaCohortDetailVariant }) {
  const { cohortId } = useParams<{ cohortId: string }>();
  const [checks, setChecks] = useState<IqaCheck[]>([]);
  const [tutors, setTutors] = useState<IqaTutor[]>([]);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState('');

  const isReviewer = variant === 'review-queue';
  const readOnlyCohort = variant === 'sampling' || variant === 'assessor-queue';
  const listPath = variant === 'assessor-queue' ? '/iqa/assessor-queue' : variant === 'sampling' ? '/iqa/sampling' : '/iqa/review-queue';
  const listLabel = variant === 'assessor-queue' ? 'Assessor Queue' : variant === 'sampling' ? 'Cohort View' : 'Review Queue';

  // Sampling uses a dropdown filter; review-queue uses tabs
  const [filterExam, setFilterExam] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [cohortTab, setCohortTab] = useState<CohortTab>('in-queue');

  const [cohortCompleteBump, setCohortCompleteBump] = useState(0);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const refresh = useCallback(() => {
    setChecks(getIqaChecks());
    setTutors(getIqaTutors());
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();
    window.addEventListener('iqa-checks-updated', refresh);
    window.addEventListener('iqa-tutors-updated', refresh);
    const onCohortDone = () => setCohortCompleteBump(b => b + 1);
    const onReviewerOverride = () => setCohortCompleteBump(b => b + 1);
    window.addEventListener('iqa-cohort-completed-updated', onCohortDone);
    window.addEventListener('iqa-cohort-reviewer-override-updated', onReviewerOverride);
    return () => {
      window.removeEventListener('iqa-checks-updated', refresh);
      window.removeEventListener('iqa-tutors-updated', refresh);
      window.removeEventListener('iqa-cohort-completed-updated', onCohortDone);
      window.removeEventListener('iqa-cohort-reviewer-override-updated', onReviewerOverride);
    };
  }, [refresh]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(''), 3500); return () => clearTimeout(t); }
  }, [toast]);

  const cohort = cohorts.find(c => c.id === cohortId);
  void cohortCompleteBump;
  const cohortCompletedAt = cohort ? getCohortIqaCompletedAt(cohort.id) : undefined;

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
    const skipped = items.filter(i => i.check?.status === 'Skipped').length;
    const notInQueue = items.filter(i => !i.check).length;
    const inQueue = total - notInQueue;
    const reviewed = approved + rejected;
    const percent = total > 0 ? Math.round((reviewed / total) * 100) : 0;
    return { total, approved, rejected, pending, skipped, notInQueue, inQueue, reviewed, percent };
  }, [items]);

  // Items split by queue membership (for reviewer tabs)
  const inQueueItems = useMemo(() => items.filter(i => !!i.check), [items]);
  const notInQueueItems = useMemo(() => items.filter(i => !i.check), [items]);

  // Filtered items: reviewer uses tabs, sampling uses dropdown
  const filteredItems = useMemo(() => {
    let base: CohortSubmission[];
    if (isReviewer) {
      base = cohortTab === 'in-queue' ? inQueueItems : notInQueueItems;
    } else {
      base = items;
    }
    return base.filter(i => {
      if (filterExam !== 'all' && i.submission.assessmentId !== filterExam) return false;
      if (readOnlyCohort && filterStatus !== 'all') {
        const st = i.check?.status ?? 'Not in Queue';
        if (filterStatus !== st) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (!i.submission.student.toLowerCase().includes(q) && !i.submission.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [items, inQueueItems, notInQueueItems, isReviewer, readOnlyCohort, cohortTab, filterExam, filterStatus, search]);

  const displayItems = filteredItems;

  // ── Handlers ──

  const effectiveLeadReviewerId = cohort
    ? (getCohortIqaReviewerOverride(cohort.id) ?? cohort.iqaReviewerId)
    : undefined;

  const handleAddToQueue = (submissionId: string) => {
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub?.gradedBy) return;
    const existingCheck = checks.find(c => c.submissionId === submissionId);
    if (!existingCheck) {
      const reviewer = effectiveLeadReviewerId ?? (autoAssignReviewer(sub.gradedBy, tutors.find(t => t.id === sub.gradedBy)?.categoryId) ?? undefined);
      addIqaCheck({ submissionId, assessorId: sub.gradedBy, status: 'Pending', assignedTo: reviewer });
    }
    refresh();
    setToast('Added to IQA queue');
  };

  const handleReviewFromNotInQueue = (submissionId: string) => {
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub?.gradedBy) return;
    const existing = checks.find(c => c.submissionId === submissionId);
    let checkId = existing?.id;
    if (!existing) {
      const reviewer = effectiveLeadReviewerId ?? (autoAssignReviewer(sub.gradedBy, tutors.find(t => t.id === sub.gradedBy)?.categoryId) ?? undefined);
      checkId = addIqaCheck({ submissionId, assessorId: sub.gradedBy, status: 'Pending', assignedTo: reviewer });
    }
    if (checkId) window.location.href = `/iqa/review-queue/${checkId}`;
  };

  // ── Loading / Not found ──

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
          <Link
            href={listPath}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to {listLabel}
          </Link>
        </div>
      </div>
    );
  }

  const assessorTutor = tutors.find(t => t.id === cohort.assessorId);
  const assessorCategory = assessorTutor ? getIqaCategories().find(c => c.id === assessorTutor.categoryId) : undefined;
  const cohortExams = cohort.examIds.map(id => assessments.find(a => a.id === id)).filter(Boolean);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">
          <Link href="/iqa/review-queue" className="hover:text-orange-600 transition-colors">IQA</Link>
          {' / '}
          <Link href={listPath} className="hover:text-orange-600 transition-colors">{listLabel}</Link>
          {' / '}
          <span className="text-gray-900 font-medium">{cohort.name}</span>
        </p>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{cohort.name}</h1>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${tradeColors[cohort.trade]}`}>
                {cohort.trade}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{cohort.packageName}</p>
          </div>
          {isReviewer && (
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {cohortCompletedAt ? (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-100 text-green-800 border border-green-200">
                  Cohort review complete &middot; {cohortCompletedAt}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFinishConfirm(true)}
                  className="inline-flex items-center gap-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Finish cohort review
                </button>
              )}
            </div>
          )}
        </div>
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
            {effectiveLeadReviewerId && (
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Lead IQA reviewer</p>
                <p className="text-sm text-gray-900 font-medium mt-0.5">
                  {tutors.find(t => t.id === effectiveLeadReviewerId)?.name ?? '—'}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Students</p>
              <p className="text-sm text-gray-900 font-medium mt-0.5">{cohort.students.length}</p>
            </div>
            {cohort.iqaSentDate && (
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Sent for IQA</p>
                <p className="text-sm text-gray-900 font-medium mt-0.5">{cohort.iqaSentDate}</p>
              </div>
            )}
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
              { label: 'Skipped', value: stats.skipped, color: 'bg-gray-200 text-gray-600' },
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

      {/* Queue selection info */}
      {(variant === 'sampling' || variant === 'assessor-queue') && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6">
          <div className="flex gap-3">
            <svg className="text-blue-500 shrink-0 mt-0.5" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1.5">How is the IQA queue selected?</h4>
              <ul className="text-sm text-blue-800 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Pre-IQA check:</strong> The system reviews the assessor&apos;s prior IQA history to determine their risk profile and track record.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Minimum review %:</strong> Based on the assessor&apos;s risk category
                    {assessorCategory && (
                      <span className="font-medium"> ({assessorCategory.name} — {assessorCategory.recheckPercent}%)</span>
                    )}
                    , a minimum percentage of submissions must be reviewed by IQA.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Minimum coverage:</strong> Every cohort must have at least 1 student&apos;s exam selected for IQA review, regardless of the percentage threshold.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Reviewer: In Queue / Not in Queue tabs ── */}
      {isReviewer && (
        <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
          {([
            { key: 'in-queue' as const, label: 'In Queue', count: stats.inQueue },
            { key: 'not-in-queue' as const, label: 'Not in Queue', count: stats.notInQueue },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setCohortTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                cohortTab === tab.key
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                cohortTab === tab.key ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Filters bar */}
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

        {/* Read-only cohort status filter */}
        {readOnlyCohort && (
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending</option>
            <option value="Skipped">Skipped</option>
            <option value="Not in Queue">Not in Queue</option>
          </select>
        )}

        {(filterExam !== 'all' || (readOnlyCohort && filterStatus !== 'all') || search) && (
          <button
            onClick={() => { setFilterExam('all'); setFilterStatus('all'); setSearch(''); }}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Submissions table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {displayItems.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-500 text-sm">
              {isReviewer && cohortTab === 'in-queue'
                ? 'No assessments in queue. Switch to the "Not in Queue" tab to add some.'
                : isReviewer
                  ? 'All assessments are in the queue.'
                  : 'No submissions match your filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Student</th>
                  <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Assessment</th>
                  <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Result</th>
                  <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Submitted</th>
                  <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Exam date</th>
                  <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">IQA Status</th>
                  {isReviewer && (
                    <th className="py-3 px-4 text-right font-semibold text-xs text-gray-500 uppercase tracking-wide">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {displayItems.map(item => {
                  const { submission: sub, assessment, check } = item;
                  const isPassing = sub.status === 'Pass';
                  const examIdx = cohort.examIds.indexOf(sub.assessmentId);
                  const examDate = examIdx >= 0 ? cohort.examDates[examIdx] : '—';

                  const rowClickable = !!check;

                  return (
                    <tr
                      key={sub.id}
                      onClick={rowClickable ? () => { window.location.href = `/iqa/review-queue/${check!.id}`; } : undefined}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${rowClickable ? 'cursor-pointer' : ''}`}
                    >

                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{sub.student}</p>
                        <p className="text-xs text-gray-400">{sub.email}</p>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-gray-900">{assessment?.title ?? '—'}</p>
                          {getSubmissionVersionOptions(sub.id).length > 1 && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 shrink-0">
                              {getSubmissionVersionOptions(sub.id).length} versions
                            </span>
                          )}
                        </div>
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
                        <span className="text-sm text-gray-600">{examDate}</span>
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

                      {isReviewer && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center gap-2 justify-end flex-wrap">
                            {!check && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleAddToQueue(sub.id); }}
                                  className="text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  Add to Queue
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleReviewFromNotInQueue(sub.id); }}
                                  className="text-xs font-medium bg-gray-800 hover:bg-gray-900 text-white px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  Review
                                </button>
                              </>
                            )}
                            {check && check.status === 'Pending' && (
                              <Link
                                href={`/iqa/review-queue/${check.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Review
                              </Link>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing {displayItems.length} of {isReviewer ? (cohortTab === 'in-queue' ? inQueueItems.length : notInQueueItems.length) : items.length} submission{items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Finish cohort confirmation modal */}
      {showFinishConfirm && cohort && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Finish cohort review</h2>
              <p className="text-sm text-gray-500 mt-1">{cohort.name}</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <div className="flex gap-2">
                  <svg className="text-amber-600 shrink-0 mt-0.5" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">This action is not easy to undo</p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      Once finished, the cohort review will be marked as complete.
                    </p>
                  </div>
                </div>
              </div>

              {stats.pending > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <div className="flex gap-2">
                    <svg className="text-red-600 shrink-0 mt-0.5" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        {stats.pending} assessment{stats.pending !== 1 ? 's' : ''} in queue not yet reviewed
                      </p>
                      <p className="text-sm text-red-700 mt-0.5">
                        These pending assessments will be marked as &ldquo;Skipped&rdquo; when you finish.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>{stats.approved}</strong> approved &middot; <strong>{stats.rejected}</strong> rejected &middot; <strong>{stats.pending}</strong> pending &middot; <strong>{stats.skipped}</strong> skipped &middot; <strong>{stats.notInQueue}</strong> not in queue</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const finishTs = new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
                  items.forEach(item => {
                    if (item.check?.status === 'Pending') {
                      updateIqaCheck(item.check.id, {
                        status: 'Skipped',
                        reviewedAt: finishTs,
                        reviewerName: 'Cohort review',
                        feedback: 'Marked skipped when cohort review was completed.',
                      });
                    }
                  });
                  setCohortIqaCompleted(cohort.id);
                  refresh();
                  setShowFinishConfirm(false);
                  setToast('Cohort review finished');
                }}
                className="px-5 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Finish cohort review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
