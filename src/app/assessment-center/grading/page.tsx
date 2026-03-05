'use client';

import Link from 'next/link';
import { useState } from 'react';
import { assessments, submissions, StudentSubmission } from '@/lib/mock-data';

const pendingSubmissions = submissions.filter(s => s.status === 'Grading');

type Filter = 'All' | 'Gas Engineering' | 'Electrical' | 'Plumbing';

function GradingModal({
  submission,
  onClose,
  onSubmit,
}: {
  submission: StudentSubmission;
  onClose: () => void;
  onSubmit: (id: string, score: number, feedback: string) => void;
}) {
  const assessment = assessments.find(a => a.id === submission.assessmentId)!;
  const [score, setScore] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const n = parseInt(score);
    if (isNaN(n) || n < 0 || n > 100) {
      setError('Please enter a score between 0 and 100.');
      return;
    }
    onSubmit(submission.id, n, feedback);
  };

  const scoreNum = parseInt(score);
  const willPass = !isNaN(scoreNum) && scoreNum >= assessment.passMark;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">Grading submission</p>
            <h2 className="text-lg font-bold text-gray-900">{assessment.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                {submission.student.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-sm text-gray-600">{submission.student}</span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-500">Submitted {submission.submittedAt}</span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-500">{submission.timeTaken}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Answers / Uploaded documents */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {submission.answers?.map((item, i) =>
            item.type === 'file' ? (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Uploaded document</p>
                <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 0 0-.293-.707l-5.414-5.414A1 1 0 0 0 12.586 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.fileName}</p>
                    <p className="text-xs text-gray-500">{item.fileType} {item.size && `· ${item.size}`}</p>
                  </div>
                  <a href="#" onClick={e => e.preventDefault()} className="text-sm font-medium text-orange-600 hover:text-orange-700 shrink-0"
                  >View PDF</a>
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
          )}
        </div>

        {/* Grading Controls */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Score (0 – 100) · Pass mark: {assessment.passMark}%
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number" min={0} max={100} value={score}
                  onChange={e => { setScore(e.target.value); setError(''); }}
                  placeholder="e.g. 78"
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                />
                {score !== '' && !isNaN(scoreNum) && (
                  <span className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${willPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {willPass ? '✓ Pass' : '✗ Fail'}
                  </span>
                )}
              </div>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Feedback for Student (optional)</label>
            <textarea
              value={feedback} onChange={e => setFeedback(e.target.value)}
              rows={3}
              placeholder="Add feedback or comments visible to the student..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              Submit Grade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GradingQueuePage() {
  const [filter, setFilter] = useState<Filter>('All');
  const [assessmentFilter, setAssessmentFilter] = useState('All');
  const [gradingItem, setGradingItem] = useState<StudentSubmission | null>(null);
  const [gradedIds, setGradedIds] = useState<Set<string>>(new Set());

  const handleGradeSubmit = (id: string, score: number, feedback: string) => {
    setGradedIds(prev => new Set([...prev, id]));
    setGradingItem(null);
  };

  const displayItems = pendingSubmissions.filter(s => {
    const assessment = assessments.find(a => a.id === s.assessmentId);
    if (!assessment) return false;
    if (filter !== 'All' && assessment.trade !== filter) return false;
    if (assessmentFilter !== 'All' && assessment.id !== assessmentFilter) return false;
    return !gradedIds.has(s.id);
  });

  const remaining = pendingSubmissions.length - gradedIds.size;

  const assessmentsWithPending = assessments.filter(a =>
    pendingSubmissions.some(s => s.assessmentId === a.id)
  );

  return (
    <>
      {gradingItem && (
        <GradingModal
          submission={gradingItem}
          onClose={() => setGradingItem(null)}
          onSubmit={handleGradeSubmit}
        />
      )}

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Assessment Center</p>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Grading Queue</h1>
              {remaining > 0 && (
                <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                  {remaining} pending
                </span>
              )}
              {remaining === 0 && pendingSubmissions.length > 0 && (
                <span className="bg-green-100 text-green-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                  All graded!
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Review and score student submissions that require manual grading
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3.5 mb-6 flex items-start gap-3">
          <svg className="text-blue-500 shrink-0 mt-0.5" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <p className="text-sm text-blue-800">
            <strong>Short Answer and Mixed assessments</strong> require manual review. Auto-graded multiple choice sections are already scored — only the open-ended responses need your attention.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3">
          <select
            value={filter} onChange={e => setFilter(e.target.value as Filter)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-700"
          >
            <option>All</option>
            <option>Gas Engineering</option>
            <option>Electrical</option>
            <option>Plumbing</option>
          </select>

          <select
            value={assessmentFilter} onChange={e => setAssessmentFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-700"
          >
            <option value="All">All Assessments</option>
            {assessmentsWithPending.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>

        {/* Submissions List */}
        {displayItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="text-green-600" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">All caught up!</h3>
            <p className="text-gray-500 text-sm">No submissions pending grading for the current filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayItems.map(submission => {
              const assessment = assessments.find(a => a.id === submission.assessmentId)!;
              const tradeColors: Record<string, string> = {
                'Gas Engineering': 'bg-orange-100 text-orange-700',
                'Electrical': 'bg-yellow-100 text-yellow-700',
                'Plumbing': 'bg-blue-100 text-blue-700',
              };

              return (
                <div key={submission.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                        {submission.student.split(' ').map(n => n[0]).join('')}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{submission.student}</p>
                          <span className="text-gray-400">·</span>
                          <p className="text-sm text-gray-500">{submission.email}</p>
                        </div>
                        <p className="text-sm text-gray-700 font-medium mt-0.5">{assessment.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tradeColors[assessment.trade]}`}>
                            {assessment.trade}
                          </span>
                          <span className="text-xs text-gray-500">Submitted {submission.submittedAt}</span>
                          <span className="text-xs text-gray-500">Time taken: {submission.timeTaken}</span>
                          <span className="text-xs text-gray-500">
                            {submission.answers?.length ?? 0} document{(submission.answers?.length ?? 0) !== 1 ? 's' : ''} to review
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/assessment-center/assessments/${assessment.id}/results`}
                        className="text-xs font-medium text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Assessment
                      </Link>
                      <button
                        onClick={() => setGradingItem(submission)}
                        className="text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                        Grade
                      </button>
                    </div>
                  </div>

                  {/* Document preview */}
                  {submission.answers && submission.answers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 font-medium mb-2">Uploaded documents</p>
                      <p className="text-sm text-gray-600">
                        {submission.answers
                          .map(a => (a.type === 'file' ? a.fileName : a.answer))
                          .join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {displayItems.length > 0 && (
          <p className="text-xs text-gray-400 mt-4">
            Showing {displayItems.length} of {remaining} pending submissions
          </p>
        )}
      </div>
    </>
  );
}
