import { qualifications, knowledgeUnits } from './mock-data';
import type { Qualification, KnowledgeUnit } from './mock-data';

// ── Types ──────────────────────────────────────────────────────────────────

export type IqaRole = 'Controller' | 'Assessor';
export type ExperienceLevel = 'New' | 'Experienced';
export type AssessmentMode = 'Theory' | 'Practical';
export type CandidateStage = 'Attendance' | 'Completion' | 'Pass';
export type SamplingPlanStatus = 'Draft' | 'Active' | 'Completed';
export type CohortStatus = 'In Progress' | 'Approved' | 'Referred';
export type ActualSamplingStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface Center {
  id: string;
  name: string;
  location: string;
}

export interface IqaPersonnel {
  id: string;
  name: string;
  email: string;
  role: IqaRole;
  centerId: string;
  experience: ExperienceLevel;
}

export interface Cohort {
  id: string;
  name: string;
  qualificationId: string;
  candidateIds: string[];
  assessorId: string;
  status: CohortStatus;
}

export interface SamplingEntry {
  id: string;
  candidateId: string;
  candidateName: string;
  knowledgeUnitId: string;
  assessmentMode: AssessmentMode;
  stage: CandidateStage;
}

export interface SamplingPlan {
  id: string;
  qualificationId: string;
  assessorId: string;
  iqaAssessorId: string;
  controllerId: string;
  cohortId?: string;
  status: SamplingPlanStatus;
  createdAt: string;
  proposedEntries: SamplingEntry[];
  actualEntries: SamplingEntry[];
  notes?: string;
}

// ── Static data ────────────────────────────────────────────────────────────

export const centers: Center[] = [
  { id: 'ctr1', name: 'London Central', location: 'London' },
  { id: 'ctr2', name: 'Manchester North', location: 'Manchester' },
  { id: 'ctr3', name: 'Birmingham West', location: 'Birmingham' },
];

export const iqaPersonnel: IqaPersonnel[] = [
  { id: 'iqa1', name: 'Helen Rogers', email: 'h.rogers@lms.co.uk', role: 'Controller', centerId: 'ctr1', experience: 'Experienced' },
  { id: 'iqa2', name: 'Mark Stevens', email: 'm.stevens@lms.co.uk', role: 'Assessor', centerId: 'ctr2', experience: 'Experienced' },
  { id: 'iqa3', name: 'Fiona Clarke', email: 'f.clarke@lms.co.uk', role: 'Assessor', centerId: 'ctr3', experience: 'Experienced' },
  { id: 'iqa4', name: 'Ryan Hughes', email: 'r.hughes@lms.co.uk', role: 'Assessor', centerId: 'ctr1', experience: 'New' },
  { id: 'iqa5', name: 'Priya Sharma', email: 'p.sharma@lms.co.uk', role: 'Controller', centerId: 'ctr2', experience: 'Experienced' },
];

export const assessors: { id: string; name: string; centerId: string; experience: ExperienceLevel }[] = [
  { id: 'asr1', name: 'Sarah Mitchell', centerId: 'ctr1', experience: 'Experienced' },
  { id: 'asr2', name: 'James Chen', centerId: 'ctr1', experience: 'New' },
  { id: 'asr3', name: 'Emma Watson', centerId: 'ctr2', experience: 'Experienced' },
  { id: 'asr4', name: 'David Kumar', centerId: 'ctr3', experience: 'New' },
  { id: 'asr5', name: 'Lisa Park', centerId: 'ctr2', experience: 'Experienced' },
  { id: 'asr6', name: 'Tom Bradley', centerId: 'ctr3', experience: 'Experienced' },
];

export const cohorts: Cohort[] = [
  {
    id: 'coh1',
    name: 'Gas Jan 2026 — Cohort A',
    qualificationId: 'q1',
    candidateIds: ['st1', 'st2', 'st3'],
    assessorId: 'asr1',
    status: 'In Progress',
  },
  {
    id: 'coh2',
    name: 'Gas Jan 2026 — Cohort B',
    qualificationId: 'q1',
    candidateIds: ['st4', 'st5', 'st6'],
    assessorId: 'asr2',
    status: 'In Progress',
  },
  {
    id: 'coh3',
    name: 'Electrical Feb 2026',
    qualificationId: 'q2',
    candidateIds: ['st7', 'st8', 'st9', 'st10'],
    assessorId: 'asr3',
    status: 'In Progress',
  },
  {
    id: 'coh4',
    name: 'Plumbing Feb 2026',
    qualificationId: 'q3',
    candidateIds: ['st11', 'st12', 'st13'],
    assessorId: 'asr5',
    status: 'In Progress',
  },
];

const candidateNames: Record<string, string> = {
  st1: 'James Wilson', st2: 'Sarah Ahmed', st3: 'Mike Chen',
  st4: 'Emma Thompson', st5: 'David Park', st6: 'Lisa Rodriguez',
  st7: 'Tom Baker', st8: 'Anna Smith', st9: 'Carlos Diaz', st10: 'Priya Patel',
  st11: 'Omar Hassan', st12: 'Nina Kowalski', st13: 'Liam Murphy',
};

function buildProposedEntries(
  candidateIds: string[],
  qualificationId: string,
  assessorExperience: ExperienceLevel,
): SamplingEntry[] {
  const qual = qualifications.find(q => q.id === qualificationId);
  if (!qual) return [];

  const kus = qual.knowledgeUnitIds
    .map(id => knowledgeUnits.find(k => k.id === id))
    .filter((k): k is KnowledgeUnit => !!k);

  const entries: SamplingEntry[] = [];
  const sampleRate = assessorExperience === 'New' ? 1.0 : 0.4;
  const candidateSample = candidateIds.slice(0, Math.max(1, Math.ceil(candidateIds.length * sampleRate)));

  let entryIdx = 0;
  for (const cid of candidateSample) {
    for (const ku of kus) {
      if (ku.theoryAssessments > 0) {
        entries.push({
          id: `se-${entryIdx++}`,
          candidateId: cid,
          candidateName: candidateNames[cid] ?? cid,
          knowledgeUnitId: ku.id,
          assessmentMode: 'Theory',
          stage: 'Completion',
        });
      }
      if (ku.practicalAssessments > 0) {
        entries.push({
          id: `se-${entryIdx++}`,
          candidateId: cid,
          candidateName: candidateNames[cid] ?? cid,
          knowledgeUnitId: ku.id,
          assessmentMode: 'Practical',
          stage: 'Attendance',
        });
      }
      if (ku.theoryAssessments === 0 && ku.practicalAssessments === 0 && ku.activities > 0) {
        entries.push({
          id: `se-${entryIdx++}`,
          candidateId: cid,
          candidateName: candidateNames[cid] ?? cid,
          knowledgeUnitId: ku.id,
          assessmentMode: 'Theory',
          stage: 'Completion',
        });
      }
    }
  }
  return entries;
}

const gasAssessor = assessors.find(a => a.id === 'asr1')!;
const gasNewAssessor = assessors.find(a => a.id === 'asr2')!;
const elecAssessor = assessors.find(a => a.id === 'asr3')!;
const plumbAssessor = assessors.find(a => a.id === 'asr5')!;

const plan1Proposed = buildProposedEntries(cohorts[0].candidateIds, 'q1', gasAssessor.experience);
const plan2Proposed = buildProposedEntries(cohorts[1].candidateIds, 'q1', gasNewAssessor.experience);
const plan3Proposed = buildProposedEntries(cohorts[2].candidateIds, 'q2', elecAssessor.experience);
const plan4Proposed = buildProposedEntries(cohorts[3].candidateIds, 'q3', plumbAssessor.experience);

export const samplingPlansBase: SamplingPlan[] = [
  {
    id: 'sp1',
    qualificationId: 'q1',
    assessorId: 'asr1',
    iqaAssessorId: 'iqa2',
    controllerId: 'iqa1',
    cohortId: 'coh1',
    status: 'Active',
    createdAt: '20 Jan 2026',
    proposedEntries: plan1Proposed,
    actualEntries: plan1Proposed.slice(0, Math.ceil(plan1Proposed.length * 0.6)).map(e => ({ ...e, stage: 'Pass' as CandidateStage })),
    notes: 'Experienced assessor — 40% candidate sampling across all units.',
  },
  {
    id: 'sp2',
    qualificationId: 'q1',
    assessorId: 'asr2',
    iqaAssessorId: 'iqa4',
    controllerId: 'iqa1',
    cohortId: 'coh2',
    status: 'Active',
    createdAt: '21 Jan 2026',
    proposedEntries: plan2Proposed,
    actualEntries: plan2Proposed.map(e => ({ ...e, stage: 'Completion' as CandidateStage })),
    notes: 'New assessor — 100% candidate coverage required for all units.',
  },
  {
    id: 'sp3',
    qualificationId: 'q2',
    assessorId: 'asr3',
    iqaAssessorId: 'iqa3',
    controllerId: 'iqa5',
    cohortId: 'coh3',
    status: 'Active',
    createdAt: '1 Feb 2026',
    proposedEntries: plan3Proposed,
    actualEntries: plan3Proposed.slice(0, 1).map(e => ({ ...e, stage: 'Attendance' as CandidateStage })),
  },
  {
    id: 'sp4',
    qualificationId: 'q3',
    assessorId: 'asr5',
    iqaAssessorId: 'iqa2',
    controllerId: 'iqa5',
    cohortId: 'coh4',
    status: 'Draft',
    createdAt: '5 Feb 2026',
    proposedEntries: plan4Proposed,
    actualEntries: [],
    notes: 'Awaiting controller approval before IQA begins.',
  },
];

// ── Runtime state (sessionStorage) ─────────────────────────────────────────

const SP_OVERRIDES_KEY = 'iqa-sampling-overrides';
const SP_ADDED_KEY = 'iqa-sampling-added';
const COHORT_OVERRIDES_KEY = 'iqa-cohort-overrides';

function getSpOverrides(): Record<string, Partial<SamplingPlan>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(SP_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function getCohortOverrides(): Record<string, Partial<Cohort>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(COHORT_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function getSamplingPlans(): SamplingPlan[] {
  const overrides = getSpOverrides();
  const base = samplingPlansBase.map(sp => ({ ...sp, ...overrides[sp.id] }));
  if (typeof window === 'undefined') return base;
  try {
    const raw = sessionStorage.getItem(SP_ADDED_KEY);
    const added: SamplingPlan[] = raw ? JSON.parse(raw) : [];
    return [...base, ...added.map(sp => ({ ...sp, ...overrides[sp.id] }))];
  } catch { return base; }
}

export function updateSamplingPlan(id: string, update: Partial<SamplingPlan>) {
  if (typeof window === 'undefined') return;
  try {
    const overrides = getSpOverrides();
    overrides[id] = { ...overrides[id], ...update };
    sessionStorage.setItem(SP_OVERRIDES_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent('iqa-sampling-updated'));
  } catch { /* ignore */ }
}

export function addSamplingPlan(plan: Omit<SamplingPlan, 'id'> & { id?: string }): string {
  if (typeof window === 'undefined') return '';
  try {
    const id = plan.id ?? 'sp-' + Date.now();
    const newPlan = { ...plan, id };
    const raw = sessionStorage.getItem(SP_ADDED_KEY);
    const added: SamplingPlan[] = raw ? JSON.parse(raw) : [];
    added.push(newPlan as SamplingPlan);
    sessionStorage.setItem(SP_ADDED_KEY, JSON.stringify(added));
    window.dispatchEvent(new CustomEvent('iqa-sampling-updated'));
    return id;
  } catch { return ''; }
}

export function getCohorts(): Cohort[] {
  const overrides = getCohortOverrides();
  return cohorts.map(c => ({ ...c, ...overrides[c.id] }));
}

export function updateCohort(id: string, update: Partial<Cohort>) {
  if (typeof window === 'undefined') return;
  try {
    const overrides = getCohortOverrides();
    overrides[id] = { ...overrides[id], ...update };
    sessionStorage.setItem(COHORT_OVERRIDES_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent('iqa-sampling-updated'));
  } catch { /* ignore */ }
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function getPersonnelByRole(role: IqaRole): IqaPersonnel[] {
  return iqaPersonnel.filter(p => p.role === role);
}

export function getAssessorsForQualification(qualificationId: string): typeof assessors {
  const plans = getSamplingPlans();
  const assessorIds = plans
    .filter(p => p.qualificationId === qualificationId)
    .map(p => p.assessorId);
  return assessors.filter(a => assessorIds.includes(a.id));
}

export function computeSamplingCoverage(plan: SamplingPlan) {
  const proposed = plan.proposedEntries.length;
  const actual = plan.actualEntries.length;
  return {
    proposed,
    actual,
    percent: proposed > 0 ? Math.round((actual / proposed) * 100) : 0,
    exceeded: actual > proposed,
  };
}
