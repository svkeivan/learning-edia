'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  getIqaChecks,
  getIqaTutors,
  getIqaCategories,
  getReviewerWorkloads,
  getSkippedSubmissionIds,
  skipSubmissions,
  unskipSubmission,
  autoAssignReviewer,
  addIqaCheck,
  updateIqaCheck,
  removeIqaCheck,
} from '@/lib/iqa-data';
import { submissions, assessments, getStudentPackage } from '@/lib/mock-data';

import { WorkloadPanel } from './_components/WorkloadPanel';
import { CoveragePanel } from './_components/CoveragePanel';
import { FiltersBar } from './_components/FiltersBar';
import { BulkActionsBar } from './_components/BulkActionsBar';
import { AssignTable } from './_components/AssignTable';
import { IqaHistoryModal } from './_components/IqaHistoryModal';
import { ConfirmDialog } from './_components/ConfirmDialog';

import type { Tab, SortKey, EnrichedSubmission, IqaCheck, IqaTutor, IqaCategory, ReviewerWorkload } from './types';
import { PAGE_SIZE } from './types';
import type { StudentSubmission } from '@/lib/mock-data';

export default function IqaAssignPage() {
  // ── Data ─────────────────────────────────────────────────────────────────
  const [checks, setChecks] = useState<IqaCheck[]>([]);
  const [tutors, setTutors] = useState<IqaTutor[]>([]);
  const [categories, setCategories] = useState<IqaCategory[]>([]);
  const [workloads, setWorkloads] = useState<ReviewerWorkload[]>([]);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>('not-queue');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  const [allPage, setAllPage] = useState(1);
  const [workloadCollapsed, setWorkloadCollapsed] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [confirmBulkAction, setConfirmBulkAction] = useState<'exclude' | 'unassign' | null>(null);

  // Bulk assign
  const [bulkAssignTutor, setBulkAssignTutor] = useState('');
  const [showBulkAssign, setShowBulkAssign] = useState(false);

  // Filters
  const [filterStudent, setFilterStudent] = useState('');
  const [filterAssessor, setFilterAssessor] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTrade, setFilterTrade] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  const refresh = useCallback(() => {
    setChecks(getIqaChecks());
    setTutors(getIqaTutors());
    setCategories(getIqaCategories());
    setWorkloads(getReviewerWorkloads());
    setSkipped(getSkippedSubmissionIds());
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();
    const handler = () => refresh();
    window.addEventListener('iqa-checks-updated', handler);
    window.addEventListener('iqa-tutors-updated', handler);
    window.addEventListener('iqa-categories-updated', handler);
    return () => {
      window.removeEventListener('iqa-checks-updated', handler);
      window.removeEventListener('iqa-tutors-updated', handler);
      window.removeEventListener('iqa-categories-updated', handler);
    };
  }, [refresh]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Reset selection + modals when tab changes
  useEffect(() => {
    setSelected(new Set());
    setShowBulkAssign(false);
    setShowHistoryModal(false);
  }, [tab]);

  // ── Derived data ─────────────────────────────────────────────────────────
  const gradedSubmissions = useMemo(
    () => submissions.filter(s => s.gradedBy && s.score !== null),
    [],
  );

  const submissionIdsInQueue = useMemo(
    () => new Set(checks.map(c => c.submissionId)),
    [checks],
  );

  const enrich = useCallback(
    (sub: StudentSubmission): EnrichedSubmission => {
      const assessment = assessments.find(a => a.id === sub.assessmentId);
      const assessor = tutors.find(t => t.id === sub.gradedBy);
      const check = checks.find(c => c.submissionId === sub.id);
      const assignedReviewer = check?.assignedTo ? tutors.find(t => t.id === check.assignedTo) : undefined;
      const category = assessor ? categories.find(c => c.id === assessor.categoryId) : undefined;
      const isSkipped = skipped.has(sub.id);
      return { submission: sub, assessment, assessor, check, assignedReviewer, category, isSkipped };
    },
    [checks, tutors, categories, skipped],
  );

  const allItems = useMemo(() => gradedSubmissions.map(enrich), [gradedSubmissions, enrich]);

  const inQueueItems = useMemo(
    () => gradedSubmissions.filter(s => submissionIdsInQueue.has(s.id)).map(enrich),
    [gradedSubmissions, submissionIdsInQueue, enrich],
  );

  const notInQueueItems = useMemo(
    () => gradedSubmissions.filter(s => !submissionIdsInQueue.has(s.id) && !skipped.has(s.id)).map(enrich),
    [gradedSubmissions, submissionIdsInQueue, skipped, enrich],
  );

  const currentItems = tab === 'all' ? allItems : tab === 'queue' ? inQueueItems : notInQueueItems;

  const filteredItems = useMemo(() => {
    const q = filterStudent.toLowerCase();
    let list = currentItems.filter(item => {
      if (filterAssessor && item.assessor?.id !== filterAssessor) return false;
      if (filterCategory && item.category?.id !== filterCategory) return false;
      if (filterTrade && item.assessment?.trade !== filterTrade) return false;
      if (filterExam && item.assessment?.id !== filterExam) return false;
      if (tab === 'queue' && filterStatus && item.check?.status !== filterStatus) return false;
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
        else if (sortKey === 'gradedBy') { va = a.assessor?.name ?? ''; vb = b.assessor?.name ?? ''; }
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return list;
  }, [currentItems, filterAssessor, filterCategory, filterTrade, filterExam, filterStatus, filterStudent, tab, sortKey, sortDir]);

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

  const totalAllPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const displayItems = tab === 'all'
    ? filteredItems.slice((allPage - 1) * PAGE_SIZE, allPage * PAGE_SIZE)
    : filteredItems;

  useEffect(() => { setAllPage(1); }, [filterAssessor, filterCategory, filterTrade, filterExam, filterStudent, tab]);

  const allSelected = displayItems.length > 0 && displayItems.every(i => selected.has(i.submission.id));

  const selectedItems = useMemo(
    () => inQueueItems.filter(i => selected.has(i.submission.id)),
    [inQueueItems, selected],
  );

  // ── Filters helpers ───────────────────────────────────────────────────────
  const hasActiveFilters = !!(filterAssessor || filterCategory || filterTrade || filterExam || filterStatus || filterStudent);

  const clearFilters = () => {
    setFilterAssessor('');
    setFilterCategory('');
    setFilterTrade('');
    setFilterExam('');
    setFilterStatus('');
    setFilterStudent('');
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const addToQueueWithAutoAssign = (submissionId: string) => {
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub?.gradedBy) return null;
    const assessorCategoryId = tutors.find(t => t.id === sub.gradedBy)?.categoryId;
    const reviewer = autoAssignReviewer(sub.gradedBy, assessorCategoryId);
    addIqaCheck({ submissionId, assessorId: sub.gradedBy, status: 'Pending', assignedTo: reviewer ?? undefined });
    return reviewer;
  };

  const handleAddToQueue = (submissionId: string) => {
    const reviewer = addToQueueWithAutoAssign(submissionId);
    const name = reviewer ? tutors.find(t => t.id === reviewer)?.name : null;
    setToast(name ? `Added to queue — auto-assigned to ${name}` : 'Added to queue (no reviewer available)');
    refresh();
  };

  const handleExclude = (submissionId: string) => {
    skipSubmissions([submissionId]);
    setToast('Assessment excluded from IQA queue');
    refresh();
  };

  const handleAssignReviewer = (submissionId: string, tutorId: string) => {
    const item = currentItems.find(i => i.submission.id === submissionId);
    if (!item) return;
    if (item.check) {
      updateIqaCheck(item.check.id, { assignedTo: tutorId || undefined });
    } else {
      addIqaCheck({ submissionId, assessorId: item.submission.gradedBy!, status: 'Pending', assignedTo: tutorId || undefined });
    }
    setToast(`Assigned to ${tutors.find(t => t.id === tutorId)?.name ?? 'any reviewer'}`);
    refresh();
  };

  const handleModalSkip = (submissionId: string, checkId: string) => {
    removeIqaCheck(checkId);
    skipSubmissions([submissionId]);
    setToast('Assessment removed from queue and excluded');
    refresh();
  };

  const handleModalAssign = (checkId: string, tutorId: string) => {
    updateIqaCheck(checkId, { assignedTo: tutorId });
    setToast(`Assigned to ${tutors.find(t => t.id === tutorId)?.name ?? 'reviewer'}`);
    refresh();
  };

  const handleBulkAutoAdd = () => {
    let count = 0;
    selected.forEach(id => {
      if (!submissionIdsInQueue.has(id)) { addToQueueWithAutoAssign(id); count++; }
    });
    setToast(`Added ${count} item${count !== 1 ? 's' : ''} to queue with auto-assignment`);
    setSelected(new Set());
    refresh();
  };

  const handleBulkSkip = () => {
    const ids = [...selected];
    skipSubmissions(ids);
    setToast(`Excluded ${ids.length} assessment${ids.length !== 1 ? 's' : ''} from IQA queue`);
    setSelected(new Set());
    setConfirmBulkAction(null);
    refresh();
  };

  const handleBulkAssign = () => {
    if (!bulkAssignTutor) return;
    let count = 0;
    selected.forEach(id => {
      const item = currentItems.find(i => i.submission.id === id);
      if (!item) return;
      if (item.check) {
        updateIqaCheck(item.check.id, { assignedTo: bulkAssignTutor });
      } else {
        addIqaCheck({ submissionId: id, assessorId: item.submission.gradedBy!, status: 'Pending', assignedTo: bulkAssignTutor });
      }
      count++;
    });
    setToast(`Assigned ${count} item${count !== 1 ? 's' : ''} to ${tutors.find(t => t.id === bulkAssignTutor)?.name ?? 'reviewer'}`);
    setSelected(new Set());
    setShowBulkAssign(false);
    setBulkAssignTutor('');
    refresh();
  };

  const handleBulkUnassign = () => {
    let count = 0;
    selected.forEach(id => {
      const item = currentItems.find(i => i.submission.id === id);
      if (!item?.check?.assignedTo) return;
      updateIqaCheck(item.check.id, { assignedTo: undefined });
      count++;
    });
    setToast(`Unassigned ${count} item${count !== 1 ? 's' : ''}`);
    setSelected(new Set());
    setConfirmBulkAction(null);
    refresh();
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
        <span className="text-sm text-gray-900 font-medium">Assign for Recheck</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">IQA</p>
          <h1 className="text-2xl font-bold text-gray-900">Assign for Recheck</h1>
          <p className="text-gray-500 text-sm mt-1">Manage which assessments go into the IQA review queue.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/iqa/categories" className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50">
            Categories
          </Link>
          <Link href="/iqa/review-queue" className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50">
            Review Queue
          </Link>
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

      {/* Workload + Coverage panels */}
      <WorkloadPanel
        workloads={workloads}
        categories={categories}
        filterCategory={filterCategory}
        collapsed={workloadCollapsed}
        onToggle={() => setWorkloadCollapsed(c => !c)}
      />
      <CoveragePanel categories={categories} tutors={tutors} allItems={allItems} />

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
      {tab === 'all' && <p className="text-xs text-gray-500 mb-4">All graded assessments. Shows IQA status for each.</p>}
      {tab === 'not-queue' && <p className="text-xs text-gray-500 mb-4">Graded assessments eligible for IQA — not yet queued or excluded. Select to add to queue or exclude.</p>}

      {/* Filters */}
      <FiltersBar
        tab={tab}
        filterStudent={filterStudent}
        filterAssessor={filterAssessor}
        filterCategory={filterCategory}
        filterTrade={filterTrade}
        filterExam={filterExam}
        filterStatus={filterStatus}
        uniqueAssessors={uniqueAssessors}
        uniqueCategories={uniqueCategories}
        uniqueExams={uniqueExams}
        filteredCount={filteredItems.length}
        totalCount={currentItems.length}
        hasActiveFilters={hasActiveFilters}
        onStudentChange={setFilterStudent}
        onAssessorChange={setFilterAssessor}
        onCategoryChange={setFilterCategory}
        onTradeChange={setFilterTrade}
        onExamChange={setFilterExam}
        onStatusChange={setFilterStatus}
        onClearFilters={clearFilters}
      />

      {/* Bulk actions */}
      {selected.size > 0 && (
        <BulkActionsBar
          selectedCount={selected.size}
          tab={tab}
          tutors={tutors}
          workloads={workloads}
          bulkAssignTutor={bulkAssignTutor}
          showBulkAssign={showBulkAssign}
          onBulkAssignTutorChange={setBulkAssignTutor}
          onShowBulkAssign={setShowBulkAssign}
          onBulkAutoAdd={handleBulkAutoAdd}
          onRequestExclude={() => setConfirmBulkAction('exclude')}
          onRequestUnassign={() => setConfirmBulkAction('unassign')}
          onBulkAssign={handleBulkAssign}
          onHistoryModal={() => setShowHistoryModal(true)}
          onClearSelection={() => setSelected(new Set())}
        />
      )}

      {/* Main table */}
      <AssignTable
        tab={tab}
        displayItems={displayItems}
        selected={selected}
        allSelected={allSelected}
        sortKey={sortKey}
        sortDir={sortDir}
        allPage={allPage}
        totalAllPages={totalAllPages}
        filteredCount={filteredItems.length}
        hasActiveFilters={hasActiveFilters}
        tutors={tutors}
        workloads={workloads}
        onToggleAll={() => {
          if (allSelected) setSelected(new Set());
          else setSelected(new Set(displayItems.map(i => i.submission.id)));
        }}
        onToggleOne={id => setSelected(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id); else next.add(id);
          return next;
        })}
        onSortClick={handleSortClick}
        onPageChange={setAllPage}
        onClearFilters={clearFilters}
        onSwitchTab={setTab}
        onAddToQueue={handleAddToQueue}
        onExclude={handleExclude}
        onAssignReviewer={handleAssignReviewer}
      />

      {/* Excluded counter (All tab) */}
      {tab === 'all' && skipped.size > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          {skipped.size} assessment{skipped.size !== 1 ? 's' : ''} excluded from IQA queue.{' '}
          <button
            onClick={() => { [...skipped].forEach(id => unskipSubmission(id)); refresh(); }}
            className="text-orange-600 hover:text-orange-700 underline underline-offset-2"
          >
            Restore all
          </button>
        </p>
      )}

      {/* IQA History Modal */}
      {showHistoryModal && selectedItems.length > 0 && (
        <IqaHistoryModal
          items={selectedItems}
          allChecks={checks}
          tutors={tutors}
          workloads={workloads}
          onClose={() => setShowHistoryModal(false)}
          onSkip={handleModalSkip}
          onAssign={handleModalAssign}
        />
      )}

      {/* Confirm bulk action */}
      {confirmBulkAction && (
        <ConfirmDialog
          action={confirmBulkAction}
          selectedCount={selected.size}
          onConfirm={confirmBulkAction === 'exclude' ? handleBulkSkip : handleBulkUnassign}
          onCancel={() => setConfirmBulkAction(null)}
        />
      )}
    </div>
  );
}
