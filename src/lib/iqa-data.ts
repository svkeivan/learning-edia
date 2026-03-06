export type IqaCheckStatus = 'Pending' | 'Approved' | 'Rejected';
export type IqaRiskLevel = 'Low' | 'Medium' | 'High';

export interface IqaCategory {
  id: string;
  name: string;
  recheckPercent: number;
  riskLevel: IqaRiskLevel;
  /** Max active rechecks a single reviewer in this category can handle */
  rechecksPerReviewer: number;
}

export interface IqaTutor {
  id: string;
  name: string;
  email: string;
  categoryId: string;
}

export interface IqaCheck {
  id: string;
  submissionId: string;
  tutorId: string;
  status: IqaCheckStatus;
  reviewerName?: string;
  reviewedAt?: string;
  feedback?: string;
  /** Tutor assigned to review (for manual assignment) */
  assignedTo?: string;
}

const IQA_CHECKS_STORAGE_KEY = 'iqa-checks-overrides';
const IQA_ADDED_CHECKS_KEY = 'iqa-added-checks';
const IQA_CATEGORIES_STORAGE_KEY = 'iqa-categories-overrides';
const IQA_TUTORS_STORAGE_KEY = 'iqa-tutors-overrides';
const IQA_ADDED_TUTORS_KEY = 'iqa-added-tutors';

const iqaCategoriesBase: IqaCategory[] = [
  { id: 'cat1', name: 'Low Risk', recheckPercent: 10, riskLevel: 'Low', rechecksPerReviewer: 20 },
  { id: 'cat2', name: 'Medium Risk', recheckPercent: 25, riskLevel: 'Medium', rechecksPerReviewer: 12 },
  { id: 'cat3', name: 'High Risk', recheckPercent: 50, riskLevel: 'High', rechecksPerReviewer: 6 },
];

function getCategoryOverrides(): Record<string, Partial<IqaCategory>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(IQA_CATEGORIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getTutorOverrides(): Record<string, Partial<IqaTutor>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(IQA_TUTORS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const ADDED_CATEGORIES_KEY = 'iqa-added-categories';

export function getIqaCategories(): IqaCategory[] {
  const overrides = getCategoryOverrides();
  const base = iqaCategoriesBase.map(c => ({ ...c, ...overrides[c.id] }));
  if (typeof window === 'undefined') return base;
  try {
    const raw = sessionStorage.getItem(ADDED_CATEGORIES_KEY);
    const added: IqaCategory[] = raw ? JSON.parse(raw) : [];
    return [...base, ...added];
  } catch {
    return base;
  }
}

export function addIqaCategory(category: IqaCategory) {
  if (typeof window === 'undefined') return;
  try {
    const raw = sessionStorage.getItem(ADDED_CATEGORIES_KEY);
    const added: IqaCategory[] = raw ? JSON.parse(raw) : [];
    added.push(category);
    sessionStorage.setItem(ADDED_CATEGORIES_KEY, JSON.stringify(added));
    window.dispatchEvent(new CustomEvent('iqa-categories-updated'));
  } catch {
    // ignore
  }
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
  } catch {
    // ignore
  }
}

export function getIqaTutors(): IqaTutor[] {
  const overrides = getTutorOverrides();
  const base = iqaTutorsBase.map(t => ({ ...t, ...overrides[t.id] }));
  if (typeof window === 'undefined') return base;
  try {
    const raw = sessionStorage.getItem(IQA_ADDED_TUTORS_KEY);
    const added: IqaTutor[] = raw ? JSON.parse(raw) : [];
    return [...base, ...added.map(t => ({ ...t, ...overrides[t.id] }))];
  } catch {
    return base;
  }
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
  } catch {
    return '';
  }
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
  } catch {
    // ignore
  }
}

export const iqaCategories: IqaCategory[] = iqaCategoriesBase;

const iqaTutorsBase: IqaTutor[] = [
  { id: 't1', name: 'Sarah Mitchell', email: 's.mitchell@lms.co.uk', categoryId: 'cat1' },
  { id: 't2', name: 'James Chen', email: 'j.chen@lms.co.uk', categoryId: 'cat1' },
  { id: 't3', name: 'Emma Watson', email: 'e.watson@lms.co.uk', categoryId: 'cat2' },
  { id: 't4', name: 'David Kumar', email: 'd.kumar@lms.co.uk', categoryId: 'cat2' },
  { id: 't5', name: 'Lisa Park', email: 'l.park@lms.co.uk', categoryId: 'cat3' },
  { id: 't6', name: 'Tom Bradley', email: 't.bradley@lms.co.uk', categoryId: 'cat3' },
];

export const iqaTutors: IqaTutor[] = iqaTutorsBase;

export const iqaChecksBase: IqaCheck[] = [
  { id: 'c1', submissionId: 's7', tutorId: 't3', status: 'Pending' },
  { id: 'c2', submissionId: 's8', tutorId: 't4', status: 'Pending' },
  { id: 'c3', submissionId: 's9', tutorId: 't1', status: 'Approved', reviewerName: 'Admin User', reviewedAt: '14 Feb 2026, 11:30' },
  { id: 'c4', submissionId: 's12', tutorId: 't4', status: 'Pending' },
  { id: 'c5', submissionId: 's13', tutorId: 't5', status: 'Rejected', reviewerName: 'Admin User', reviewedAt: '13 Feb 2026, 15:00', feedback: 'Insufficient detail in marking criteria application.' },
  { id: 'c6', submissionId: 's14', tutorId: 't5', status: 'Pending' },
  { id: 'c7', submissionId: 's16', tutorId: 't6', status: 'Approved', reviewerName: 'Admin User', reviewedAt: '16 Feb 2026, 14:20' },
  { id: 'c8', submissionId: 's17', tutorId: 't6', status: 'Pending' },
];

function getOverrides(): Record<string, Partial<IqaCheck>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(IQA_CHECKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function updateIqaCheck(id: string, update: Partial<IqaCheck>) {
  if (typeof window === 'undefined') return;
  try {
    const overrides = getOverrides();
    overrides[id] = { ...overrides[id], ...update };
    sessionStorage.setItem(IQA_CHECKS_STORAGE_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent('iqa-checks-updated'));
  } catch {
    // ignore
  }
}

export function getIqaChecks(): IqaCheck[] {
  const overrides = getOverrides();
  const base = iqaChecksBase.map(c => ({ ...c, ...overrides[c.id] }));
  if (typeof window === 'undefined') return base;
  try {
    const raw = sessionStorage.getItem(IQA_ADDED_CHECKS_KEY);
    const added: IqaCheck[] = raw ? JSON.parse(raw) : [];
    return [...base, ...added.map(c => ({ ...c, ...overrides[c.id] }))];
  } catch {
    return base;
  }
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
  } catch {
    return '';
  }
}

export const iqaChecks: IqaCheck[] = iqaChecksBase;

// ── Workload & auto-assignment ─────────────────────────────────────────────

export interface ReviewerWorkload {
  tutor: IqaTutor;
  category: IqaCategory | undefined;
  activeCount: number;
  capacity: number;
  remaining: number;
}

export function getReviewerWorkloads(): ReviewerWorkload[] {
  const checks = getIqaChecks();
  const tutors = getIqaTutors();
  const categories = getIqaCategories();

  return tutors.map(t => {
    const category = categories.find(c => c.id === t.categoryId);
    const capacity = category?.rechecksPerReviewer ?? 10;
    const activeCount = checks.filter(
      c => c.assignedTo === t.id && c.status === 'Pending',
    ).length;
    return { tutor: t, category, activeCount, capacity, remaining: capacity - activeCount };
  });
}

/**
 * Picks a reviewer automatically based on:
 * 1. Cannot be the same tutor who graded the submission
 * 2. Must have remaining capacity (pending rechecks < rechecksPerReviewer)
 * 3. Picks the reviewer with the most remaining capacity (load-balanced)
 * 4. Ties broken randomly
 */
export function autoAssignReviewer(gradedByTutorId: string): string | null {
  const workloads = getReviewerWorkloads();
  const eligible = workloads
    .filter(w => w.tutor.id !== gradedByTutorId && w.remaining > 0)
    .sort((a, b) => b.remaining - a.remaining);

  if (eligible.length === 0) return null;

  const maxRemaining = eligible[0].remaining;
  const topTier = eligible.filter(w => w.remaining === maxRemaining);
  const pick = topTier[Math.floor(Math.random() * topTier.length)];
  return pick.tutor.id;
}
