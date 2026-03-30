'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { getIqaChecks, getIqaTutors, getIqaCategories, updateIqaCheck, addFeedbackRecord } from '@/lib/iqa-data';
import { submissions, assessments, getStudentCohort, getExamDateForSubmission, getSubmissionVersionOptions } from '@/lib/mock-data';
import type { IqaCheckStatus, IqaOutcomeType, IqaReviewRound } from '@/lib/iqa-data';

const REVIEWER_NAME = 'Admin User';

interface AssessorFormQuestion {
  question: string;
  answer: string;
  type: 'text' | 'yesno' | 'choice';
}

interface AssessorForm {
  questions: AssessorFormQuestion[];
  evidenceNotes: string;
  overallComments: string;
  gradedAt: string;
}

function getMockAssessorForm(submissionId: string, isPassing: boolean, attemptNumber: number): AssessorForm {
  const seed = submissionId.charCodeAt(submissionId.length - 1);
  const isRevision = attemptNumber > 1;

  const questions: AssessorFormQuestion[] = [
    {
      question: 'Did the student demonstrate understanding of the core principles?',
      answer: isRevision
        ? (isPassing ? 'Yes — re-assessment confirms clear understanding. Previous concerns addressed.' : 'Partially — some areas improved from first attempt, but gaps remain.')
        : (isPassing ? 'Yes — student showed clear understanding throughout the practical assessment.' : 'Partially — some core areas need reinforcement.'),
      type: 'yesno',
    },
    {
      question: 'Were all safety protocols followed during the assessment?',
      answer: isRevision
        ? (seed % 2 === 0 ? 'Yes — all safety protocols observed on re-assessment.' : 'Yes — improved from prior attempt. All protocols now followed.')
        : (seed % 3 === 0 ? 'No — minor safety protocol deviation noted.' : 'Yes — all safety protocols were observed.'),
      type: 'yesno',
    },
    {
      question: 'Assessor notes on practical competency',
      answer: isRevision
        ? (isPassing
          ? 'Re-assessment shows improvement in key areas flagged during the first attempt. Student has addressed the feedback and now meets the required standard. Practical skills are adequate.'
          : 'Despite re-assessment, student still falls short in critical practical areas. Additional training recommended before next attempt.')
        : (isPassing
          ? 'Student completed all required tasks within the time limit. Work quality meets the industry standard. Tools and materials were used appropriately.'
          : 'Student struggled with several key tasks. Time management was poor and work quality was below the expected standard in at least two areas.'),
      type: 'text',
    },
    {
      question: 'Evidence portfolio completeness',
      answer: isRevision
        ? (isPassing ? 'Complete — updated portfolio addresses previous gaps' : 'Partially complete — some items updated but still missing key evidence')
        : (isPassing ? 'Complete' : 'Incomplete — missing items noted'),
      type: 'choice',
    },
    {
      question: isRevision ? 'Changes made since previous assessment' : 'Additional observations or concerns',
      answer: isRevision
        ? (isPassing
          ? 'Student revisited weak areas identified in IQA feedback. Documentation has been updated and practical work repeated under supervision.'
          : 'Student attempted to address feedback but key practical elements remain below standard. Recommend supervised workshop session before next attempt.')
        : (seed % 2 === 0
          ? 'No additional concerns. Student performed well overall.'
          : 'Student may benefit from additional supervised practice before working independently.'),
      type: 'text',
    },
    {
      question: 'Were documentation and records accurate and complete?',
      answer: isRevision
        ? (isPassing ? 'Yes — records updated and now complete.' : 'Partially — some records corrected but documentation still has gaps.')
        : (isPassing ? 'Yes — all records are complete and accurate.' : 'No — documentation was incomplete in several areas.'),
      type: 'yesno',
    },
    {
      question: 'Assessor recommendation',
      answer: isRevision
        ? (isPassing
          ? 'Following re-assessment, student is now competent. The revisions address all IQA concerns from the previous round.'
          : 'Further re-assessment needed. Student should complete additional supervised practice and resubmit evidence.')
        : (isPassing
          ? 'Student is competent and ready for the next stage of their qualification.'
          : 'Student should revisit key module sections before retaking this assessment.'),
      type: 'text',
    },
  ];

  const evidenceNotes = isRevision
    ? (isPassing
      ? 'Updated evidence portfolio received. All previously flagged gaps have been addressed. Work now demonstrates competency.'
      : 'Revised evidence submitted but several areas still require attention. Portfolio remains incomplete.')
    : (isPassing
      ? 'Student submitted all required evidence. Work demonstrates adequate understanding of core principles and practical application.'
      : 'Several areas require improvement. Evidence submitted is incomplete in parts.');

  const overallComments = isRevision
    ? (isPassing
      ? 'Re-assessment confirms competency. Previous IQA feedback has been fully addressed. Recommend approval.'
      : 'Re-assessment shows some improvement but does not yet meet the required standard. Further review needed.')
    : (isPassing
      ? 'Overall strong performance. Minor areas for development noted but core competency demonstrated.'
      : 'Significant gaps in knowledge and application. Decision requires IQA scrutiny.');

  const hours = 9 + (seed % 8) + (isRevision ? 2 : 0);
  const minutes = (seed * 7 + (isRevision ? 15 : 0)) % 60;
  const dateNum = 12 + (seed % 6) + (isRevision ? (attemptNumber * 2) : 0);
  const gradedAt = `${dateNum} Feb 2026, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return { questions, evidenceNotes, overallComments, gradedAt };
}

const outcomeLabels: Record<IqaOutcomeType, { label: string; badge: string }> = {
  'approved': { label: 'Approved', badge: 'bg-green-100 text-green-700' },
  'recheck-assessor': { label: 'Fail — Recheck by Assessor', badge: 'bg-amber-100 text-amber-700' },
  'return-module': { label: 'Fail — Return to Module', badge: 'bg-red-100 text-red-700' },
};

export default function IqaReviewDetailPage() {
  const params = useParams();
  const checkId = params.id as string;

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handler = () => setRefreshKey(k => k + 1);
    window.addEventListener('iqa-checks-updated', handler);
    return () => window.removeEventListener('iqa-checks-updated', handler);
  }, []);

  const check = useMemo(() => getIqaChecks().find(c => c.id === checkId), [checkId, refreshKey]);

  const [displaySubmissionId, setDisplaySubmissionId] = useState<string | null>(null);

  useEffect(() => {
    if (check) setDisplaySubmissionId(check.submissionId);
  }, [check?.id, check?.submissionId]);

  const submission = useMemo(() => {
    if (!check) return null;
    const sid = displaySubmissionId ?? check.submissionId;
    return submissions.find(s => s.id === sid) ?? null;
  }, [check, displaySubmissionId]);

  const assessment = submission ? assessments.find(a => a.id === submission.assessmentId) : null;
  const iqaTutors = getIqaTutors();
  const iqaCategories = getIqaCategories();
  const assessor = check ? iqaTutors.find(t => t.id === check.assessorId) : null;
  const category = assessor ? iqaCategories.find(c => c.id === assessor.categoryId) : null;
  const assignedReviewer = check?.assignedTo ? iqaTutors.find(t => t.id === check.assignedTo) : null;
  const cohort = submission ? getStudentCohort(submission.email) : undefined;
  const examDate = submission ? getExamDateForSubmission(submission.email, submission.assessmentId) : undefined;
  const submissionVersionOptions = check ? getSubmissionVersionOptions(check.submissionId) : [];

  const [feedback, setFeedback] = useState(check?.feedback ?? '');
  const [error, setError] = useState('');
  const [localStatus, setLocalStatus] = useState<IqaCheckStatus>(check?.status ?? 'Pending');
  const [localOutcome, setLocalOutcome] = useState<IqaOutcomeType | undefined>(check?.outcomeType);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);

  const reviewHistory: IqaReviewRound[] = useMemo(() => {
    if (!check) return [];
    return check.reviewHistory ?? [];
  }, [check]);

  const currentVersion = reviewHistory.length + 1;

  useEffect(() => {
    if (check) {
      setLocalStatus(check.status);
      setLocalOutcome(check.outcomeType);
    }
  }, [check]);

  if (!check || !submission || !assessment) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
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
  const isSkipped = localStatus === 'Skipped';
  const assessorForm = getMockAssessorForm(submission.id, isPassing, submission.attemptNumber);

  const pdfFile = submission.answers?.find(a => a.type === 'file');

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
    if (!feedback.trim()) { setError('Feedback is required when failing.'); return; }
    setError('');
    const ts = now();
    updateIqaCheck(check.id, {
      status: 'Rejected',
      outcomeType: 'recheck-assessor',
      reviewerName: REVIEWER_NAME,
      reviewedAt: ts,
      feedback,
    });
    addFeedbackRecord({
      assessorId: check.assessorId,
      studentName: submission.student,
      assessmentTitle: assessment.title,
      outcomeType: 'recheck-assessor',
      feedback,
      reviewerName: REVIEWER_NAME,
      reviewedAt: ts,
      read: false,
    });
    setLocalStatus('Rejected');
    setLocalOutcome('recheck-assessor');
    setSuccessMsg('Rejected — assessor has been notified to re-grade.');
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-5">
          <Link href="/iqa" className="text-gray-400 hover:text-gray-600 transition-colors">IQA</Link>
          <span className="text-gray-300">/</span>
          <Link href="/iqa/review-queue" className="text-gray-400 hover:text-gray-600 transition-colors">Review Queue</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium">{isPending ? 'Review' : 'Details'}</span>
        </nav>

        {/* Success banner */}
        {successMsg && (
          <div className="mb-5 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <svg className="text-green-600" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm text-green-800 font-medium flex-1">{successMsg}</p>
            <Link href="/iqa/review-queue" className="text-sm font-semibold text-green-700 hover:text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
              Back to Queue
            </Link>
          </div>
        )}

        {/* ── Header Card ── */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm mb-5">
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{assessment.module}</span>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">{assessment.title}</h1>
                  {submissionVersionOptions.length > 1 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                      {submissionVersionOptions.length} versions
                    </span>
                  )}
                </div>
                {submissionVersionOptions.length > 1 && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label htmlFor="iqa-submission-version" className="text-xs font-medium text-gray-500">Viewing version</label>
                    <div className="flex items-center gap-1">
                      {submissionVersionOptions.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setDisplaySubmissionId(opt.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                            submission.id === opt.id
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-5 pt-4 border-t border-gray-100">
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Student</p>
                <p className="text-sm font-semibold text-gray-900">{submission.student}</p>
                <p className="text-xs text-gray-500 truncate">{submission.email}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Cohort</p>
                <p className="text-sm font-medium text-gray-700">{cohort ?? '—'}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Assessor</p>
                <p className="text-sm font-semibold text-gray-900">{assessor?.name ?? 'Unknown'}</p>
                {category && <p className="text-xs text-gray-500">{category.name}</p>}
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Reviewer</p>
                <p className="text-sm font-semibold text-gray-900">{assignedReviewer?.name ?? 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Submitted</p>
                <p className="text-sm font-medium text-gray-700">{submission.submittedAt}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Exam date</p>
                <p className="text-sm font-medium text-gray-700">{examDate ?? '—'}</p>
              </div>
             
            </div>
          </div>
        </div>

        {submissionVersionOptions.length > 1 && submission.id !== check.submissionId && (
          <div className="mb-5 bg-purple-50 border border-purple-200 rounded-xl px-5 py-4 flex items-center gap-3">
            <svg className="text-purple-500 shrink-0" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-purple-900">
                Viewing Attempt {submission.attemptNumber} — the assessor form below reflects this version
              </p>
              <p className="text-xs text-purple-700 mt-0.5">
                Score: {submission.score}% &middot; Submitted: {submission.submittedAt} &middot; Status: {submission.status}
              </p>
            </div>
          </div>
        )}

        {isSkipped && (
          <div className="mb-5 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
            <p className="text-sm font-semibold text-gray-800">Skipped</p>
            <p className="text-xs text-gray-600 mt-1">
              This assessment was marked skipped when the cohort review was completed.
            </p>
            {check.feedback && (
              <p className="text-xs text-gray-500 mt-2 border-t border-gray-200 pt-2">{check.feedback}</p>
            )}
          </div>
        )}

        {/* ── Two-column layout: Form (scrollable) + Right sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* Left: Assessor Form (scrollable) */}
          <div className="lg:col-span-2 flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            {/* Form header */}
            <div className="bg-white rounded-t-2xl border border-b-0 border-gray-200/80 shadow-sm overflow-hidden shrink-0">
              <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-600" />
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-gray-900">Assessor Evaluation Form</h2>
                    {submission.attemptNumber > 1 && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                        Attempt {submission.attemptNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Completed by {assessor?.name ?? 'Unknown'} on {assessorForm.gradedAt}
                    {examDate && (
                      <span className="text-gray-300"> · Exam {examDate}</span>
                    )}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{assessorForm.questions.length} questions</span>
              </div>
            </div>

            {/* Scrollable questions */}
            <div className="flex-1 overflow-y-auto bg-white border-x border-gray-200/80 px-5 py-4 space-y-4 custom-scrollbar">
              {assessorForm.questions.map((q, i) => (
                <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-gray-400 mt-0.5">{i + 1}.</span>
                      <p className="text-sm font-medium text-gray-900">{q.question}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    {q.type === 'yesno' ? (
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          q.answer.startsWith('Yes') ? 'bg-green-500' : 'bg-amber-500'
                        }`}>
                          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                            {q.answer.startsWith('Yes')
                              ? <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            }
                          </svg>
                        </div>
                        <p className={`text-sm ${q.answer.startsWith('Yes') ? 'text-green-800' : 'text-amber-800'}`}>{q.answer}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Evidence + Overall at the bottom of scrollable area */}
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Evidence Notes</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-700 leading-relaxed">{assessorForm.evidenceNotes}</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Comments</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-700 leading-relaxed">{assessorForm.overallComments}</p>
                </div>
              </div>
            </div>

            {/* Form footer */}
            <div className="bg-white rounded-b-2xl border border-t-0 border-gray-200/80 shadow-sm shrink-0">
              <div className="h-px bg-gray-100" />
            </div>
          </div>

          {/* Right sidebar: PDF + Version History + Actions */}
          <div className="lg:col-span-1 space-y-5">

            {/* View PDF */}
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
                <p className="text-xs text-gray-400">No submission file</p>
              </div>
            )}

            {/* Version History */}
            {reviewHistory.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Review History</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {reviewHistory.map((round) => (
                    <div key={round.version}>
                      <button
                        onClick={() => setSelectedVersion(selectedVersion === round.version ? null : round.version)}
                        className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors text-left"
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white ${
                          round.outcome === 'approved' ? 'bg-green-500' : 'bg-amber-500'
                        }`}>
                          {round.version}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900">{round.reviewerName}</p>
                          <p className="text-[10px] text-gray-400">{round.reviewedAt}</p>
                        </div>
                        <svg
                          width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          className={`text-gray-300 transition-transform ${selectedVersion === round.version ? 'rotate-180' : ''}`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                      {selectedVersion === round.version && (
                        <div className="px-5 pb-3">
                          <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${outcomeLabels[round.outcome].badge}`}>
                              {outcomeLabels[round.outcome].label}
                            </span>
                            <p className="text-xs text-gray-700 leading-relaxed mt-2">{round.feedback}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Current round */}
                  <div className="px-5 py-3 flex items-center gap-3 bg-blue-50/40">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white bg-blue-500 ring-2 ring-blue-200">
                      {currentVersion}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-900">Current Review</p>
                      <p className="text-[10px] text-blue-500">{isPending ? 'Awaiting decision' : `Reviewed by ${check.reviewerName}`}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Already reviewed outcome */}
            {!isPending && !isSkipped && localOutcome && (
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className={`h-1 ${localOutcome === 'approved' ? 'bg-green-500' : 'bg-amber-500'}`} />
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${outcomeLabels[localOutcome].badge}`}>
                      {outcomeLabels[localOutcome].label}
                    </span>
                  </div>
                  {check.reviewerName && <p className="text-xs text-gray-500 mb-1">by {check.reviewerName} · {check.reviewedAt}</p>}
                  {check.feedback && (
                    <div className={`rounded-lg p-3 border mt-2 ${
                      localOutcome === 'approved' ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'
                    }`}>
                      <p className={`text-xs leading-relaxed ${localOutcome === 'approved' ? 'text-green-800' : 'text-amber-800'}`}>
                        {check.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Review Actions */}
            {isPending && !isSkipped && (
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="px-5 py-4">
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Your Decision</h3>

                  <textarea
                    value={feedback}
                    onChange={e => { setFeedback(e.target.value); setError(''); }}
                    rows={3}
                    placeholder="Add feedback for the assessor..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none bg-gray-50/50 placeholder:text-gray-400 transition-all mb-3"
                  />
                  {error && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleFailRecheck}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors shadow-sm"
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      Recheck
                    </button>
                    <button
                      onClick={handleApprove}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors shadow-sm"
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      Approve
                    </button>
                  </div>

                  <Link
                    href="/iqa/review-queue"
                    className="block text-center text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors"
                  >
                    Cancel and go back
                  </Link>
                </div>
              </div>
            )}

            {/* Back button when not pending */}
            {!isPending && (
              <Link
                href="/iqa/review-queue"
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
