export type IqaCheckStatus = 'Pending' | 'Approved' | 'Rejected';
export type IqaRiskLevel = 'Low' | 'Medium' | 'High';
export type IqaTutorRole = 'assessor' | 'reviewer' | 'both';

export interface IqaCategory {
  id: string;
  name: string;
  recheckPercent: number;
  riskLevel: IqaRiskLevel;
  /** Max active rechecks a single reviewer in this category can handle (default) */
  rechecksPerReviewer: number;
  /** If true, new assessors and orphaned assessors default to this category */
  isDefault?: boolean;
}

export interface IqaTutor {
  id: string;
  name: string;
  email: string;
  categoryId: string;
  /** Whether this person grades submissions, reviews them, or both */
  role: IqaTutorRole;
  /** Per-reviewer max queue override; falls back to category rechecksPerReviewer */
  maxQueue?: number;
}

export type IqaOutcomeType = 'approved' | 'recheck-assessor' | 'return-module';

export interface IqaCheck {
  id: string;
  submissionId: string;
  /** ID of the assessor (tutor) who originally graded this submission */
  assessorId: string;
  status: IqaCheckStatus;
  reviewerName?: string;
  reviewedAt?: string;
  feedback?: string;
  /** Specific outcome when status is Approved or Rejected */
  outcomeType?: IqaOutcomeType;
  /** Reviewer assigned to IQA this check */
  assignedTo?: string;
}

export interface IqaFeedbackRecord {
  id: string;
  /** The assessor who received this feedback */
  assessorId: string;
  studentName: string;
  assessmentTitle: string;
  outcomeType: IqaOutcomeType;
  feedback: string;
  reviewerName: string;
  reviewedAt: string;
  read: boolean;
}

// ── Storage keys ──────────────────────────────────────────────────────────

const IQA_CHECKS_STORAGE_KEY = 'iqa-checks-overrides';
const IQA_ADDED_CHECKS_KEY = 'iqa-added-checks';
const IQA_REMOVED_CHECKS_KEY = 'iqa-removed-checks';
const IQA_CATEGORIES_STORAGE_KEY = 'iqa-categories-overrides';
const IQA_TUTORS_STORAGE_KEY = 'iqa-tutors-overrides';
const IQA_ADDED_TUTORS_KEY = 'iqa-added-tutors';
const IQA_SKIPPED_KEY = 'iqa-skipped-submissions';
const IQA_FEEDBACK_KEY = 'iqa-feedback-records';

// ── Base data ─────────────────────────────────────────────────────────────

const iqaCategoriesBase: IqaCategory[] = [
  { id: 'cat1', name: 'Low Risk', recheckPercent: 10, riskLevel: 'Low', rechecksPerReviewer: 20 },
  { id: 'cat2', name: 'Medium Risk', recheckPercent: 25, riskLevel: 'Medium', rechecksPerReviewer: 12 },
  { id: 'cat3', name: 'High Risk', recheckPercent: 50, riskLevel: 'High', rechecksPerReviewer: 6, isDefault: true },
];

const iqaTutorsBase: IqaTutor[] = [
  { id: 't1', name: 'Sarah Mitchell', email: 's.mitchell@lms.co.uk', categoryId: 'cat1', role: 'both' },
  { id: 't2', name: 'James Chen',    email: 'j.chen@lms.co.uk',     categoryId: 'cat1', role: 'reviewer' },
  { id: 't3', name: 'Emma Watson',   email: 'e.watson@lms.co.uk',   categoryId: 'cat2', role: 'assessor' },
  { id: 't4', name: 'David Kumar',   email: 'd.kumar@lms.co.uk',    categoryId: 'cat2', role: 'both' },
  { id: 't5', name: 'Lisa Park',     email: 'l.park@lms.co.uk',     categoryId: 'cat3', role: 'assessor' },
  { id: 't6', name: 'Tom Bradley',   email: 't.bradley@lms.co.uk',  categoryId: 'cat3', role: 'both' },
];

export const iqaChecksBase: IqaCheck[] = [
  // Pending + assigned → shows in All tab only
  { id: 'c1', submissionId: 's7',  assessorId: 't3', status: 'Pending', assignedTo: 't2' },
  { id: 'c2', submissionId: 's8',  assessorId: 't4', status: 'Pending', assignedTo: 't1' },
  // Completed reviews → shows in All tab with status + reviewer
  { id: 'c3', submissionId: 's9',  assessorId: 't1', status: 'Approved', reviewerName: 'James Chen', reviewedAt: '14 Feb 2026, 11:30', outcomeType: 'approved', assignedTo: 't2' },
  { id: 'c5', submissionId: 's13', assessorId: 't5', status: 'Rejected', reviewerName: 'David Kumar', reviewedAt: '13 Feb 2026, 15:00', feedback: 'Insufficient detail in marking criteria application.', outcomeType: 'recheck-assessor', assignedTo: 't4' },
  { id: 'c7', submissionId: 's16', assessorId: 't6', status: 'Approved', reviewerName: 'Sarah Mitchell', reviewedAt: '16 Feb 2026, 14:20', outcomeType: 'approved', assignedTo: 't1' },
  { id: 'c8', submissionId: 's17', assessorId: 't6', status: 'Pending', assignedTo: 't4' },
  // Pending + NO assignedTo → shows in In Queue tab (awaiting reviewer assignment)
  { id: 'c4', submissionId: 's12', assessorId: 't4', status: 'Pending' },
  { id: 'c6', submissionId: 's14', assessorId: 't5', status: 'Pending' },
  { id: 'c9', submissionId: 's18', assessorId: 't1', status: 'Pending' },
  { id: 'c10', submissionId: 's19', assessorId: 't1', status: 'Pending' },
  // s10, s15, s20, s21, s22, s23, s24, s25 → no check = Not in Queue
];

// ── Categories ────────────────────────────────────────────────────────────

function getCategoryOverrides(): Record<string, Partial<IqaCategory>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(IQA_CATEGORIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

const ADDED_CATEGORIES_KEY = 'iqa-added-categories';
const REMOVED_CATEGORIES_KEY = 'iqa-removed-categories';

export function getIqaCategories(): IqaCategory[] {
  const overrides = getCategoryOverrides();
  if (typeof window === 'undefined') {
    return iqaCategoriesBase.map(c => ({ ...c, ...overrides[c.id] }));
  }
  try {
    const removed: string[] = JSON.parse(sessionStorage.getItem(REMOVED_CATEGORIES_KEY) ?? '[]');
    const removedSet = new Set(removed);
    const base = iqaCategoriesBase
      .filter(c => !removedSet.has(c.id))
      .map(c => ({ ...c, ...overrides[c.id] }));
    const added: IqaCategory[] = JSON.parse(sessionStorage.getItem(ADDED_CATEGORIES_KEY) ?? '[]')
      .filter((c: IqaCategory) => !removedSet.has(c.id));
    return [...base, ...added];
  } catch { return iqaCategoriesBase.map(c => ({ ...c, ...overrides[c.id] })); }
}

export function getDefaultCategory(): IqaCategory | undefined {
  return getIqaCategories().find(c => c.isDefault);
}

export function setDefaultCategory(id: string) {
  const categories = getIqaCategories();
  for (const cat of categories) {
    if (cat.isDefault && cat.id !== id) updateIqaCategory(cat.id, { isDefault: false });
  }
  updateIqaCategory(id, { isDefault: true });
}

export function removeIqaCategory(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const defaultCat = getIqaCategories().find(c => c.isDefault && c.id !== id);
    if (defaultCat) {
      const tutors = getIqaTutors().filter(t => t.categoryId === id);
      for (const t of tutors) {
        updateIqaTutor(t.id, { categoryId: defaultCat.id });
      }
    }

    const removed: string[] = JSON.parse(sessionStorage.getItem(REMOVED_CATEGORIES_KEY) ?? '[]');
    if (!removed.includes(id)) {
      removed.push(id);
      sessionStorage.setItem(REMOVED_CATEGORIES_KEY, JSON.stringify(removed));
    }
    window.dispatchEvent(new CustomEvent('iqa-categories-updated'));
    window.dispatchEvent(new CustomEvent('iqa-tutors-updated'));
  } catch { /* ignore */ }
}

export function addIqaCategory(category: IqaCategory) {
  if (typeof window === 'undefined') return;
  try {
    const raw = sessionStorage.getItem(ADDED_CATEGORIES_KEY);
    const added: IqaCategory[] = raw ? JSON.parse(raw) : [];
    added.push(category);
    sessionStorage.setItem(ADDED_CATEGORIES_KEY, JSON.stringify(added));
    window.dispatchEvent(new CustomEvent('iqa-categories-updated'));
  } catch { /* ignore */ }
}

export function updateIqaCategory(id: string, update: Partial<IqaCategory>) {
  if (typeof window === 'undefined') return;
  try {
    const baseIds = new Set(iqaCategoriesBase.map(c => c.id));
    if (baseIds.has(id)) {
      const overrides = getCategoryOverrides();
      overrides[id] = { ...overrides[id], ...update };
      sessionStorage.setItem(IQA_CATEGORIES_STORAGE_KEY, JSON.stringify(overrides));
    } else {
      const raw = sessionStorage.getItem(ADDED_CATEGORIES_KEY);
      const added: IqaCategory[] = raw ? JSON.parse(raw) : [];
      const idx = added.findIndex(c => c.id === id);
      if (idx >= 0) {
        added[idx] = { ...added[idx], ...update };
        sessionStorage.setItem(ADDED_CATEGORIES_KEY, JSON.stringify(added));
      }
    }
    window.dispatchEvent(new CustomEvent('iqa-categories-updated'));
  } catch { /* ignore */ }
}

export const iqaCategories: IqaCategory[] = iqaCategoriesBase;

// ── Tutors ────────────────────────────────────────────────────────────────

function getTutorOverrides(): Record<string, Partial<IqaTutor>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(IQA_TUTORS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function getIqaTutors(): IqaTutor[] {
  const overrides = getTutorOverrides();
  const base = iqaTutorsBase.map(t => ({ ...t, ...overrides[t.id] }));
  if (typeof window === 'undefined') return base;
  try {
    const raw = sessionStorage.getItem(IQA_ADDED_TUTORS_KEY);
    const added: IqaTutor[] = raw ? JSON.parse(raw) : [];
    return [...base, ...added.map(t => ({ ...t, ...overrides[t.id] }))];
  } catch { return base; }
}

export function addIqaTutor(tutor: Omit<IqaTutor, 'id'> & { id?: string }): string {
  if (typeof window === 'undefined') return '';
  try {
    const id = tutor.id ?? 't-' + Date.now();
    const newTutor = { ...tutor, id };
    const raw = sessionStorage.getItem(IQA_ADDED_TUTORS_KEY);
    const added: IqaTutor[] = raw ? JSON.parse(raw) : [];
    added.push(newTutor);
    sessionStorage.setItem(IQA_ADDED_TUTORS_KEY, JSON.stringify(added));
    window.dispatchEvent(new CustomEvent('iqa-tutors-updated'));
    return id;
  } catch { return ''; }
}

export function updateIqaTutor(id: string, update: Partial<IqaTutor>) {
  if (typeof window === 'undefined') return;
  try {
    const baseIds = new Set(iqaTutorsBase.map(t => t.id));
    if (baseIds.has(id)) {
      const overrides = getTutorOverrides();
      overrides[id] = { ...overrides[id], ...update };
      sessionStorage.setItem(IQA_TUTORS_STORAGE_KEY, JSON.stringify(overrides));
    } else {
      const raw = sessionStorage.getItem(IQA_ADDED_TUTORS_KEY);
      const added: IqaTutor[] = raw ? JSON.parse(raw) : [];
      const idx = added.findIndex(t => t.id === id);
      if (idx >= 0) {
        added[idx] = { ...added[idx], ...update };
        sessionStorage.setItem(IQA_ADDED_TUTORS_KEY, JSON.stringify(added));
      }
    }
    window.dispatchEvent(new CustomEvent('iqa-tutors-updated'));
  } catch { /* ignore */ }
}

export const iqaTutors: IqaTutor[] = iqaTutorsBase;

// ── IQA Checks ────────────────────────────────────────────────────────────

function getOverrides(): Record<string, Partial<IqaCheck>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(IQA_CHECKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function getRemovedCheckIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(IQA_REMOVED_CHECKS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

export function getIqaChecks(): IqaCheck[] {
  const overrides = getOverrides();
  const removed = getRemovedCheckIds();
  const base = iqaChecksBase
    .filter(c => !removed.has(c.id))
    .map(c => ({ ...c, ...overrides[c.id] }));
  if (typeof window === 'undefined') return base;
  try {
    const raw = sessionStorage.getItem(IQA_ADDED_CHECKS_KEY);
    const added: IqaCheck[] = raw ? JSON.parse(raw) : [];
    return [
      ...base,
      ...added.filter(c => !removed.has(c.id)).map(c => ({ ...c, ...overrides[c.id] })),
    ];
  } catch { return base; }
}

export function updateIqaCheck(id: string, update: Partial<IqaCheck>) {
  if (typeof window === 'undefined') return;
  try {
    const overrides = getOverrides();
    overrides[id] = { ...overrides[id], ...update };
    sessionStorage.setItem(IQA_CHECKS_STORAGE_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent('iqa-checks-updated'));
  } catch { /* ignore */ }
}

export function addIqaCheck(check: Omit<IqaCheck, 'id'> & { id?: string }): string {
  if (typeof window === 'undefined') return '';
  try {
    const id = check.id ?? 'c-' + Date.now();
    const newCheck = { ...check, id };
    const raw = sessionStorage.getItem(IQA_ADDED_CHECKS_KEY);
    const added: IqaCheck[] = raw ? JSON.parse(raw) : [];
    added.push(newCheck);
    sessionStorage.setItem(IQA_ADDED_CHECKS_KEY, JSON.stringify(added));
    window.dispatchEvent(new CustomEvent('iqa-checks-updated'));
    return id;
  } catch { return ''; }
}

export function removeIqaCheck(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const baseIds = new Set(iqaChecksBase.map(c => c.id));
    if (baseIds.has(id)) {
      const removed = getRemovedCheckIds();
      removed.add(id);
      sessionStorage.setItem(IQA_REMOVED_CHECKS_KEY, JSON.stringify([...removed]));
    } else {
      const raw = sessionStorage.getItem(IQA_ADDED_CHECKS_KEY);
      const added: IqaCheck[] = raw ? JSON.parse(raw) : [];
      sessionStorage.setItem(IQA_ADDED_CHECKS_KEY, JSON.stringify(added.filter(c => c.id !== id)));
    }
    window.dispatchEvent(new CustomEvent('iqa-checks-updated'));
  } catch { /* ignore */ }
}

export const iqaChecks: IqaCheck[] = iqaChecksBase;

// ── Skipped submissions ───────────────────────────────────────────────────

export function getSkippedSubmissionIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(IQA_SKIPPED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

export function skipSubmissions(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    const current = getSkippedSubmissionIds();
    ids.forEach(id => current.add(id));
    sessionStorage.setItem(IQA_SKIPPED_KEY, JSON.stringify([...current]));
    window.dispatchEvent(new CustomEvent('iqa-checks-updated'));
  } catch { /* ignore */ }
}

export function unskipSubmission(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const current = getSkippedSubmissionIds();
    current.delete(id);
    sessionStorage.setItem(IQA_SKIPPED_KEY, JSON.stringify([...current]));
    window.dispatchEvent(new CustomEvent('iqa-checks-updated'));
  } catch { /* ignore */ }
}

// ── Feedback records ──────────────────────────────────────────────────────

export function getFeedbackRecords(): IqaFeedbackRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(IQA_FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addFeedbackRecord(record: Omit<IqaFeedbackRecord, 'id'>): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getFeedbackRecords();
    all.push({ ...record, id: 'fb-' + Date.now() });
    sessionStorage.setItem(IQA_FEEDBACK_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('iqa-feedback-updated'));
  } catch { /* ignore */ }
}

export function markFeedbackRead(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getFeedbackRecords().map(r => r.id === id ? { ...r, read: true } : r);
    sessionStorage.setItem(IQA_FEEDBACK_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('iqa-feedback-updated'));
  } catch { /* ignore */ }
}

export function getFeedbackForAssessor(assessorId: string): IqaFeedbackRecord[] {
  return getFeedbackRecords().filter(r => r.assessorId === assessorId);
}

// ── Workload & auto-assignment ────────────────────────────────────────────

export interface ReviewerWorkload {
  tutor: IqaTutor;
  category: IqaCategory | undefined;
  activeCount: number;
  capacity: number;
  remaining: number;
}

export function getReviewerWorkloads(): ReviewerWorkload[] {
  const checks = getIqaChecks();
  // Only people who can review (role 'reviewer' or 'both')
  const tutors = getIqaTutors().filter(t => t.role !== 'assessor');
  const categories = getIqaCategories();

  return tutors.map(t => {
    const category = categories.find(c => c.id === t.categoryId);
    const capacity = t.maxQueue ?? category?.rechecksPerReviewer ?? 10;
    const activeCount = checks.filter(c => c.assignedTo === t.id && c.status === 'Pending').length;
    return { tutor: t, category, activeCount, capacity, remaining: capacity - activeCount };
  });
}

/**
 * Picks a reviewer automatically:
 * 1. Reviewer role must be 'reviewer' or 'both'
 * 2. Cannot be the same person who graded the submission
 * 3. Prefers same-category reviewer first; falls back to any eligible reviewer
 * 4. Among same remaining-capacity reviewers, picks randomly (load-balanced)
 */
export function autoAssignReviewer(assessorId: string, categoryId?: string): string | null {
  const workloads = getReviewerWorkloads();
  const eligible = workloads.filter(w => w.tutor.id !== assessorId && w.remaining > 0);
  if (eligible.length === 0) return null;

  // Prefer same-category first
  const sameCategory = categoryId ? eligible.filter(w => w.tutor.categoryId === categoryId) : [];
  const pool = sameCategory.length > 0 ? sameCategory : eligible;

  pool.sort((a, b) => b.remaining - a.remaining);
  const maxRemaining = pool[0].remaining;
  const topTier = pool.filter(w => w.remaining === maxRemaining);
  return topTier[Math.floor(Math.random() * topTier.length)].tutor.id;
}
