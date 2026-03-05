'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getIqaChecks, getIqaTutors, getIqaCategories, updateIqaCheck } from '@/lib/iqa-data';
import { submissions, assessments } from '@/lib/mock-data';
import type { IqaCheckStatus } from '@/lib/iqa-data';

const REVIEWER_NAME = 'Admin User';

const statusStyles: Record<IqaCheckStatus, string> = {
  Pending: 'bg-blue-100 text-blue-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

export default function IqaReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const checkId = params.id as string;

  const check = getIqaChecks().find(c => c.id === checkId);
  const submission = check ? submissions.find(s => s.id === check.submissionId) : null;
  const assessment = submission ? assessments.find(a => a.id === submission.assessmentId) : null;
  const iqaTutors = getIqaTutors();
  const iqaCategories = getIqaCategories();
  const tutor = check ? iqaTutors.find(t => t.id === check.tutorId) : null;
  const category = tutor ? iqaCategories.find(c => c.id === tutor.categoryId) : null;
  const assignedTutor = check?.assignedTo ? iqaTutors.find(t => t.id === check.assignedTo) : null;

  const [feedback, setFeedback] = useState(check?.feedback ?? '');
  const [error, setError] = useState('');
  const [localStatus, setLocalStatus] = useState<IqaCheckStatus>(check?.status ?? 'Pending');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (check) setLocalStatus(check.status);
  }, [check]);

  if (!check || !submission || !assessment) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <h3 className="text-gray-900 font-semibold mb-1">Assessment not found</h3>
          <Link href="/iqa/review-queue" className="text-orange-600 hover:underline text-sm mt-2 inline-block">
            Back to Review Queue
          </Link>
        </div>
      </div>
    );
  }

  const passMark = assessment.passMark;
  const score = submission.score ?? 0;
  const willPass = score >= passMark;
  const isPending = localStatus === 'Pending';

  const handleApprove = () => {
    setError('');
    updateIqaCheck(check.id, {
      status: 'Approved',
      reviewerName: REVIEWER_NAME,
      reviewedAt: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      feedback: feedback.trim() || undefined,
    });
    setLocalStatus('Approved');
    setSuccessMsg('Assessment approved successfully.');
  };

  const handleReject = () => {
    if (!feedback.trim()) {
      setError('Feedback is required when rejecting.');
      return;
    }
    setError('');
    updateIqaCheck(check.id, {
      status: 'Rejected',
      reviewerName: REVIEWER_NAME,
      reviewedAt: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      feedback,
    });
    setLocalStatus('Rejected');
    setSuccessMsg('Assessment rejected. Feedback sent to tutor.');
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
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">IQA Review</p>
              <h1 className="text-lg font-bold text-gray-900">{assessment.title}</h1>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[localStatus]}`}>
              {localStatus}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
              {submission.student.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-sm text-gray-600">{submission.student}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">Submitted {submission.submittedAt}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">Time: {submission.timeTaken}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-gray-500">Graded by <strong className="text-gray-700">{tutor?.name ?? 'Unknown'}</strong></span>
            {assignedTutor && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-blue-600 font-medium">Assigned to {assignedTutor.name}</span>
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

        {/* Tutor's grading */}
        <div className="px-6 py-4 bg-amber-50/50 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Tutor&apos;s Grading</p>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-2xl font-bold text-gray-900">{score}%</span>
              <span className={`ml-2 text-sm font-semibold px-2 py-0.5 rounded-lg ${willPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {willPass ? 'Pass' : 'Fail'}
              </span>
            </div>
            <span className="text-sm text-gray-500">Pass mark: {passMark}%</span>
          </div>
        </div>

        {/* Uploaded documents */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm font-semibold text-gray-900">Uploaded Assessment Documents</p>
          {(!submission.answers || submission.answers.length === 0) ? (
            <div className="bg-gray-50 rounded-xl p-5 text-center">
              <p className="text-sm text-gray-500">No documents uploaded for this submission.</p>
            </div>
          ) : (
            submission.answers.map((item, i) =>
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
                      <p className="text-xs text-gray-500">{item.fileType} {item.size && `· ${item.size}`}</p>
                    </div>
                    <a
                      href="#"
                      onClick={e => e.preventDefault()}
                      className="text-sm font-medium text-orange-600 hover:text-orange-700 shrink-0"
                    >
                      View PDF
                    </a>
                  </div>
                </div>
              ) : (
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Question {i + 1}</p>
                  <p className="text-sm font-medium text-gray-900 mb-3">{item.question}</p>
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-400 mb-1">Student&apos;s Answer</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* Already-reviewed info */}
        {!isPending && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Review Decision</p>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[localStatus]}`}>
                {localStatus}
              </span>
              {check.reviewerName && (
                <span className="text-sm text-gray-500">by {check.reviewerName}</span>
              )}
              {check.reviewedAt && (
                <span className="text-xs text-gray-400">{check.reviewedAt}</span>
              )}
            </div>
            {check.feedback && localStatus === 'Rejected' && (
              <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-700 mb-1">Feedback</p>
                <p className="text-sm text-red-800">{check.feedback}</p>
              </div>
            )}
            {check.feedback && localStatus === 'Approved' && (
              <div className="mt-3 bg-green-50 border border-green-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 mb-1">Feedback</p>
                <p className="text-sm text-green-800">{check.feedback}</p>
              </div>
            )}
          </div>
        )}

        {/* Review actions */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 space-y-4">
          {isPending && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Feedback <span className="text-gray-400 font-normal">(required when rejecting)</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={e => { setFeedback(e.target.value); setError(''); }}
                  rows={3}
                  placeholder="Add feedback for the tutor..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 resize-none"
                />
                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              </div>
              <div className="flex items-center justify-end gap-3">
                <Link
                  href="/iqa/review-queue"
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleReject}
                  className="px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  className="px-5 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Approve
                </button>
              </div>
            </>
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
