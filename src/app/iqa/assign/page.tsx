'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  getIqaChecks,
  getIqaTutors,
  getIqaCategories,
  getSkippedSubmissionIds,
  getCohortIqaReviewerOverride,
} from '@/lib/iqa-data';
import { submissions, assessments, getStudentPackage, getStudentCohort, findCohortForSubmission, parseSubmitDate } from '@/lib/mock-data';

import { FiltersBar } from './_components/FiltersBar';
import { AssignTable } from './_components/AssignTable';

import type { Tab, SortKey, EnrichedSubmission, IqaCheck, IqaTutor, IqaCategory } from './types';
import { PAGE_SIZE } from './types';
import type { StudentSubmission } from '@/lib/mock-data';

export default function IqaAssignPage() {
  // ── Data ─────────────────────────────────────────────────────────────────
  const [checks, setChecks] = useState<IqaCheck[]>([]);
  const [tutors, setTutors] = useState<IqaTutor[]>([]);
  const [categories, setCategories] = useState<IqaCategory[]>([]);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [cohortReviewerBump, setCohortReviewerBump] = useState(0);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>('all');
  const [allPage, setAllPage] = useState(1);

  // Filters
  const [filterStudent, setFilterStudent] = useState('');
  const [filterAssessor, setFilterAssessor] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTrade, setFilterTrade] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterReviewer, setFilterReviewer] = useState('');
  const [filterCohort, setFilterCohort] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  const refresh = useCallback(() => {
    setChecks(getIqaChecks());
    setTutors(getIqaTutors());
    setCategories(getIqaCategories());
    setSkipped(getSkippedSubmissionIds());
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();
    const handler = () => refresh();
    window.addEventListener('iqa-checks-updated', handler);
    window.addEventListener('iqa-tutors-updated', handler);
    window.addEventListener('iqa-categories-updated', handler);
    const onCohortReviewer = () => setCohortReviewerBump(b => b + 1);
    window.addEventListener('iqa-cohort-reviewer-override-updated', onCohortReviewer);
    return () => {
      window.removeEventListener('iqa-checks-updated', handler);
      window.removeEventListener('iqa-tutors-updated', handler);
      window.removeEventListener('iqa-categories-updated', handler);
      window.removeEventListener('iqa-cohort-reviewer-override-updated', onCohortReviewer);
    };
  }, [refresh]);

  // ── Derived data ─────────────────────────────────────────────────────────
  const gradedSubmissions = useMemo(
    () => submissions.filter(s => s.gradedBy && s.score !== null),
    [],
  );

  const enrich = useCallback(
    (sub: StudentSubmission): EnrichedSubmission => {
      const assessment = assessments.find(a => a.id === sub.assessmentId);
      const assessor = tutors.find(t => t.id === sub.gradedBy);
      const check = checks.find(c => c.submissionId === sub.id);
      const cohortObj = findCohortForSubmission(sub.email, sub.assessmentId);
      const leadId = cohortObj ? (getCohortIqaReviewerOverride(cohortObj.id) ?? cohortObj.iqaReviewerId) : undefined;
      const assignedReviewer = leadId ? tutors.find(t => t.id === leadId) : undefined;
      const category = assessor ? categories.find(c => c.id === assessor.categoryId) : undefined;
      const isSkipped = skipped.has(sub.id);
      const cohort = cohortObj?.name ?? getStudentCohort(sub.email);
      return { submission: sub, assessment, assessor, check, assignedReviewer, category, isSkipped, cohort };
    },
    [checks, tutors, categories, skipped],
  );

  const allItems = useMemo(() => gradedSubmissions.map(enrich), [gradedSubmissions, enrich, cohortReviewerBump]);

  const submissionIdsWithCheck = useMemo(
    () => new Set(checks.map(c => c.submissionId)),
    [checks],
  );

  const inQueueItems = useMemo(
    () => allItems.filter(i => i.check && i.check.status === 'Pending' && !i.check.assignedTo),
    [allItems],
  );

  const notInQueueItems = useMemo(
    () => gradedSubmissions.filter(s => !submissionIdsWithCheck.has(s.id) && !skipped.has(s.id)).map(enrich),
    [gradedSubmissions, submissionIdsWithCheck, skipped, enrich],
  );

  const currentItems = tab === 'all' ? allItems : tab === 'queue' ? inQueueItems : notInQueueItems;

  const filteredItems = useMemo(() => {
    const q = filterStudent.toLowerCase();
    let list = currentItems.filter(item => {
      if (filterAssessor && item.assessor?.id !== filterAssessor) return false;
      if (filterCategory && item.category?.id !== filterCategory) return false;
      if (filterTrade && item.assessment?.trade !== filterTrade) return false;
      if (filterExam && item.assessment?.id !== filterExam) return false;
      if (filterReviewer && item.assignedReviewer?.id !== filterReviewer) return false;
      if (filterCohort && item.cohort !== filterCohort) return false;
      if (filterDateFrom || filterDateTo) {
        const d = parseSubmitDate(item.submission.submittedAt);
        if (!d) return false;
        if (filterDateFrom && d < new Date(filterDateFrom)) return false;
        if (filterDateTo && d > new Date(filterDateTo + 'T23:59:59')) return false;
      }
      if (tab === 'queue' && filterStatus && item.check?.status !== filterStatus) return false;
      if (tab === 'all' && filterStatus) {
        const displayStatus = item.check ? item.check.status : item.isSkipped ? 'Skipped' : 'None';
        if (filterStatus !== displayStatus) return false;
      }
      if (q && !item.submission.student.toLowerCase().includes(q) && !item.submission.email.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sortKey) {
      list = [...list].sort((a, b) => {
        let va = '', vb = '';
        if (sortKey === 'student') { va = a.submission.student; vb = b.submission.student; }
        else if (sortKey === 'package') { va = getStudentPackage(a.submission.email) ?? ''; vb = getStudentPackage(b.submission.email) ?? ''; }
        else if (sortKey === 'assessment') { va = a.assessment?.title ?? ''; vb = b.assessment?.title ?? ''; }
        else if (sortKey === 'result') { va = a.submission.status ?? ''; vb = b.submission.status ?? ''; }
        else if (sortKey === 'assessor') { va = a.assessor?.name ?? ''; vb = b.assessor?.name ?? ''; }
        else if (sortKey === 'reviewer') { va = a.assignedReviewer?.name ?? ''; vb = b.assignedReviewer?.name ?? ''; }
        else if (sortKey === 'cohort') { va = a.cohort ?? ''; vb = b.cohort ?? ''; }
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return list;
  }, [currentItems, filterAssessor, filterCategory, filterTrade, filterExam, filterStatus, filterStudent, filterReviewer, filterCohort, filterDateFrom, filterDateTo, tab, sortKey, sortDir]);

  const uniqueAssessors = useMemo(() => {
    const ids = new Set(currentItems.map(i => i.assessor?.id).filter(Boolean));
    return tutors.filter(t => ids.has(t.id));
  }, [currentItems, tutors]);

  const uniqueCategories = useMemo(() => {
    const ids = new Set(currentItems.map(i => i.category?.id).filter(Boolean));
    return categories.filter(c => ids.has(c.id));
  }, [currentItems, categories]);

  const uniqueExams = useMemo(() => {
    const ids = new Set(currentItems.map(i => i.assessment?.id).filter(Boolean));
    return assessments.filter(a => ids.has(a.id));
  }, [currentItems]);

  const uniqueReviewers = useMemo(() => {
    const ids = new Set(currentItems.map(i => i.assignedReviewer?.id).filter(Boolean));
    return tutors.filter(t => ids.has(t.id));
  }, [currentItems, tutors]);

  const uniqueCohorts = useMemo(() => {
    const set = new Set(currentItems.map(i => i.cohort).filter(Boolean) as string[]);
    return [...set].sort();
  }, [currentItems]);

  const totalAllPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const displayItems = tab === 'all'
    ? filteredItems.slice((allPage - 1) * PAGE_SIZE, allPage * PAGE_SIZE)
    : filteredItems;

  useEffect(() => { setAllPage(1); }, [filterAssessor, filterCategory, filterTrade, filterExam, filterStudent, filterReviewer, filterCohort, filterDateFrom, filterDateTo, tab]);

  // ── Filters helpers ───────────────────────────────────────────────────────
  const hasActiveFilters = !!(filterAssessor || filterCategory || filterTrade || filterExam || filterStatus || filterStudent || filterReviewer || filterCohort || filterDateFrom || filterDateTo);

  const clearFilters = () => {
    setFilterAssessor('');
    setFilterCategory('');
    setFilterTrade('');
    setFilterExam('');
    setFilterStatus('');
    setFilterStudent('');
    setFilterReviewer('');
    setFilterCohort('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const handleExportCsv = () => {
    const headers = ['Student', 'Email', 'Course Package', 'Assessment', 'Cohort', 'Assessor', 'Result', 'Submitted At'];
    if (tab === 'all') headers.push('Reviewer', 'IQA Status');
    const rows = filteredItems.map(item => {
      const row = [
        item.submission.student,
        item.submission.email,
        getStudentPackage(item.submission.email) ?? '',
        item.assessment?.title ?? '',
        item.cohort ?? '',
        item.assessor?.name ?? '',
        item.submission.status === 'Pass' ? 'Pass' : 'Fail',
        item.submission.submittedAt,
      ];
      if (tab === 'all') {
        row.push(item.assignedReviewer?.name ?? '');
        row.push(item.check ? item.check.status : item.isSkipped ? 'Skipped' : '');
      }
      return row;
    });
    const csvContent = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iqa-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSortClick = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-12 w-full bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <div className="mb-5">
        <Link href="/iqa" className="text-sm text-gray-500 hover:text-gray-700">IQA</Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-sm text-gray-900 font-medium">Assessment Status</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">IQA</p>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Status</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of assessment queue assignments and IQA statuses.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/iqa/categories" className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50">
            Categories
          </Link>
          <Link href="/iqa/review-queue" className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50">
            Audit
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-5 w-fit">
        {([
          { key: 'all' as Tab, label: 'All', count: allItems.length },
          { key: 'queue' as Tab, label: 'In Queue', count: inQueueItems.length },
          { key: 'not-queue' as Tab, label: 'Not in Queue', count: notInQueueItems.length },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
            <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab description */}
      {tab === 'all' && <p className="text-xs text-gray-500 mb-4">All graded assessments with IQA status, reviewer, and cohort information.</p>}
      {tab === 'queue' && <p className="text-xs text-gray-500 mb-4">Assessments currently in the IQA audit queue.</p>}
      {tab === 'not-queue' && <p className="text-xs text-gray-500 mb-4">Graded assessments not yet queued for IQA audit.</p>}

      {/* Filters */}
      <FiltersBar
        tab={tab}
        filterStudent={filterStudent}
        filterAssessor={filterAssessor}
        filterCategory={filterCategory}
        filterTrade={filterTrade}
        filterExam={filterExam}
        filterStatus={filterStatus}
        filterReviewer={filterReviewer}
        filterCohort={filterCohort}
        filterDateFrom={filterDateFrom}
        filterDateTo={filterDateTo}
        uniqueAssessors={uniqueAssessors}
        uniqueCategories={uniqueCategories}
        uniqueExams={uniqueExams}
        uniqueReviewers={uniqueReviewers}
        uniqueCohorts={uniqueCohorts}
        filteredCount={filteredItems.length}
        totalCount={currentItems.length}
        hasActiveFilters={hasActiveFilters}
        onStudentChange={setFilterStudent}
        onAssessorChange={setFilterAssessor}
        onCategoryChange={setFilterCategory}
        onTradeChange={setFilterTrade}
        onExamChange={setFilterExam}
        onStatusChange={setFilterStatus}
        onReviewerChange={setFilterReviewer}
        onCohortChange={setFilterCohort}
        onDateFromChange={setFilterDateFrom}
        onDateToChange={setFilterDateTo}
        onClearFilters={clearFilters}
        onExport={handleExportCsv}
      />

      {/* Main table */}
      <AssignTable
        tab={tab}
        displayItems={displayItems}
        selected={new Set()}
        allSelected={false}
        sortKey={sortKey}
        sortDir={sortDir}
        allPage={allPage}
        totalAllPages={totalAllPages}
        filteredCount={filteredItems.length}
        hasActiveFilters={hasActiveFilters}
        tutors={tutors}
        readOnly
        onToggleAll={() => {}}
        onToggleOne={() => {}}
        onSortClick={handleSortClick}
        onPageChange={setAllPage}
        onClearFilters={clearFilters}
        onSwitchTab={setTab}
        onAddToQueue={() => {}}
        onSkip={() => {}}
        onRequestAssign={() => {}}
      />

      {/* Skipped counter (All tab) */}
      {tab === 'all' && skipped.size > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          {skipped.size} assessment{skipped.size !== 1 ? 's' : ''} skipped from IQA queue.
        </p>
      )}
    </div>
  );
}
