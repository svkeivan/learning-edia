'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getIqaChecks, getIqaTutors, getIqaCategories, updateIqaCheck } from '@/lib/iqa-data';
import { submissions, assessments } from '@/lib/mock-data';
import type { IqaCheckStatus, IqaOutcomeType } from '@/lib/iqa-data';

const REVIEWER_NAME = 'Admin User';

const statusStyles: Record<IqaCheckStatus, string> = {
  Pending: 'bg-blue-100 text-blue-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

// ── Mock assessor evaluation form ──────────────────────────────────────────

type CriterionResult = 'Pass' | 'Partial' | 'Fail';

interface AssessorCriterion {
  label: string;
  result: CriterionResult;
}

interface AssessorForm {
  criteria: AssessorCriterion[];
  evidenceNotes: string;
  overallComments: string;
  gradedAt: string;
}

const criterionColors: Record<CriterionResult, string> = {
  Pass: 'bg-green-100 text-green-700',
  Partial: 'bg-amber-100 text-amber-700',
  Fail: 'bg-red-100 text-red-700',
};

function getMockAssessorForm(submissionId: string, isPassing: boolean): AssessorForm {
  // Deterministic mock based on submission ID — passing subs get mostly Pass criteria
  const seed = submissionId.charCodeAt(submissionId.length - 1);
  const criteriaTemplates: { label: string; passBias: number }[] = [
    { label: 'Safety procedures followed correctly', passBias: 0.9 },
    { label: 'Correct methodology applied throughout', passBias: 0.8 },
    { label: 'Documentation complete and accurate', passBias: 0.85 },
    { label: 'Practical work meets required standard', passBias: 0.75 },
    { label: 'Health & safety considerations addressed', passBias: 0.9 },
  ];

  const criteria: AssessorCriterion[] = criteriaTemplates.map((t, i) => {
    const roll = ((seed * (i + 1) * 37) % 100) / 100;
    let result: CriterionResult;
    if (isPassing) {
      result = roll < t.passBias ? 'Pass' : roll < t.passBias + 0.1 ? 'Partial' : 'Fail';
    } else {
      result = roll < 0.4 ? 'Pass' : roll < 0.65 ? 'Partial' : 'Fail';
    }
    return { label: t.label, result };
  });

  const passCount = criteria.filter(c => c.result === 'Pass').length;
  const evidenceNotes = isPassing
    ? 'Student submitted all required evidence. Work demonstrates adequate understanding of core principles and practical application.'
    : 'Several areas require improvement. Evidence submitted is incomplete in parts. Student should revisit key module sections before retaking.';

  const overallComments = passCount >= 4
    ? 'Overall strong performance. Minor areas for development noted but core competency demonstrated.'
    : passCount >= 3
      ? 'Adequate performance with some gaps. Assessor has marked as pass with notes for improvement.'
      : 'Significant gaps in knowledge and application. Assessor decision requires IQA scrutiny.';

  const hours = 9 + (seed % 8);
  const minutes = (seed * 7) % 60;
  const dateNum = 12 + (seed % 6);
  const gradedAt = `${dateNum} Feb 2026, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return { criteria, evidenceNotes, overallComments, gradedAt };
}

// ── Outcome labels ─────────────────────────────────────────────────────────

const outcomeLabels: Record<IqaOutcomeType, { label: string; badge: string; description: string }> = {
  'approved': {
    label: 'Approved',
    badge: 'bg-green-100 text-green-700',
    description: 'Assessor grading confirmed as correct.',
  },
  'recheck-assessor': {
    label: 'Fail — Recheck by Assessor',
    badge: 'bg-amber-100 text-amber-700',
    description: 'Grading rejected. Assessor must re-grade this submission.',
  },
  'return-module': {
    label: 'Fail — Return to Module',
    badge: 'bg-red-100 text-red-700',
    description: 'Grading rejected. Student must review the module and retake the exam.',
  },
};

// ── Page ───────────────────────────────────────────────────────────────────

export default function IqaReviewDetailPage() {
  const params = useParams();
  const checkId = params.id as string;

  const check = getIqaChecks().find(c => c.id === checkId);
  const submission = check ? submissions.find(s => s.id === check.submissionId) : null;
  const assessment = submission ? assessments.find(a => a.id === submission.assessmentId) : null;
  const iqaTutors = getIqaTutors();
  const iqaCategories = getIqaCategories();
  const assessor = check ? iqaTutors.find(t => t.id === check.tutorId) : null;
  const category = assessor ? iqaCategories.find(c => c.id === assessor.categoryId) : null;
  const assignedReviewer = check?.assignedTo ? iqaTutors.find(t => t.id === check.assignedTo) : null;

  const [feedback, setFeedback] = useState(check?.feedback ?? '');
  const [error, setError] = useState('');
  const [localStatus, setLocalStatus] = useState<IqaCheckStatus>(check?.status ?? 'Pending');
  const [localOutcome, setLocalOutcome] = useState<IqaOutcomeType | undefined>(check?.outcomeType);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (check) {
      setLocalStatus(check.status);
      setLocalOutcome(check.outcomeType);
    }
  }, [check]);

  if (!check || !submission || !assessment) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <h3 className="text-gray-900 font-semibold mb-1">Assessment not found</h3>
          <Link href="/iqa/review-queue" className="text-orange-600 hover:underline text-sm mt-2 inline-block">
            Back to Review Queue
          </Link>
        </div>
      </div>
    );
  }

  const isPassing = (submission.score ?? 0) >= assessment.passMark;
  const isPending = localStatus === 'Pending';
  const assessorForm = getMockAssessorForm(submission.id, isPassing);
  const now = () => new Date().toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const handleApprove = () => {
    setError('');
    updateIqaCheck(check.id, {
      status: 'Approved',
      outcomeType: 'approved',
      reviewerName: REVIEWER_NAME,
      reviewedAt: now(),
      feedback: feedback.trim() || undefined,
    });
    setLocalStatus('Approved');
    setLocalOutcome('approved');
    setSuccessMsg('Assessment approved — assessor grading confirmed.');
  };

  const handleFailRecheck = () => {
    if (!feedback.trim()) { setError('Feedback is required.'); return; }
    setError('');
    updateIqaCheck(check.id, {
      status: 'Rejected',
      outcomeType: 'recheck-assessor',
      reviewerName: REVIEWER_NAME,
      reviewedAt: now(),
      feedback,
    });
    setLocalStatus('Rejected');
    setLocalOutcome('recheck-assessor');
    setSuccessMsg('Rejected — assessor has been notified to re-grade.');
  };

  const handleFailReturnModule = () => {
    if (!feedback.trim()) { setError('Feedback is required.'); return; }
    setError('');
    updateIqaCheck(check.id, {
      status: 'Rejected',
      outcomeType: 'return-module',
      reviewerName: REVIEWER_NAME,
      reviewedAt: now(),
      feedback,
    });
    setLocalStatus('Rejected');
    setLocalOutcome('return-module');
    setSuccessMsg('Rejected — student will be required to revisit the module and retake.');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/iqa" className="text-sm text-gray-500 hover:text-gray-700">IQA</Link>
        <span className="text-gray-400 mx-2">/</span>
        <Link href="/iqa/review-queue" className="text-sm text-gray-500 hover:text-gray-700">Review Queue</Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-sm text-gray-900 font-medium">{isPending ? 'Review' : 'Details'}</span>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-5 py-3.5 flex items-center gap-3">
          <svg className="text-green-600 shrink-0" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p className="text-sm text-green-800 font-medium flex-1">{successMsg}</p>
          <Link href="/iqa/review-queue" className="text-sm font-semibold text-green-700 hover:text-green-800 underline">
            Back to Queue
          </Link>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ── Header ── */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">IQA Review · {assessment.module}</p>
              <h1 className="text-lg font-bold text-gray-900">{assessment.title}</h1>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${statusStyles[localStatus]}`}>
              {localStatus}
            </span>
          </div>

          {/* Student row */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-sm font-medium text-gray-800">{submission.student}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">{submission.email}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">Submitted {submission.submittedAt}</span>
          </div>

          {/* Assessor / category row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs text-gray-500">
              Graded by <strong className="text-gray-700">{assessor?.name ?? 'Unknown'}</strong>
            </span>
            {assignedReviewer && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-blue-600 font-medium">Assigned to {assignedReviewer.name}</span>
              </>
            )}
            {category && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">{category.name} ({category.recheckPercent}% recheck)</span>
              </>
            )}
          </div>
        </div>

        {/* ── Assessor's decision ── */}
        <div className="px-6 py-4 bg-amber-50/40 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Assessor&apos;s Decision</p>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isPassing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isPassing ? 'Pass' : 'Fail'}
          </span>
        </div>

        {/* ── Two-column: Student submission + Assessor form ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {/* Student's uploaded documents */}
          <div className="px-6 py-5">
            <p className="text-sm font-semibold text-gray-900 mb-4">Student&apos;s Submission</p>
            {(!submission.answers || submission.answers.length === 0) ? (
              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <p className="text-sm text-gray-500">No documents uploaded for this submission.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submission.answers.map((item, i) =>
                  item.type === 'file' ? (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-red-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 0 0-.293-.707l-5.414-5.414A1 1 0 0 0 12.586 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.fileName}</p>
                          <p className="text-xs text-gray-500">{item.fileType}{item.size && ` · ${item.size}`}</p>
                        </div>
                        <a href="#" onClick={e => e.preventDefault()} className="text-sm font-medium text-orange-600 hover:text-orange-700 shrink-0">
                          View PDF
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Q{i + 1}</p>
                      <p className="text-sm font-medium text-gray-900 mb-2">{item.question}</p>
                      <div className="bg-white rounded-lg border border-gray-200 p-3">
                        <p className="text-xs text-gray-400 mb-1">Student&apos;s Answer</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Assessor's evaluation form */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">Assessor&apos;s Evaluation Form</p>
              <span className="text-xs text-gray-400">Graded {assessorForm.gradedAt}</span>
            </div>

            {/* Criteria checklist */}
            <div className="space-y-2 mb-4">
              {assessorForm.criteria.map((c, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                  <p className="text-sm text-gray-700 flex-1">{c.label}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${criterionColors[c.result]}`}>
                    {c.result}
                  </span>
                </div>
              ))}
            </div>

            {/* Evidence notes */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Evidence Notes</p>
              <p className="text-sm text-gray-700 leading-relaxed">{assessorForm.evidenceNotes}</p>
            </div>

            {/* Overall comments */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Overall Comments</p>
              <p className="text-sm text-gray-700 leading-relaxed">{assessorForm.overallComments}</p>
            </div>
          </div>
        </div>

        {/* ── Already-reviewed decision ── */}
        {!isPending && localOutcome && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">IQA Decision</p>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${outcomeLabels[localOutcome].badge}`}>
                {outcomeLabels[localOutcome].label}
              </span>
              {check.reviewerName && <span className="text-sm text-gray-500">by {check.reviewerName}</span>}
              {check.reviewedAt && <span className="text-xs text-gray-400">{check.reviewedAt}</span>}
            </div>
            <p className="text-xs text-gray-500">{outcomeLabels[localOutcome].description}</p>
            {check.feedback && (
              <div className={`mt-3 rounded-lg p-3 border ${
                localStatus === 'Approved'
                  ? 'bg-green-50 border-green-100'
                  : 'bg-red-50 border-red-100'
              }`}>
                <p className={`text-xs font-semibold mb-1 ${localStatus === 'Approved' ? 'text-green-700' : 'text-red-700'}`}>
                  Feedback
                </p>
                <p className={`text-sm ${localStatus === 'Approved' ? 'text-green-800' : 'text-red-800'}`}>
                  {check.feedback}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Review actions ── */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50">
          {isPending && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Feedback / Reason <span className="text-gray-400 font-normal">(required when failing)</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={e => { setFeedback(e.target.value); setError(''); }}
                  rows={3}
                  placeholder="Add feedback for the assessor..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 resize-none"
                />
                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              </div>

              {/* Three outcome buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/iqa/review-queue"
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  Cancel
                </Link>

                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                  {/* Approve */}
                  <button
                    onClick={handleApprove}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    Approve
                  </button>

                  {/* Fail — Recheck by Assessor */}
                  <button
                    onClick={handleFailRecheck}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                  >
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Fail — Recheck by Assessor
                  </button>

                  {/* Fail — Return to Module */}
                  <button
                    onClick={handleFailReturnModule}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                    Fail — Return to Module
                  </button>
                </div>
              </div>

              {/* Outcome descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <p className="text-xs text-gray-400 leading-snug">
                  <strong className="text-green-600">Approve</strong> — assessor grading is confirmed correct.
                </p>
                <p className="text-xs text-gray-400 leading-snug">
                  <strong className="text-amber-600">Recheck</strong> — assessor must re-evaluate and re-grade this submission.
                </p>
                <p className="text-xs text-gray-400 leading-snug">
                  <strong className="text-red-600">Return to Module</strong> — student revisits the module before retaking the exam.
                </p>
              </div>
            </div>
          )}

          {!isPending && (
            <div className="flex justify-end">
              <Link
                href="/iqa/review-queue"
                className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Back to Queue
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
