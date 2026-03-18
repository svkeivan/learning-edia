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

export interface IqaReviewRound {
  version: number;
  reviewerName: string;
  reviewedAt: string;
  outcome: IqaOutcomeType;
  feedback: string;
}

export interface IqaCheck {
  id: string;
  submissionId: string;
  assessorId: string;
  status: IqaCheckStatus;
  reviewerName?: string;
  reviewedAt?: string;
  feedback?: string;
  outcomeType?: IqaOutcomeType;
  assignedTo?: string;
  reviewHistory?: IqaReviewRound[];
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
  { id: 'cat1', name: 'Experienced Assessors', recheckPercent: 10, riskLevel: 'Low', rechecksPerReviewer: 20 },
  { id: 'cat2', name: 'Standard Assessors', recheckPercent: 25, riskLevel: 'Medium', rechecksPerReviewer: 12 },
  { id: 'cat3', name: 'New Joiners', recheckPercent: 50, riskLevel: 'High', rechecksPerReviewer: 6, isDefault: true },
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
  // ── Cohort 1: London (assessor t1, Low Risk 10%) ── 5 of 45
  { id: 'c1', submissionId: 's3',  assessorId: 't1', status: 'Approved', reviewerName: 'James Chen', reviewedAt: '11 Feb 2026, 14:00', outcomeType: 'approved', assignedTo: 't2' },
  { id: 'c2', submissionId: 's8',  assessorId: 't1', status: 'Pending', assignedTo: 't6' },
  { id: 'c3', submissionId: 's18', assessorId: 't1', status: 'Pending' },
  { id: 'c4', submissionId: 's28', assessorId: 't1', status: 'Rejected', reviewerName: 'Tom Bradley', reviewedAt: '15 Feb 2026, 10:30', feedback: 'Marking criteria not fully evidenced.', outcomeType: 'recheck-assessor', assignedTo: 't6', reviewHistory: [{ version: 1, reviewerName: 'Tom Bradley', reviewedAt: '15 Feb 2026, 10:30', outcome: 'recheck-assessor', feedback: 'Marking criteria not fully evidenced.' }] },
  { id: 'c5', submissionId: 's35', assessorId: 't1', status: 'Pending' },

  // ── Cohort 2: Manchester (assessor t3, Medium Risk 25%) ── 14 of 54
  { id: 'c6',  submissionId: 's46', assessorId: 't3', status: 'Approved', reviewerName: 'James Chen', reviewedAt: '4 Feb 2026, 11:00', outcomeType: 'approved', assignedTo: 't2' },
  { id: 'c7',  submissionId: 's49', assessorId: 't3', status: 'Rejected', reviewerName: 'Sarah Mitchell', reviewedAt: '4 Feb 2026, 15:30', feedback: 'Incorrect pass/fail decision.', outcomeType: 'recheck-assessor', assignedTo: 't1' },
  { id: 'c8',  submissionId: 's52', assessorId: 't3', status: 'Pending', assignedTo: 't2' },
  { id: 'c9',  submissionId: 's55', assessorId: 't3', status: 'Pending' },
  { id: 'c10', submissionId: 's60', assessorId: 't3', status: 'Approved', reviewerName: 'David Kumar', reviewedAt: '6 Feb 2026, 09:45', outcomeType: 'approved', assignedTo: 't4' },
  { id: 'c11', submissionId: 's65', assessorId: 't3', status: 'Pending', assignedTo: 't1' },
  { id: 'c12', submissionId: 's68', assessorId: 't3', status: 'Pending' },
  { id: 'c13', submissionId: 's72', assessorId: 't3', status: 'Approved', reviewerName: 'Tom Bradley', reviewedAt: '6 Feb 2026, 14:20', outcomeType: 'approved', assignedTo: 't6' },
  { id: 'c14', submissionId: 's76', assessorId: 't3', status: 'Pending', assignedTo: 't4' },
  { id: 'c15', submissionId: 's80', assessorId: 't3', status: 'Rejected', reviewerName: 'James Chen', reviewedAt: '8 Feb 2026, 11:15', feedback: 'Insufficient evidence gathered.', outcomeType: 'recheck-assessor', assignedTo: 't2' },
  { id: 'c16', submissionId: 's84', assessorId: 't3', status: 'Pending' },
  { id: 'c17', submissionId: 's88', assessorId: 't3', status: 'Pending', assignedTo: 't6' },
  { id: 'c18', submissionId: 's92', assessorId: 't3', status: 'Pending' },
  { id: 'c19', submissionId: 's96', assessorId: 't3', status: 'Approved', reviewerName: 'Sarah Mitchell', reviewedAt: '8 Feb 2026, 16:00', outcomeType: 'approved', assignedTo: 't1' },

  // ── Cohort 3: Birmingham (assessor t5, High Risk 50%) ── 24 of 48
  { id: 'c20', submissionId: 's100', assessorId: 't5', status: 'Approved', reviewerName: 'Sarah Mitchell', reviewedAt: '18 Feb 2026, 09:00', outcomeType: 'approved', assignedTo: 't1' },
  { id: 'c21', submissionId: 's102', assessorId: 't5', status: 'Rejected', reviewerName: 'David Kumar', reviewedAt: '18 Feb 2026, 11:30', feedback: 'Grading inconsistency found.', outcomeType: 'recheck-assessor', assignedTo: 't4', reviewHistory: [{ version: 1, reviewerName: 'Sarah Mitchell', reviewedAt: '16 Feb 2026, 14:00', outcome: 'recheck-assessor', feedback: 'Initial assessment showed insufficient evidence for a pass grade. Assessor needs to verify practical competency.' }, { version: 2, reviewerName: 'David Kumar', reviewedAt: '18 Feb 2026, 11:30', outcome: 'recheck-assessor', feedback: 'Grading inconsistency found.' }] },
  { id: 'c22', submissionId: 's104', assessorId: 't5', status: 'Pending', assignedTo: 't2' },
  { id: 'c23', submissionId: 's106', assessorId: 't5', status: 'Pending' },
  { id: 'c24', submissionId: 's108', assessorId: 't5', status: 'Approved', reviewerName: 'Tom Bradley', reviewedAt: '18 Feb 2026, 15:00', outcomeType: 'approved', assignedTo: 't6' },
  { id: 'c25', submissionId: 's110', assessorId: 't5', status: 'Pending', assignedTo: 't1' },
  { id: 'c26', submissionId: 's112', assessorId: 't5', status: 'Pending' },
  { id: 'c27', submissionId: 's114', assessorId: 't5', status: 'Rejected', reviewerName: 'James Chen', reviewedAt: '19 Feb 2026, 10:00', feedback: 'Pass mark too lenient for evidence.', outcomeType: 'recheck-assessor', assignedTo: 't2' },
  { id: 'c28', submissionId: 's116', assessorId: 't5', status: 'Approved', reviewerName: 'David Kumar', reviewedAt: '20 Feb 2026, 09:30', outcomeType: 'approved', assignedTo: 't4' },
  { id: 'c29', submissionId: 's118', assessorId: 't5', status: 'Pending', assignedTo: 't6' },
  { id: 'c30', submissionId: 's120', assessorId: 't5', status: 'Pending' },
  { id: 'c31', submissionId: 's122', assessorId: 't5', status: 'Approved', reviewerName: 'Sarah Mitchell', reviewedAt: '20 Feb 2026, 14:00', outcomeType: 'approved', assignedTo: 't1' },
  { id: 'c32', submissionId: 's124', assessorId: 't5', status: 'Pending', assignedTo: 't2' },
  { id: 'c33', submissionId: 's126', assessorId: 't5', status: 'Pending' },
  { id: 'c34', submissionId: 's128', assessorId: 't5', status: 'Rejected', reviewerName: 'Tom Bradley', reviewedAt: '21 Feb 2026, 11:00', feedback: 'Missing practical observation notes.', outcomeType: 'recheck-assessor', assignedTo: 't6', reviewHistory: [{ version: 1, reviewerName: 'James Chen', reviewedAt: '19 Feb 2026, 15:00', outcome: 'recheck-assessor', feedback: 'Assessor did not include practical observation notes. Health and safety compliance not documented.' }, { version: 2, reviewerName: 'Tom Bradley', reviewedAt: '21 Feb 2026, 11:00', outcome: 'recheck-assessor', feedback: 'Missing practical observation notes.' }] },
  { id: 'c35', submissionId: 's132', assessorId: 't5', status: 'Approved', reviewerName: 'James Chen', reviewedAt: '22 Feb 2026, 09:00', outcomeType: 'approved', assignedTo: 't2' },
  { id: 'c36', submissionId: 's134', assessorId: 't5', status: 'Pending', assignedTo: 't4' },
  { id: 'c37', submissionId: 's136', assessorId: 't5', status: 'Pending' },
  { id: 'c38', submissionId: 's138', assessorId: 't5', status: 'Approved', reviewerName: 'Sarah Mitchell', reviewedAt: '22 Feb 2026, 14:30', outcomeType: 'approved', assignedTo: 't1' },
  { id: 'c39', submissionId: 's140', assessorId: 't5', status: 'Pending', assignedTo: 't6' },
  { id: 'c40', submissionId: 's142', assessorId: 't5', status: 'Pending' },
  { id: 'c41', submissionId: 's144', assessorId: 't5', status: 'Pending', assignedTo: 't2' },
  { id: 'c42', submissionId: 's146', assessorId: 't5', status: 'Pending' },
  { id: 'c43', submissionId: 's147', assessorId: 't5', status: 'Rejected', reviewerName: 'David Kumar', reviewedAt: '22 Feb 2026, 16:00', feedback: 'Student evidence mismatch.', outcomeType: 'recheck-assessor', assignedTo: 't4' },

  // ── Cohort 4: Leeds (assessor t4, Medium Risk 25%) ── 15 of 60
  { id: 'c44', submissionId: 's148', assessorId: 't4', status: 'Approved', reviewerName: 'Sarah Mitchell', reviewedAt: '25 Feb 2026, 09:30', outcomeType: 'approved', assignedTo: 't1' },
  { id: 'c45', submissionId: 's152', assessorId: 't4', status: 'Rejected', reviewerName: 'Tom Bradley', reviewedAt: '25 Feb 2026, 14:00', feedback: 'Grading criteria misapplied.', outcomeType: 'recheck-assessor', assignedTo: 't6' },
  { id: 'c46', submissionId: 's155', assessorId: 't4', status: 'Pending', assignedTo: 't2' },
  { id: 'c47', submissionId: 's158', assessorId: 't4', status: 'Pending' },
  { id: 'c48', submissionId: 's162', assessorId: 't4', status: 'Approved', reviewerName: 'James Chen', reviewedAt: '26 Feb 2026, 10:00', outcomeType: 'approved', assignedTo: 't2' },
  { id: 'c49', submissionId: 's168', assessorId: 't4', status: 'Pending', assignedTo: 't1' },
  { id: 'c50', submissionId: 's172', assessorId: 't4', status: 'Pending' },
  { id: 'c51', submissionId: 's175', assessorId: 't4', status: 'Approved', reviewerName: 'Tom Bradley', reviewedAt: '27 Feb 2026, 11:30', outcomeType: 'approved', assignedTo: 't6' },
  { id: 'c52', submissionId: 's178', assessorId: 't4', status: 'Pending', assignedTo: 't2' },
  { id: 'c53', submissionId: 's182', assessorId: 't4', status: 'Pending' },
  { id: 'c54', submissionId: 's188', assessorId: 't4', status: 'Rejected', reviewerName: 'Sarah Mitchell', reviewedAt: '1 Mar 2026, 09:00', feedback: 'Evidence quality insufficient.', outcomeType: 'recheck-assessor', assignedTo: 't1', reviewHistory: [{ version: 1, reviewerName: 'James Chen', reviewedAt: '26 Feb 2026, 10:00', outcome: 'recheck-assessor', feedback: 'Multiple criteria not met. Assessor gave pass but evidence does not support this.' }, { version: 2, reviewerName: 'Tom Bradley', reviewedAt: '28 Feb 2026, 14:30', outcome: 'recheck-assessor', feedback: 'Re-graded but still inconsistent. Practical observation missing.' }, { version: 3, reviewerName: 'Sarah Mitchell', reviewedAt: '1 Mar 2026, 09:00', outcome: 'recheck-assessor', feedback: 'Evidence quality insufficient.' }] },
  { id: 'c55', submissionId: 's192', assessorId: 't4', status: 'Pending', assignedTo: 't6' },
  { id: 'c56', submissionId: 's195', assessorId: 't4', status: 'Pending' },
  { id: 'c57', submissionId: 's200', assessorId: 't4', status: 'Pending', assignedTo: 't2' },
  { id: 'c58', submissionId: 's205', assessorId: 't4', status: 'Approved', reviewerName: 'David Kumar', reviewedAt: '1 Mar 2026, 14:30', outcomeType: 'approved', assignedTo: 't4' },
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
    const prev = overrides[id] ?? {};
    if (update.outcomeType && update.reviewerName && update.reviewedAt) {
      const existing: IqaReviewRound[] = prev.reviewHistory ?? [];
      const nextVersion = existing.length + 1;
      existing.push({
        version: nextVersion,
        reviewerName: update.reviewerName,
        reviewedAt: update.reviewedAt,
        outcome: update.outcomeType,
        feedback: update.feedback ?? '',
      });
      update.reviewHistory = existing;
    }
    overrides[id] = { ...prev, ...update };
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
