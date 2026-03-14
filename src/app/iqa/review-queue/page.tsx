'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { getIqaChecks, getIqaTutors, getIqaCategories, removeIqaCheck, skipSubmissions } from '@/lib/iqa-data';
import { submissions, assessments, getStudentPackage } from '@/lib/mock-data';
import type { IqaCheck, IqaCheckStatus } from '@/lib/iqa-data';

// ── Constants ──────────────────────────────────────────────────────────────

const ALL_PAGE_SIZE = 20;

const tradeColors: Record<string, string> = {
  'Gas Engineering': 'bg-orange-100 text-orange-700',
  'Electrical': 'bg-yellow-100 text-yellow-700',
  'Plumbing': 'bg-blue-100 text-blue-700',
};

const statusStyles: Record<IqaCheckStatus, string> = {
  Pending: 'bg-blue-100 text-blue-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};


// ── Sub-components ─────────────────────────────────────────────────────────

type Tab = 'pending' | 'all';

function ReviewQueueContent() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [checks, setChecks] = useState<IqaCheck[]>([]);
  const [allPage, setAllPage] = useState(1);

  const tutors = getIqaTutors();
  const categories = getIqaCategories();

  const refresh = () => setChecks(getIqaChecks());

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('iqa-checks-updated', handler);
    return () => window.removeEventListener('iqa-checks-updated', handler);
  }, []);

  // Reset page when switching tabs
  useEffect(() => { setAllPage(1); }, [activeTab]);

  // Pending items (cards)
  const pendingChecks = useMemo(() => checks.filter(c => c.status === 'Pending'), [checks]);

  // All tab rows (paginated)
  const allTotal = checks.length;
  const allPageCount = Math.max(1, Math.ceil(allTotal / ALL_PAGE_SIZE));
  const allPageChecks = useMemo(
    () => checks.slice((allPage - 1) * ALL_PAGE_SIZE, allPage * ALL_PAGE_SIZE),
    [checks, allPage],
  );

  // Enrich a check into display data
  const enrich = (check: IqaCheck) => {
    const submission = submissions.find(s => s.id === check.submissionId);
    const assessment = submission ? assessments.find(a => a.id === submission.assessmentId) : null;
    const assessor = tutors.find(t => t.id === check.assessorId);
    const category = assessor ? categories.find(c => c.id === assessor.categoryId) : null;
    const assignedReviewer = check.assignedTo ? tutors.find(t => t.id === check.assignedTo) : null;
    const coursePackage = submission ? getStudentPackage(submission.email) : null;
    return { check, submission, assessment, assessor, category, assignedReviewer, coursePackage };
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">IQA</p>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
          {pendingChecks.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
              {pendingChecks.length} pending
            </span>
          )}
          {pendingChecks.length === 0 && checks.length > 0 && (
            <span className="bg-green-100 text-green-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
              All reviewed
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mt-1">
          Approve or reject assessor assessments based on grading quality
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        {([
          { key: 'pending', label: 'Pending', count: pendingChecks.length },
          { key: 'all', label: 'All', count: allTotal },
        ] as { key: Tab; label: string; count: number }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ══ PENDING TAB — 2-column card grid ══ */}
      {activeTab === 'pending' && (
        <>
          {pendingChecks.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="text-green-600" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">All caught up</h3>
              <p className="text-gray-500 text-sm">No assessments pending review.</p>
              <Link
                href="/iqa/assign"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                Go to Assign for Recheck
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingChecks.map(check => {
                const { submission, assessment, assessor, category, assignedReviewer, coursePackage } = enrich(check);
                if (!submission || !assessment) return null;
                const isPassing = (submission.score ?? 0) >= assessment.passMark;

                return (
                  <div
                    key={check.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all flex flex-col gap-4"
                  >
                    {/* Card top */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {/* Student + result */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-gray-900">{submission.student}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPassing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isPassing ? 'Pass' : 'Fail'}
                          </span>
                        </div>

                        {/* Assessment title */}
                        <p className="text-sm text-gray-800 font-medium mb-2">{assessment.title}</p>

                        {/* Trade + module */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tradeColors[assessment.trade] ?? 'bg-gray-100 text-gray-600'}`}>
                            {assessment.trade}
                          </span>
                          <span className="text-xs text-gray-500">{assessment.module}</span>
                        </div>

                        {/* Course package */}
                        {coursePackage && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-400 shrink-0">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                            </svg>
                            <span className="text-xs text-gray-500 font-medium">{coursePackage}</span>
                          </div>
                        )}

                        {/* Graded by + assigned + category */}
                        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                          <span>Graded by <strong className="text-gray-600">{assessor?.name ?? 'Unknown'}</strong></span>
                          {assignedReviewer && (
                            <>
                              <span className="text-gray-200">·</span>
                              <span className="text-blue-500 font-medium">→ {assignedReviewer.name}</span>
                            </>
                          )}
                          {category && (
                            <>
                              <span className="text-gray-200">·</span>
                              <span>{category.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* PDF attachment hint */}
                    {submission.answers && submission.answers.some(a => a.type === 'file') && (
                      <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-red-400 shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 0 0-.293-.707l-5.414-5.414A1 1 0 0 0 12.586 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
                        </svg>
                        <span className="text-xs text-gray-400">
                          {submission.answers.filter(a => a.type === 'file').length} PDF document{submission.answers.filter(a => a.type === 'file').length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Action */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-gray-400">{submission.submittedAt}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            removeIqaCheck(check.id);
                            skipSubmissions([submission.id]);
                          }}
                          className="text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                        >
                          Skip
                        </button>
                        <Link
                          href={`/iqa/review-queue/${check.id}`}
                          className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          Review
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══ ALL TAB — paginated table ══ */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {checks.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-500 text-sm">No assessments in the review queue.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Student</th>
                      <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Assessment</th>
                      <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Package</th>
                      <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Result</th>
                      <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Graded By</th>
                      <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">IQA Status</th>
                      <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPageChecks.map(check => {
                      const { submission, assessment, assessor, coursePackage } = enrich(check);
                      if (!submission || !assessment) return null;
                      const isPassing = (submission.score ?? 0) >= assessment.passMark;

                      return (
                        <tr key={check.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors cursor-pointer" onClick={() => { window.location.href = `/iqa/review-queue/${check.id}`; }}>
                          {/* Student */}
                          <td className="py-3.5 px-5">
                            <p className="font-medium text-gray-900">{submission.student}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{submission.email}</p>
                          </td>

                          {/* Assessment */}
                          <td className="py-3.5 px-5">
                            <p className="font-medium text-gray-900">{assessment.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${tradeColors[assessment.trade] ?? 'bg-gray-100 text-gray-600'}`}>
                                {assessment.trade}
                              </span>
                              <span className="text-xs text-gray-400">{assessment.module}</span>
                            </div>
                          </td>

                          {/* Package */}
                          <td className="py-3.5 px-5">
                            <span className="text-sm text-gray-600">{coursePackage ?? '—'}</span>
                          </td>

                          {/* Result */}
                          <td className="py-3.5 px-5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPassing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {isPassing ? 'Pass' : 'Fail'}
                            </span>
                          </td>

                          {/* Graded By */}
                          <td className="py-3.5 px-5">
                            <span className="text-sm text-gray-600">{assessor?.name ?? '—'}</span>
                          </td>

                          {/* IQA Status */}
                          <td className="py-3.5 px-5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[check.status]}`}>
                              {check.status}
                            </span>
                          </td>

                          {/* Submitted */}
                          <td className="py-3.5 px-5">
                            <span className="text-sm text-gray-500">{submission.submittedAt}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {allPageCount > 1 && (
                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Showing {(allPage - 1) * ALL_PAGE_SIZE + 1}–{Math.min(allPage * ALL_PAGE_SIZE, allTotal)} of {allTotal}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setAllPage(p => Math.max(1, p - 1))}
                      disabled={allPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    {Array.from({ length: allPageCount }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setAllPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          page === allPage
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setAllPage(p => Math.min(allPageCount, p + 1))}
                      disabled={allPage === allPageCount}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {allPageCount <= 1 && (
                <div className="px-5 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Showing all {allTotal} assessment{allTotal !== 1 ? 's' : ''}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReviewQueuePage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ReviewQueueContent />
    </Suspense>
  );
}
