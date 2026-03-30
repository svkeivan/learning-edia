'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { getIqaChecks, getIqaTutors } from '@/lib/iqa-data';
import { submissions, assessments, cohorts, getExamDateForSubmission, getStudentCohort } from '@/lib/mock-data';
import type { IqaCheck } from '@/lib/iqa-data';
import type { AnswerItem } from '@/lib/mock-data';

interface FormQuestion {
  question: string;
  type: 'text' | 'yesno' | 'choice';
  placeholder: string;
  options?: string[];
}

const FORM_QUESTIONS: FormQuestion[] = [
  {
    question: 'Did the student demonstrate understanding of the core principles?',
    type: 'yesno',
    placeholder: 'Select your assessment...',
  },
  {
    question: 'Were all safety protocols followed during the assessment?',
    type: 'yesno',
    placeholder: 'Select your assessment...',
  },
  {
    question: 'Assessor notes on practical competency',
    type: 'text',
    placeholder: 'Describe the student\'s practical competency, including strengths and areas for improvement...',
  },
  {
    question: 'Evidence portfolio completeness',
    type: 'choice',
    placeholder: 'Select...',
    options: ['Complete', 'Partially complete', 'Incomplete'],
  },
  {
    question: 'Additional observations or concerns',
    type: 'text',
    placeholder: 'Note any additional observations, concerns, or recommendations...',
  },
  {
    question: 'Were documentation and records accurate and complete?',
    type: 'yesno',
    placeholder: 'Select your assessment...',
  },
  {
    question: 'Assessor recommendation',
    type: 'text',
    placeholder: 'Provide your overall recommendation for the student...',
  },
];

function getMockPrefill(submissionId: string, isPassing: boolean): Record<number, string> {
  const seed = submissionId.charCodeAt(submissionId.length - 1);
  return {
    0: isPassing ? 'Yes — student showed clear understanding throughout.' : 'Partially — some core areas need reinforcement.',
    1: seed % 3 === 0 ? 'No — minor safety protocol deviation noted.' : 'Yes — all safety protocols were observed.',
    2: isPassing
      ? 'Student completed all required tasks within the time limit. Work quality meets the industry standard. Tools and materials were used appropriately.'
      : 'Student struggled with several key tasks. Time management was poor and work quality was below the expected standard in at least two areas.',
    3: isPassing ? 'Complete' : 'Partially complete',
    4: seed % 2 === 0 ? 'No additional concerns. Student performed well overall.' : 'Student may benefit from additional supervised practice before working independently.',
    5: isPassing ? 'Yes — all records are complete and accurate.' : 'No — documentation was incomplete in several areas.',
    6: isPassing
      ? 'Student is competent and ready for the next stage of their qualification.'
      : 'Student should revisit key module sections before retaking this assessment.',
  };
}

export default function AssessorGradingPage() {
  const params = useParams();
  const submissionId = params.submissionId as string;

  const submission = submissions.find(s => s.id === submissionId);
  const assessment = submission ? assessments.find(a => a.id === submission.assessmentId) : null;
  const cohort = useMemo(() => {
    if (!submission) return null;
    return cohorts.find(c =>
      c.students.some(s => s.email === submission.email) && c.examIds.includes(submission.assessmentId),
    ) ?? null;
  }, [submission]);
  const examDate = submission ? getExamDateForSubmission(submission.email, submission.assessmentId) : undefined;
  const studentCohort = submission ? getStudentCohort(submission.email) : undefined;

  const [checks, setChecks] = useState<IqaCheck[]>([]);
  useEffect(() => {
    const refresh = () => setChecks(getIqaChecks());
    refresh();
    window.addEventListener('iqa-checks-updated', refresh);
    return () => window.removeEventListener('iqa-checks-updated', refresh);
  }, []);

  const rejectedCheck = useMemo(() => {
    return checks.find(c => c.submissionId === submissionId && c.status === 'Rejected') ?? null;
  }, [checks, submissionId]);

  const isRejectedItem = !!rejectedCheck;

  const [formAnswers, setFormAnswers] = useState<Record<number, string>>({});
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [overallComments, setOverallComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [decision, setDecision] = useState<'pass' | 'fail' | 'fail-module' | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);

  useEffect(() => {
    if (rejectedCheck && submission) {
      const pf = getMockPrefill(submissionId, false);
      setFormAnswers(pf);
      setEvidenceNotes('Several areas require improvement based on IQA feedback.');
      setOverallComments('Re-assessment needed — address IQA feedback and resubmit.');
    }
  }, [rejectedCheck?.id, submissionId, submission]);

  if (!submission || !assessment) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <h3 className="text-gray-900 font-semibold mb-1">Submission not found</h3>
          <Link href="/assessment-center/assessor-queue" className="text-orange-600 hover:underline text-sm mt-2 inline-block">
            Back to Assessor Queue
          </Link>
        </div>
      </div>
    );
  }

  const pdfFile = submission.answers?.find((a): a is Extract<AnswerItem, { type: 'file' }> => a.type === 'file');

  const handleSubmit = (type: 'pass' | 'fail' | 'fail-module') => {
    setDecision(type);
    setSubmitted(true);
  };

  const decisionLabels: Record<string, { label: string; style: string }> = {
    pass: { label: 'Passed — Assessment Approved', style: 'bg-green-50 border-green-200 text-green-800' },
    fail: { label: 'Failed — Sent for Re-examination', style: 'bg-amber-50 border-amber-200 text-amber-800' },
    'fail-module': { label: 'Failed — Returned to Module', style: 'bg-red-50 border-red-200 text-red-800' },
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-5">
          <Link href="/assessment-center/assessor-queue" className="text-gray-400 hover:text-gray-600 transition-colors">Assessor Queue</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium">Grade Submission</span>
        </nav>

        {/* Success banner */}
        {submitted && decision && (
          <div className={`mb-5 rounded-xl px-5 py-4 flex items-center gap-3 shadow-sm border ${decisionLabels[decision].style}`}>
            <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center shrink-0">
              <svg className="text-current" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-medium flex-1">{decisionLabels[decision].label}</p>
            <Link href="/assessment-center/assessor-queue" className="text-sm font-semibold hover:underline px-3 py-1.5 rounded-lg transition-colors">
              Back to Queue
            </Link>
          </div>
        )}

        {/* IQA Rejection banner */}
        {rejectedCheck && !submitted && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <div className="flex gap-3">
              <svg className="text-red-500 shrink-0 mt-0.5" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-red-900 mb-1">IQA Review Rejected</h4>
                <p className="text-sm text-red-800">{rejectedCheck.feedback ?? 'No feedback provided.'}</p>
                <p className="text-xs text-red-600 mt-1.5">
                  Rejected by {rejectedCheck.reviewerName ?? 'Unknown'} on {rejectedCheck.reviewedAt}
                </p>
                <p className="text-xs text-red-600 mt-1">Edit the form below and resubmit your assessment.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm mb-5">
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{assessment.module}</span>
              {rejectedCheck && !submitted && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-700">Needs Re-grading</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{assessment.title}</h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-5 pt-4 border-t border-gray-100">
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Student</p>
                <p className="text-sm font-semibold text-gray-900">{submission.student}</p>
                <p className="text-xs text-gray-500 truncate">{submission.email}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Cohort</p>
                <p className="text-sm font-medium text-gray-700">{studentCohort ?? cohort?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Exam Date</p>
                <p className="text-sm font-medium text-gray-700">{examDate ?? '—'}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Submitted</p>
                <p className="text-sm font-medium text-gray-700">{submission.submittedAt}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Status</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  Pending Review
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* Left: Assessment Form */}
          <div className="lg:col-span-2 flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            <div className="bg-white rounded-t-2xl border border-b-0 border-gray-200/80 shadow-sm overflow-hidden shrink-0">
              <div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-500" />
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Assessment Form</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {rejectedCheck ? 'Edit and resubmit your assessment below.' : 'Fill out the form based on the student\'s submission.'}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{FORM_QUESTIONS.length} questions</span>
              </div>
            </div>

            {/* Scrollable form content */}
            <div className="flex-1 overflow-y-auto bg-white border-x border-gray-200/80 px-5 py-4 space-y-4 custom-scrollbar">
              {FORM_QUESTIONS.map((q, i) => (
                <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-gray-400 mt-0.5">{i + 1}.</span>
                      <p className="text-sm font-medium text-gray-900">{q.question}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    {q.type === 'yesno' ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {['Yes', 'Partially', 'No'].map(opt => (
                            <button
                              key={opt}
                              disabled={submitted}
                              onClick={() => {
                                const current = formAnswers[i] ?? '';
                                const base = current.includes(' — ') ? current.split(' — ').slice(1).join(' — ') : '';
                                setFormAnswers(prev => ({ ...prev, [i]: base ? `${opt} — ${base}` : opt }));
                              }}
                              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                                (formAnswers[i] ?? '').startsWith(opt)
                                  ? opt === 'Yes' ? 'bg-green-600 text-white border-green-600'
                                    : opt === 'No' ? 'bg-red-500 text-white border-red-500'
                                      : 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                              } ${submitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          disabled={submitted}
                          value={(formAnswers[i] ?? '').includes(' — ') ? (formAnswers[i] ?? '').split(' — ').slice(1).join(' — ') : ''}
                          onChange={e => {
                            const base = (formAnswers[i] ?? '').split(' — ')[0] || '';
                            setFormAnswers(prev => ({ ...prev, [i]: e.target.value ? `${base} — ${e.target.value}` : base }));
                          }}
                          placeholder="Add notes..."
                          className={`w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200 ${submitted ? 'opacity-60' : ''}`}
                        />
                      </div>
                    ) : q.type === 'choice' ? (
                      <select
                        disabled={submitted}
                        value={formAnswers[i] ?? ''}
                        onChange={e => setFormAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                        className={`w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white ${submitted ? 'opacity-60' : ''}`}
                      >
                        <option value="">{q.placeholder}</option>
                        {q.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <textarea
                        disabled={submitted}
                        value={formAnswers[i] ?? ''}
                        onChange={e => setFormAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                        rows={3}
                        placeholder={q.placeholder}
                        className={`w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none ${submitted ? 'opacity-60' : ''}`}
                      />
                    )}
                  </div>
                </div>
              ))}

              {/* Evidence Notes */}
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Evidence Notes</p>
                </div>
                <div className="px-4 py-3">
                  <textarea
                    disabled={submitted}
                    value={evidenceNotes}
                    onChange={e => setEvidenceNotes(e.target.value)}
                    rows={3}
                    placeholder="Notes on the student's evidence portfolio..."
                    className={`w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none ${submitted ? 'opacity-60' : ''}`}
                  />
                </div>
              </div>

              {/* Overall Comments */}
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Comments</p>
                </div>
                <div className="px-4 py-3">
                  <textarea
                    disabled={submitted}
                    value={overallComments}
                    onChange={e => setOverallComments(e.target.value)}
                    rows={3}
                    placeholder="Your overall assessment comments..."
                    className={`w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none ${submitted ? 'opacity-60' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* Form footer */}
            <div className="bg-white rounded-b-2xl border border-t-0 border-gray-200/80 shadow-sm shrink-0">
              <div className="h-px bg-gray-100" />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-1 space-y-5">

            {/* Student submission PDF */}
            {pdfFile ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="px-5 py-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Student Submission</p>
                  <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-red-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 0 0-.293-.707l-5.414-5.414A1 1 0 0 0 12.586 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{pdfFile.fileName}</p>
                        <p className="text-xs text-gray-500">{pdfFile.fileType}{pdfFile.size && ` · ${pdfFile.size}`}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPdfOpen(!pdfOpen)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      {pdfOpen ? 'Hide Preview' : 'View PDF'}
                    </button>
                  </div>
                  {pdfOpen && (
                    <div className="mt-3 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-800 text-white text-xs px-3 py-2 flex items-center justify-between">
                        <span className="truncate">{pdfFile.fileName}</span>
                        <span className="text-gray-400 shrink-0 ml-2">{pdfFile.size}</span>
                      </div>
                      <div className="h-64 flex items-center justify-center bg-white">
                        <div className="text-center">
                          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="mx-auto text-gray-300 mb-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 0 0-.293-.707l-5.414-5.414A1 1 0 0 0 12.586 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
                          </svg>
                          <p className="text-xs text-gray-400">PDF preview placeholder</p>
                          <p className="text-[10px] text-gray-300 mt-1">Full viewer will render the actual document</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm px-5 py-6 text-center">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="mx-auto text-gray-300 mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9.75m3 0H9.75m0 0H9m0 0H7.5" />
                </svg>
                <p className="text-xs text-gray-400">No submission file attached</p>
              </div>
            )}

            {/* Assessment Decision */}
            {!submitted && (
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                <div className="px-5 py-4">
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-1">Your Decision</h3>
                  <p className="text-xs text-gray-400 mb-4">
                    {rejectedCheck ? 'Resubmit your assessment after making corrections.' : 'Choose the assessment outcome for this student.'}
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleSubmit('pass')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors shadow-sm"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      Pass
                    </button>
                    <button
                      onClick={() => handleSubmit('fail')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors shadow-sm"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                    <button
                      onClick={() => handleSubmit('fail-module')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shadow-sm"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                      </svg>
                      Reject &amp; Return to Module
                    </button>
                  </div>
                  <Link
                    href="/assessment-center/assessor-queue"
                    className="block text-center text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors"
                  >
                    Cancel and go back
                  </Link>
                </div>
              </div>
            )}

            {/* Back button after submission */}
            {submitted && (
              <Link
                href="/assessment-center/assessor-queue"
                className="block w-full text-center px-5 py-2.5 text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors shadow-sm"
              >
                Back to Queue
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
