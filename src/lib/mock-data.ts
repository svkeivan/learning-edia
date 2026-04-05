export type AssessmentType = 'Multiple Choice' | 'Short Answer' | 'Mixed' | 'File Upload';
export type AssessmentStatus = 'Active' | 'Draft' | 'Archived';
export type SubmissionStatus = 'Pass' | 'Fail' | 'Grading' | 'Not Started';
export type RPLStatus = 'Pending' | 'Accepted' | 'Rejected';
export type KnowledgeUnitStatus = 'Active' | 'Inactive';

export interface KnowledgeUnit {
  id: string;
  name: string;
  relatedCourse: string;
  activities: number;
  theoryAssessments: number;
  practicalAssessments: number;
  status: KnowledgeUnitStatus;
}

export interface Qualification {
  id: string;
  name: string;
  description: string;
  knowledgeUnitIds: string[];
  status: 'Active' | 'Draft';
  createdAt: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Unmarked';

// ─── ASSESSMENTS ────────────────────────────────────────────────────────────

export interface Assessment {
  id: string;
  title: string;
  type: AssessmentType;
  module: string;
  trade: 'Gas Engineering' | 'Electrical' | 'Plumbing';
  status: AssessmentStatus;
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingGrading: number;
  passRate: number;
  avgScore: number;
  passMark: number;
  dueDate: string;
  createdAt: string;
  questionCount: number;
}

export const assessments: Assessment[] = [
  {
    id: 'a1',
    title: 'Gas Safety Fundamentals Quiz',
    type: 'Multiple Choice',
    module: 'Gas Safety Basics',
    trade: 'Gas Engineering',
    status: 'Active',
    totalSubmissions: 24,
    gradedSubmissions: 24,
    pendingGrading: 0,
    passRate: 87,
    avgScore: 79,
    passMark: 70,
    dueDate: '28 Feb 2026',
    createdAt: '15 Jan 2026',
    questionCount: 20,
  },
  {
    id: 'a2',
    title: 'Electrical Safety Regulations Exam',
    type: 'Mixed',
    module: 'Electrical Safety Regulations',
    trade: 'Electrical',
    status: 'Active',
    totalSubmissions: 18,
    gradedSubmissions: 12,
    pendingGrading: 6,
    passRate: 72,
    avgScore: 68,
    passMark: 65,
    dueDate: '5 Mar 2026',
    createdAt: '20 Jan 2026',
    questionCount: 25,
  },
  {
    id: 'a3',
    title: 'Plumbing Standards Assessment',
    type: 'Mixed',
    module: 'Pipe Fittings',
    trade: 'Plumbing',
    status: 'Active',
    totalSubmissions: 15,
    gradedSubmissions: 9,
    pendingGrading: 6,
    passRate: 80,
    avgScore: 74,
    passMark: 70,
    dueDate: '10 Mar 2026',
    createdAt: '25 Jan 2026',
    questionCount: 18,
  },
  {
    id: 'a4',
    title: 'Health & Safety Induction Quiz',
    type: 'Multiple Choice',
    module: 'Gas Combustion Principles',
    trade: 'Gas Engineering',
    status: 'Active',
    totalSubmissions: 30,
    gradedSubmissions: 30,
    pendingGrading: 0,
    passRate: 93,
    avgScore: 85,
    passMark: 70,
    dueDate: '20 Feb 2026',
    createdAt: '10 Jan 2026',
    questionCount: 15,
  },
  {
    id: 'a5',
    title: 'Circuit Analysis Test',
    type: 'Mixed',
    module: 'Circuit Analysis',
    trade: 'Electrical',
    status: 'Active',
    totalSubmissions: 20,
    gradedSubmissions: 15,
    pendingGrading: 5,
    passRate: 75,
    avgScore: 71,
    passMark: 70,
    dueDate: '15 Mar 2026',
    createdAt: '1 Feb 2026',
    questionCount: 22,
  },
  {
    id: 'a6',
    title: 'Hydraulics Fundamentals Quiz',
    type: 'Multiple Choice',
    module: 'Hydraulics Fundamentals',
    trade: 'Plumbing',
    status: 'Active',
    totalSubmissions: 16,
    gradedSubmissions: 16,
    pendingGrading: 0,
    passRate: 81,
    avgScore: 73,
    passMark: 70,
    dueDate: '1 Apr 2026',
    createdAt: '10 Feb 2026',
    questionCount: 16,
  },
  {
    id: 'a7',
    title: 'Gas Appliance Installation Test',
    type: 'Mixed',
    module: 'Gas Appliance Installation',
    trade: 'Gas Engineering',
    status: 'Active',
    totalSubmissions: 15,
    gradedSubmissions: 15,
    pendingGrading: 0,
    passRate: 80,
    avgScore: 74,
    passMark: 70,
    dueDate: '28 Feb 2026',
    createdAt: '1 Feb 2026',
    questionCount: 20,
  },
  {
    id: 'a8',
    title: 'Electrical Wiring Practical',
    type: 'File Upload',
    module: 'Wiring Regulations (BS 7671)',
    trade: 'Electrical',
    status: 'Active',
    totalSubmissions: 38,
    gradedSubmissions: 38,
    pendingGrading: 0,
    passRate: 74,
    avgScore: 70,
    passMark: 65,
    dueDate: '15 Mar 2026',
    createdAt: '5 Feb 2026',
    questionCount: 15,
  },
  {
    id: 'a9',
    title: 'Plumbing Practical Assessment',
    type: 'Mixed',
    module: 'Pipe Joining Techniques',
    trade: 'Plumbing',
    status: 'Active',
    totalSubmissions: 16,
    gradedSubmissions: 16,
    pendingGrading: 0,
    passRate: 75,
    avgScore: 72,
    passMark: 70,
    dueDate: '10 Mar 2026',
    createdAt: '12 Feb 2026',
    questionCount: 18,
  },
];

// ─── COHORTS & SUBMISSIONS ───────────────────────────────────────────────────

export type AnswerItem =
  | { type: 'mc' | 'text'; question: string; answer: string }
  | { type: 'file'; fileName: string; fileType: 'PDF'; size?: string };

export interface StudentSubmission {
  id: string;
  assessmentId: string;
  student: string;
  email: string;
  submittedAt: string;
  score: number | null;
  status: SubmissionStatus;
  attemptNumber: number;
  timeTaken: string;
  answers?: AnswerItem[];
  gradedBy?: string;
}

export interface Cohort {
  id: string;
  name: string;
  trade: 'Gas Engineering' | 'Electrical' | 'Plumbing';
  assessorId: string;
  /** Lead IQA reviewer responsible for this cohort’s system review queue */
  iqaReviewerId?: string;
  examIds: string[];
  examDates: string[];
  packageName: string;
  students: { name: string; email: string }[];
  iqaSentDate?: string;
  lastUpdatedAt?: string;
}

export const cohorts: Cohort[] = [
  {
    id: 'coh1',
    name: 'London-Room3A-10Feb26',
    trade: 'Gas Engineering',
    assessorId: 't1',
    iqaReviewerId: 't2',
    examIds: ['a1', 'a4', 'a7'],
    examDates: ['10 Feb 2026', '12 Feb 2026', '14 Feb 2026'],
    packageName: 'Professional Gas Engineer',
    students: [
      { name: 'James Wilson', email: 'j.wilson@email.com' },
      { name: 'Sarah Ahmed', email: 's.ahmed@email.com' },
      { name: 'Mike Chen', email: 'm.chen@email.com' },
      { name: 'Emma Thompson', email: 'e.thompson@email.com' },
      { name: 'David Park', email: 'd.park@email.com' },
      { name: 'Lisa Rodriguez', email: 'l.rodriguez@email.com' },
      { name: 'Hannah Davies', email: 'h.davies@email.com' },
      { name: 'Ryan O\'Brien', email: 'r.obrien@email.com' },
      { name: 'Zara Khan', email: 'z.khan@email.com' },
      { name: 'Marcus Johnson', email: 'm.johnson@email.com' },
      { name: 'Sophie Turner', email: 's.turner@email.com' },
      { name: 'Jake Morris', email: 'j.morris@email.com' },
      { name: 'Aisha Begum', email: 'a.begum@email.com' },
      { name: 'Connor Walsh', email: 'c.walsh@email.com' },
      { name: 'Megan Lloyd', email: 'm.lloyd@email.com' },
    ],
    iqaSentDate: '15 Feb 2026',
  },
  {
    id: 'coh2',
    name: 'Manchester-Lab1-03Feb26',
    trade: 'Electrical',
    assessorId: 't3',
    iqaReviewerId: 't2',
    examIds: ['a2', 'a5', 'a8'],
    examDates: ['3 Feb 2026', '5 Feb 2026', '7 Feb 2026'],
    packageName: 'Professional Electrician',
    students: [
      { name: 'Tom Baker', email: 't.baker@email.com' },
      { name: 'Anna Smith', email: 'a.smith@email.com' },
      { name: 'Carlos Diaz', email: 'c.diaz@email.com' },
      { name: 'Priya Patel', email: 'p.patel@email.com' },
      { name: 'Ben Thomas', email: 'b.thomas@email.com' },
      { name: 'Rachel Green', email: 'r.green@email.com' },
      { name: 'Liam Hughes', email: 'l.hughes@email.com' },
      { name: 'Chloe Bennett', email: 'c.bennett@email.com' },
      { name: 'Tariq Mahmood', email: 't.mahmood@email.com' },
      { name: 'Fiona Campbell', email: 'f.campbell@email.com' },
      { name: 'Kyle Rogers', email: 'k.rogers@email.com' },
      { name: 'Natasha Ivanova', email: 'n.ivanova@email.com' },
      { name: 'George Palmer', email: 'g.palmer@email.com' },
      { name: 'Amelia Foster', email: 'a.foster@email.com' },
      { name: 'Hassan Ali', email: 'h.ali@email.com' },
      { name: 'Jade Williams', email: 'j.williams@email.com' },
      { name: 'Oliver Brooks', email: 'o.brooks@email.com' },
      { name: 'Ella Sharma', email: 'e.sharma@email.com' },
    ],
    iqaSentDate: '8 Feb 2026',
  },
  {
    id: 'coh3',
    name: 'Birmingham-WorkshopB-17Feb26',
    trade: 'Plumbing',
    assessorId: 't5',
    iqaReviewerId: 't6',
    examIds: ['a3', 'a6', 'a9'],
    examDates: ['17 Feb 2026', '19 Feb 2026', '21 Feb 2026'],
    packageName: 'Master Plumber Bundle',
    students: [
      { name: 'Omar Hassan', email: 'o.hassan@email.com' },
      { name: 'Nina Kowalski', email: 'n.kowalski@email.com' },
      { name: 'Liam Murphy', email: 'l.murphy@email.com' },
      { name: 'Sofia Martins', email: 's.martins@email.com' },
      { name: 'Daniel Okafor', email: 'd.okafor@email.com' },
      { name: 'Yuki Tanaka', email: 'y.tanaka@email.com' },
      { name: 'Freya Anderson', email: 'f.anderson@email.com' },
      { name: 'Max Hartley', email: 'm.hartley@email.com' },
      { name: 'Leila Nazari', email: 'l.nazari@email.com' },
      { name: 'Tyler Evans', email: 't.evans@email.com' },
      { name: 'Grace Maguire', email: 'g.maguire@email.com' },
      { name: 'Kai Watanabe', email: 'k.watanabe@email.com' },
      { name: 'Amy Brennan', email: 'a.brennan@email.com' },
      { name: 'Lucas Silva', email: 'l.silva@email.com' },
      { name: 'Hannah McKenzie', email: 'h.mckenzie@email.com' },
      { name: 'Toby Fletcher', email: 't.fletcher@email.com' },
    ],
    iqaSentDate: '22 Feb 2026',
  },
  {
    id: 'coh4',
    name: 'Leeds-Room2B-24Feb26',
    trade: 'Electrical',
    assessorId: 't4',
    iqaReviewerId: 't1',
    examIds: ['a2', 'a5', 'a8'],
    examDates: ['24 Feb 2026', '26 Feb 2026', '28 Feb 2026'],
    packageName: 'Electrical Installer (Level 2)',
    students: [
      { name: 'Amina Khan', email: 'a.khan2@email.com' },
      { name: 'Charlie Fox', email: 'c.fox@email.com' },
      { name: 'Devi Ranganathan', email: 'd.ranganathan@email.com' },
      { name: 'Eve Robertson', email: 'e.robertson@email.com' },
      { name: 'Felix Zhao', email: 'f.zhao@email.com' },
      { name: 'Georgia Hall', email: 'g.hall@email.com' },
      { name: 'Harry Stone', email: 'h.stone@email.com' },
      { name: 'Isla Reeves', email: 'i.reeves@email.com' },
      { name: 'Jack Thornton', email: 'j.thornton@email.com' },
      { name: 'Katie Sullivan', email: 'k.sullivan@email.com' },
      { name: 'Leo Andersson', email: 'l.andersson@email.com' },
      { name: 'Maya Goldstein', email: 'm.goldstein@email.com' },
      { name: 'Noah Chambers', email: 'n.chambers@email.com' },
      { name: 'Olivia Cross', email: 'o.cross@email.com' },
      { name: 'Patrick Doyle', email: 'p.doyle@email.com' },
      { name: 'Quinn Zhang', email: 'q.zhang@email.com' },
      { name: 'Ruby Martin', email: 'r.martin@email.com' },
      { name: 'Sam Al-Rashid', email: 's.alrashid@email.com' },
      { name: 'Tara Connolly', email: 't.connolly@email.com' },
      { name: 'Will Henderson', email: 'w.henderson@email.com' },
    ],
    iqaSentDate: '2 Mar 2026',
  },
  {
    id: 'coh5',
    name: 'Bristol-Lab3-23Mar26',
    trade: 'Gas Engineering',
    assessorId: 't1',
    iqaReviewerId: 't2',
    examIds: ['a1', 'a4'],
    examDates: ['23 Mar 2026', '25 Mar 2026'],
    packageName: 'Gas Safety Foundation',
    iqaSentDate: '27 Mar 2026',
    students: [
      { name: 'Alex Murray', email: 'a.murray@email.com' },
      { name: 'Beth Sinclair', email: 'b.sinclair@email.com' },
      { name: 'Chris Doyle', email: 'c.doyle2@email.com' },
      { name: 'Diana Frost', email: 'd.frost@email.com' },
      { name: 'Ethan Graves', email: 'e.graves@email.com' },
      { name: 'Fiona Hart', email: 'f.hart@email.com' },
      { name: 'Gary Neville', email: 'g.neville@email.com' },
      { name: 'Holly Spencer', email: 'h.spencer@email.com' },
      { name: 'Ian Wallace', email: 'i.wallace@email.com' },
      { name: 'Jenny Marsh', email: 'j.marsh@email.com' },
    ],
  },
  {
    id: 'coh6',
    name: 'Newcastle-Suite1-02Apr26',
    trade: 'Gas Engineering',
    assessorId: 't1',
    iqaReviewerId: 't4',
    examIds: ['a4', 'a7'],
    examDates: ['2 Apr 2026', '4 Apr 2026'],
    packageName: 'Gas Engineer Fast Track',
    iqaSentDate: '5 Apr 2026',
    students: [
      { name: 'Pauline Watts', email: 'p.watts@email.com' },
      { name: 'Rajesh Menon', email: 'r.menon@email.com' },
      { name: 'Stacey Cole', email: 's.cole@email.com' },
      { name: 'Umar Farouk', email: 'u.farouk@email.com' },
      { name: 'Victoria Pike', email: 'v.pike@email.com' },
      { name: 'Wayne Booth', email: 'w.booth@email.com' },
      { name: 'Xara Lindqvist', email: 'x.lindqvist@email.com' },
      { name: 'Youssef Nasser', email: 'y.nasser@email.com' },
    ],
  },
  {
    id: 'coh7',
    name: 'Glasgow-Lab2-12Apr26',
    trade: 'Plumbing',
    assessorId: 't5',
    iqaReviewerId: 't2',
    examIds: ['a3', 'a9'],
    examDates: ['12 Apr 2026', '14 Apr 2026'],
    packageName: 'Plumbing Professional Plus',
    iqaSentDate: '16 Apr 2026',
    students: [
      { name: 'Aaron Blake', email: 'a.blake@email.com' },
      { name: 'Bianca Rose', email: 'b.rose@email.com' },
      { name: 'Craig Munro', email: 'c.munro@email.com' },
      { name: 'Donna Keith', email: 'd.keith@email.com' },
      { name: 'Ewan Fraser', email: 'e.fraser@email.com' },
      { name: 'Flora McLean', email: 'f.mclean@email.com' },
      { name: 'Gavin Reid', email: 'g.reid@email.com' },
      { name: 'Heather Boyd', email: 'h.boyd@email.com' },
      { name: 'Iona Stewart', email: 'i.stewart@email.com' },
      { name: 'Jamie Cowan', email: 'j.cowan@email.com' },
    ],
  },
  {
    id: 'coh8',
    name: 'Cardiff-Room1-08Apr26',
    trade: 'Electrical',
    assessorId: 't1',
    iqaReviewerId: 't1',
    examIds: ['a2', 'a5', 'a8'],
    examDates: ['8 Apr 2026', '10 Apr 2026', '12 Apr 2026'],
    packageName: 'Electrical Part P Refresher',
    iqaSentDate: '14 Apr 2026',
    students: [
      { name: 'Keira Moss', email: 'k.moss@email.com' },
      { name: 'Logan Pearce', email: 'l.pearce@email.com' },
      { name: 'Morgan Dale', email: 'm.dale@email.com' },
      { name: 'Niamh Boyle', email: 'n.boyle@email.com' },
      { name: 'Oscar Penn', email: 'o.penn@email.com' },
      { name: 'Poppy Crane', email: 'p.crane@email.com' },
      { name: 'Quentin Moss', email: 'q.moss2@email.com' },
      { name: 'Rhian Ellis', email: 'r.ellis@email.com' },
    ],
  },
  {
    id: 'coh9',
    name: 'Oxford-Room4A-18Apr26',
    trade: 'Gas Engineering',
    assessorId: 't1',
    iqaReviewerId: 't2',
    examIds: ['a1', 'a4'],
    examDates: ['18 Apr 2026', '20 Apr 2026'],
    packageName: 'Domestic Gas ACS Package',
    iqaSentDate: '22 Apr 2026',
    students: [
      { name: 'Adam Pryce', email: 'a.pryce.ox@email.com' },
      { name: 'Brooke Lane', email: 'b.lane.ox@email.com' },
      { name: 'Colin Marsh', email: 'c.marsh.ox@email.com' },
      { name: 'Darcy Webb', email: 'd.webb.ox@email.com' },
      { name: 'Elliot Nash', email: 'e.nash.ox@email.com' },
      { name: 'Freya Holt', email: 'f.holt.ox@email.com' },
    ],
  },
  {
    id: 'coh10',
    name: 'Liverpool-Lab4-22Apr26',
    trade: 'Electrical',
    assessorId: 't1',
    iqaReviewerId: 't6',
    examIds: ['a2', 'a8'],
    examDates: ['22 Apr 2026', '24 Apr 2026'],
    packageName: 'Electrician Career Starter',
    iqaSentDate: '26 Apr 2026',
    students: [
      { name: 'Gareth Pike', email: 'g.pike.lpl@email.com' },
      { name: 'Holly Dean', email: 'h.dean.lpl@email.com' },
      { name: 'Isaac Rowe', email: 'i.rowe.lpl@email.com' },
      { name: 'Jade Fox', email: 'j.fox.lpl@email.com' },
      { name: 'Kian Burke', email: 'k.burke.lpl@email.com' },
      { name: 'Lara Quinn', email: 'l.quinn.lpl@email.com' },
      { name: 'Milo Trent', email: 'm.trent.lpl@email.com' },
    ],
  },
  {
    id: 'coh11',
    name: 'Sheffield-WorkshopA-25Apr26',
    trade: 'Plumbing',
    assessorId: 't1',
    iqaReviewerId: 't4',
    examIds: ['a3', 'a6'],
    examDates: ['25 Apr 2026', '27 Apr 2026'],
    packageName: 'Advanced Plumbing Install',
    iqaSentDate: '29 Apr 2026',
    students: [
      { name: 'Nina Croft', email: 'n.croft.shf@email.com' },
      { name: 'Owen Dale', email: 'o.dale.shf@email.com' },
      { name: 'Piper Shaw', email: 'p.shaw.shf@email.com' },
      { name: 'Reece Vaughan', email: 'r.vaughan.shf@email.com' },
      { name: 'Sienna Cole', email: 's.cole.shf@email.com' },
    ],
  },
  {
    id: 'coh12',
    name: 'Southampton-Bay2-30Apr26',
    trade: 'Gas Engineering',
    assessorId: 't6',
    iqaReviewerId: 't1',
    examIds: ['a4', 'a7'],
    examDates: ['30 Apr 2026', '2 May 2026'],
    packageName: 'Commercial Gas Pathway',
    iqaSentDate: '4 May 2026',
    students: [
      { name: 'Theo Banks', email: 't.banks.sot@email.com' },
      { name: 'Una Price', email: 'u.price.sot@email.com' },
      { name: 'Vince Lowe', email: 'v.lowe.sot@email.com' },
      { name: 'Wren Miles', email: 'w.miles.sot@email.com' },
      { name: 'Xander Cole', email: 'x.cole.sot@email.com' },
      { name: 'Yasmin Kerr', email: 'y.kerr.sot@email.com' },
      { name: 'Zac Noble', email: 'z.noble.sot@email.com' },
    ],
  },
];

const _luOffsets: Record<string, number> = {
  coh1: 43 * 60_000, coh2: 3 * 3_600_000, coh3: 24 * 3_600_000,
  coh4: 4 * 86_400_000, coh5: 12 * 3_600_000, coh6: 25 * 60_000,
  coh7: 6 * 86_400_000, coh8: 2 * 86_400_000, coh9: 8 * 3_600_000,
  coh10: 3 * 86_400_000, coh11: 5 * 86_400_000, coh12: 1 * 3_600_000,
};
for (const _c of cohorts) {
  _c.lastUpdatedAt = new Date(Date.now() - (_luOffsets[_c.id] ?? 86_400_000)).toISOString();
}

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function generateSubmissions(): StudentSubmission[] {
  const subs: StudentSubmission[] = [];
  let counter = 1;
  const passMark: Record<string, number> = { a1:70, a2:65, a3:70, a4:70, a5:70, a6:70, a7:70, a8:65, a9:70 };

  for (let ci = 0; ci < cohorts.length; ci++) {
    const coh = cohorts[ci];
    for (let ei = 0; ei < coh.examIds.length; ei++) {
      const examId = coh.examIds[ei];
      const dateStr = coh.examDates[ei];
      const exam = assessments.find(a => a.id === examId);

      for (let si = 0; si < coh.students.length; si++) {
        const st = coh.students[si];
        const seed = (si * 17 + ei * 23 + ci * 31 + 5);
        const score = 52 + (seed % 43);
        const pm = passMark[examId] ?? 70;
        const hour = 9 + Math.floor(si / 4);
        const minute = (si * 12) % 60;
        const timeMins = 15 + (seed % 35);
        const fileName = `${(exam?.title ?? examId).replace(/\s+/g, '_')}_${st.name.replace(/\s+/g, '_')}.pdf`;

        subs.push({
          id: `s${counter}`,
          assessmentId: examId,
          student: st.name,
          email: st.email,
          submittedAt: `${dateStr}, ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
          score,
          status: score >= pm ? 'Pass' : 'Fail',
          attemptNumber: 1,
          timeTaken: `${timeMins} min`,
          gradedBy: coh.assessorId,
          answers: [{ type: 'file', fileName, fileType: 'PDF', size: '1.2 MB' }],
        });
        counter++;
      }
    }
  }
  return subs;
}

export const submissions: StudentSubmission[] = generateSubmissions();

/** Alternate graded attempts for the same student + assessment (IQA “select version”). */
const submissionVersionGroupIds: Record<string, string[]> = (() => {
  const s3 = submissions.find(s => s.id === 's3');
  if (s3 && !submissions.some(s => s.id === 's3-v2')) {
    submissions.push({
      ...s3,
      id: 's3-v2',
      attemptNumber: 2,
      submittedAt: '8 Feb 2026, 11:05',
      score: Math.min(100, (s3.score ?? 0) + 3),
      status: s3.status,
    });
  }

  const s46 = submissions.find(s => s.id === 's46');
  if (s46 && !submissions.some(s => s.id === 's46-v2')) {
    submissions.push({
      ...s46,
      id: 's46-v2',
      attemptNumber: 2,
      submittedAt: '2 Feb 2026, 14:20',
      score: Math.max(0, (s46.score ?? 0) - 5),
      status: 'Fail' as SubmissionStatus,
    });
  }

  const s100 = submissions.find(s => s.id === 's100');
  if (s100 && !submissions.some(s => s.id === 's100-v2')) {
    submissions.push({
      ...s100,
      id: 's100-v2',
      attemptNumber: 2,
      submittedAt: '16 Feb 2026, 10:30',
      score: Math.min(100, (s100.score ?? 0) + 5),
      status: s100.status,
    });
  }

  const s148 = submissions.find(s => s.id === 's148');
  if (s148 && !submissions.some(s => s.id === 's148-v2')) {
    submissions.push({
      ...s148,
      id: 's148-v2',
      attemptNumber: 2,
      submittedAt: '24 Feb 2026, 13:00',
      score: Math.min(100, (s148.score ?? 0) + 2),
      status: s148.status,
    });
  }

  return {
    s3: ['s3', 's3-v2'],
    s46: ['s46', 's46-v2'],
    s100: ['s100', 's100-v2'],
    s148: ['s148', 's148-v2'],
  };
})();

export function getExamDateForSubmission(email: string, assessmentId: string): string | undefined {
  const coh = findCohortForSubmission(email, assessmentId);
  if (!coh) return undefined;
  const idx = coh.examIds.indexOf(assessmentId);
  if (idx < 0) return undefined;
  return coh.examDates[idx];
}

/** Returns version options when this submission is part of a multi-attempt group (else empty). */
export function getSubmissionVersionOptions(submissionId: string): { id: string; label: string }[] {
  for (const ids of Object.values(submissionVersionGroupIds)) {
    if (ids.includes(submissionId)) {
      return ids.map((id, i) => ({
        id,
        label: i === ids.length - 1 ? `Attempt ${i + 1} (latest)` : `Attempt ${i + 1}`,
      }));
    }
  }
  return [];
}

// ─── STUDENT ENROLLMENTS ─────────────────────────────────────────────────────

export interface StudentEnrollment {
  email: string;
  package: string;
  trade: 'Gas Engineering' | 'Electrical' | 'Plumbing';
}

function generateEnrollments(): StudentEnrollment[] {
  const enrollments: StudentEnrollment[] = [];
  const seen = new Set<string>();
  for (const coh of cohorts) {
    for (const st of coh.students) {
      if (seen.has(st.email)) continue;
      seen.add(st.email);
      enrollments.push({ email: st.email, package: coh.packageName, trade: coh.trade });
    }
  }
  return enrollments;
}

export const studentEnrollments: StudentEnrollment[] = generateEnrollments();

export function getStudentPackage(email: string): string | undefined {
  return studentEnrollments.find(e => e.email === email)?.package;
}

const cohortByEmail = new Map<string, string>();
for (const coh of cohorts) {
  for (const st of coh.students) {
    cohortByEmail.set(st.email, coh.name);
  }
}

export function getStudentCohort(email: string): string | undefined {
  return cohortByEmail.get(email);
}

/** Cohort whose students and exams include this graded submission (for IQA routing). */
export function findCohortForSubmission(email: string, assessmentId: string): Cohort | undefined {
  return cohorts.find(
    c => c.students.some(s => s.email === email) && c.examIds.includes(assessmentId),
  );
}

export function parseSubmitDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === '-') return null;
  const match = dateStr.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (!match) return null;
  const mi = months.indexOf(match[2]);
  if (mi === -1) return null;
  return new Date(+match[3], mi, +match[1]);
}

// ─── RPL REQUESTS ────────────────────────────────────────────────────────────

export interface EvidenceDoc {
  name: string;
  type: 'PDF' | 'Word' | 'Image';
  size: string;
  uploadDate: string;
}

export interface RPLRequest {
  id: string;
  student: string;
  email: string;
  package: string;
  trade: 'Gas Engineering' | 'Electrical' | 'Plumbing';
  dateRequested: string;
  evidenceDocs: EvidenceDoc[];
  ao: string;
  status: RPLStatus;
  refId?: string;
  certId?: string;
  notes?: string;
}

export const rplRequests: RPLRequest[] = [
  {
    id: 'rpl1',
    student: 'Amina Khan',
    email: 'a.khan@email.com',
    package: 'Professional Electrician (RPL)',
    trade: 'Electrical',
    dateRequested: '10 Feb 2026',
    evidenceDocs: [
      { name: 'Electrical_Certificate_2019.pdf', type: 'PDF', size: '2.4 MB', uploadDate: '10 Feb 2026' },
      { name: 'Work_History_Amina.docx', type: 'Word', size: '0.8 MB', uploadDate: '10 Feb 2026' },
      { name: 'Reference_Letter.pdf', type: 'PDF', size: '1.2 MB', uploadDate: '11 Feb 2026' },
    ],
    ao: 'City & Guilds',
    status: 'Pending',
    notes: 'Has 5 years practical experience in industrial electrical installations.',
  },
  {
    id: 'rpl2',
    student: 'Omar Ali',
    email: 'o.ali@email.com',
    package: 'Starter Gas Engineer',
    trade: 'Gas Engineering',
    dateRequested: '28 Jan 2026',
    evidenceDocs: [
      { name: 'Gas_Safe_Certificate.pdf', type: 'PDF', size: '1.1 MB', uploadDate: '28 Jan 2026' },
    ],
    ao: 'NOCN',
    status: 'Accepted',
    refId: 'REF-2026-0017',
    certId: 'CERT-89421',
  },
  {
    id: 'rpl3',
    student: 'Sofia Martins',
    email: 's.martins@email.com',
    package: 'Master Plumber Bundle',
    trade: 'Plumbing',
    dateRequested: '12 Feb 2026',
    evidenceDocs: [
      { name: 'NVQ_Level3_Plumbing.pdf', type: 'PDF', size: '3.1 MB', uploadDate: '12 Feb 2026' },
      { name: 'Portfolio_Martins.pdf', type: 'PDF', size: '5.8 MB', uploadDate: '13 Feb 2026' },
    ],
    ao: 'EAL',
    status: 'Pending',
    notes: 'NVQ Level 3 qualified. Needs AO verification before acceptance.',
  },
  {
    id: 'rpl4',
    student: 'Daniel Okafor',
    email: 'd.okafor@email.com',
    package: 'Professional Gas Engineer (RPL)',
    trade: 'Gas Engineering',
    dateRequested: '5 Feb 2026',
    evidenceDocs: [
      { name: 'Previous_Qualification.pdf', type: 'PDF', size: '2.0 MB', uploadDate: '5 Feb 2026' },
      { name: 'Industry_Experience.docx', type: 'Word', size: '0.5 MB', uploadDate: '6 Feb 2026' },
    ],
    ao: 'City & Guilds',
    status: 'Rejected',
    notes: 'Evidence insufficient. Missing recent work history (within 5 years).',
  },
  {
    id: 'rpl5',
    student: 'Yuki Tanaka',
    email: 'y.tanaka@email.com',
    package: 'Professional Electrician (RPL)',
    trade: 'Electrical',
    dateRequested: '15 Feb 2026',
    evidenceDocs: [
      { name: 'Japan_Electrical_License.pdf', type: 'PDF', size: '1.7 MB', uploadDate: '15 Feb 2026' },
      { name: 'CV_Tanaka.pdf', type: 'PDF', size: '0.4 MB', uploadDate: '15 Feb 2026' },
    ],
    ao: 'NOCN',
    status: 'Pending',
  },
];

// ─── ATTENDANCE ──────────────────────────────────────────────────────────────

export interface AttendanceStudent {
  id: string;
  name: string;
  email: string;
  status: AttendanceStatus;
}

export interface AttendanceSession {
  id: string;
  label: string;
  date: string;
  time: string;
  room: string;
  /** What this scheduled session covers (shown in sidebar and detail). */
  description: string;
  /** exactly one of these will be true, or both false (= past) */
  isToday: boolean;
  isFuture: boolean;
  students: AttendanceStudent[];
}

export type SessionType = 'past' | 'today' | 'future';
export function sessionType(s: AttendanceSession): SessionType {
  if (s.isToday) return 'today';
  if (s.isFuture) return 'future';
  return 'past';
}

export type AttendanceEventType = 'In Person' | 'Webinar';

export interface AttendanceEvent {
  id: string;
  course: string;
  trade: 'Gas Engineering' | 'Electrical' | 'Plumbing';
  eventType: AttendanceEventType;
  dateRange: string;
  time: string;
  totalSessions: number;
  totalStudents: number;
  sessions: AttendanceSession[];
}

/** Determines the overall status of an event for list-view grouping */
export type EventGroup = 'today' | 'upcoming' | 'past';
export function eventGroup(e: AttendanceEvent): EventGroup {
  if (e.sessions.some(s => s.isToday)) return 'today';
  if (e.sessions.some(s => s.isFuture)) return 'upcoming';
  return 'past';
}

const gasStudents = [
  { id: 'st1', name: 'James Wilson', email: 'j.wilson@email.com' },
  { id: 'st2', name: 'Sarah Ahmed', email: 's.ahmed@email.com' },
  { id: 'st3', name: 'Mike Chen', email: 'm.chen@email.com' },
  { id: 'st4', name: 'Emma Thompson', email: 'e.thompson@email.com' },
  { id: 'st5', name: 'David Park', email: 'd.park@email.com' },
  { id: 'st6', name: 'Lisa Rodriguez', email: 'l.rodriguez@email.com' },
];

const circuitStudents = [
  { id: 'st7', name: 'Tom Baker', email: 't.baker@email.com' },
  { id: 'st8', name: 'Anna Smith', email: 'a.smith@email.com' },
  { id: 'st9', name: 'Carlos Diaz', email: 'c.diaz@email.com' },
  { id: 'st10', name: 'Priya Patel', email: 'p.patel@email.com' },
];

const plumbingStudents = [
  { id: 'st11', name: 'Omar Hassan', email: 'o.hassan@email.com' },
  { id: 'st12', name: 'Nina Kowalski', email: 'n.kowalski@email.com' },
  { id: 'st13', name: 'Liam Murphy', email: 'l.murphy@email.com' },
  { id: 'st14', name: 'Sofia Martins', email: 's.martins@email.com' },
];

export const attendanceEvents: AttendanceEvent[] = [
  // ── Past-only event ───────────────────────────────────────────────────────
  {
    id: 'ev0',
    course: 'Introduction to Gas Safety',
    trade: 'Gas Engineering',
    eventType: 'In Person',
    dateRange: '27 Jan – 14 Feb 2026',
    time: '09:00 – 17:00',
    totalSessions: 3,
    totalStudents: 6,
    sessions: [
      {
        id: 'ses0a', label: 'Session 1', date: 'Tue, 27 Jan 2026', time: '09:00 – 17:00', room: 'Room 1A',
        description: 'UK gas safety legislation, duty holders, and how classroom rules map to site behaviour.',
        isToday: false, isFuture: false,
        students: gasStudents.map(s => ({ ...s, status: s.id === 'st3' ? 'Absent' as AttendanceStatus : 'Present' as AttendanceStatus })),
      },
      {
        id: 'ses0b', label: 'Session 2', date: 'Tue, 4 Feb 2026', time: '09:00 – 17:00', room: 'Room 1A',
        description: 'Common gas hazards, emergency procedures, CO awareness, and correct use of PPE.',
        isToday: false, isFuture: false,
        students: gasStudents.map(s => ({ ...s, status: 'Present' as AttendanceStatus })),
      },
      {
        id: 'ses0c', label: 'Session 3', date: 'Fri, 14 Feb 2026', time: '09:00 – 17:00', room: 'Room 1A',
        description: 'Recap of key topics, practice questions, and guidance for the end-of-block knowledge check.',
        isToday: false, isFuture: false,
        students: gasStudents.map(s => ({ ...s, status: s.id === 'st5' ? 'Absent' as AttendanceStatus : 'Present' as AttendanceStatus })),
      },
    ],
  },

  // ── Today events ─────────────────────────────────────────────────────────
  {
    id: 'ev1',
    course: 'Gas Safety Fundamentals',
    trade: 'Gas Engineering',
    eventType: 'In Person',
    dateRange: '10 Feb – 28 Feb 2026',
    time: '09:00 – 17:00',
    totalSessions: 6,
    totalStudents: 6,
    sessions: [
      {
        id: 'ses1', label: 'Session 1', date: 'Mon, 10 Feb 2026', time: '09:00 – 17:00', room: 'Room 3A',
        description: 'Gas properties, complete combustion, and reading flame pictures safely on training rigs.',
        isToday: false, isFuture: false,
        students: gasStudents.map(s => ({ ...s, status: s.id === 'st3' ? 'Absent' as AttendanceStatus : 'Present' as AttendanceStatus })),
      },
      {
        id: 'ses2', label: 'Session 2', date: 'Wed, 12 Feb 2026', time: '09:00 – 17:00', room: 'Room 3A',
        description: 'Ventilation requirements, flue types, spillage testing concepts, and documentation.',
        isToday: false, isFuture: false,
        students: gasStudents.map(s => ({
          ...s,
          status: (s.id === 'st3' || s.id === 'st5') ? 'Absent' as AttendanceStatus : 'Present' as AttendanceStatus,
        })),
      },
      {
        id: 'ses3', label: 'Session 3', date: 'Wed, 18 Feb 2026', time: '09:00 – 17:00', room: 'Room 2B',
        description: 'Tightness testing procedure, purging, and safe re-establishment of gas supplies (practical).',
        isToday: true, isFuture: false,
        students: gasStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses3a', label: 'Session 4', date: 'Fri, 21 Feb 2026', time: '09:00 – 17:00', room: 'Room 2B',
        description: 'Pipe sizing basics, fittings, and workshop exercises on copper and CSST.',
        isToday: false, isFuture: true,
        students: gasStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses3b', label: 'Session 5', date: 'Mon, 24 Feb 2026', time: '09:00 – 17:00', room: 'Room 3A',
        description: 'Appliance safety checks, unsafe situations, and isolation / warning notices.',
        isToday: false, isFuture: true,
        students: gasStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses3c', label: 'Session 6', date: 'Fri, 28 Feb 2026', time: '09:00 – 17:00', room: 'Room 3A',
        description: 'Portfolio evidence, mock assessments, and individual action plans before sign-off.',
        isToday: false, isFuture: true,
        students: gasStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
    ],
  },
  {
    id: 'ev2',
    course: 'Advanced Circuit Theory',
    trade: 'Electrical',
    eventType: 'Webinar',
    dateRange: '16 Feb – 06 Mar 2026',
    time: '10:00 – 16:00',
    totalSessions: 4,
    totalStudents: 4,
    sessions: [
      {
        id: 'ses4', label: 'Session 1', date: 'Mon, 16 Feb 2026', time: '10:00 – 16:00', room: 'Lab 1',
        description: 'DC networks recap, AC waveforms, RMS vs peak, and simple phasor introduction.',
        isToday: false, isFuture: false,
        students: circuitStudents.map(s => ({ ...s, status: s.id === 'st9' ? 'Absent' as AttendanceStatus : 'Present' as AttendanceStatus })),
      },
      {
        id: 'ses5', label: 'Session 2', date: 'Wed, 18 Feb 2026', time: '10:00 – 16:00', room: 'Lab 1',
        description: 'Three-phase basics, balanced loads, power factor, and harmonics at a practical level.',
        isToday: true, isFuture: false,
        students: circuitStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses5a', label: 'Session 3', date: 'Mon, 23 Feb 2026', time: '10:00 – 16:00', room: 'Lab 1',
        description: 'Guided fault-finding scenarios on simulation boards and interpreting test results.',
        isToday: false, isFuture: true,
        students: circuitStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses5b', label: 'Session 4', date: 'Fri, 6 Mar 2026', time: '10:00 – 16:00', room: 'Lab 2',
        description: 'BS 7671 design exercises: cable sizing, protective devices, and discrimination.',
        isToday: false, isFuture: true,
        students: circuitStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
    ],
  },
  {
    id: 'ev3',
    course: 'Plumbing Basics 101',
    trade: 'Plumbing',
    eventType: 'In Person',
    dateRange: '18 Feb – 04 Mar 2026',
    time: '08:30 – 15:30',
    totalSessions: 5,
    totalStudents: 4,
    sessions: [
      {
        id: 'ses6', label: 'Session 1', date: 'Wed, 18 Feb 2026', time: '08:30 – 15:30', room: 'Workshop B',
        description: 'Cold water supplies, stop taps, pipe materials, and workshop H&S in the bay.',
        isToday: true, isFuture: false,
        students: plumbingStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses6a', label: 'Session 2', date: 'Fri, 20 Feb 2026', time: '08:30 – 15:30', room: 'Workshop B',
        description: 'Hot water systems, cylinders, expansion, and basic temperature controls.',
        isToday: false, isFuture: true,
        students: plumbingStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses6b', label: 'Session 3', date: 'Tue, 24 Feb 2026', time: '08:30 – 15:30', room: 'Workshop A',
        description: 'Cutting, bending, and jointing copper and plastic; leak testing.',
        isToday: false, isFuture: true,
        students: plumbingStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses6c', label: 'Session 4', date: 'Fri, 27 Feb 2026', time: '08:30 – 15:30', room: 'Workshop B',
        description: 'Above-ground drainage, traps, vents, and simple stack layouts.',
        isToday: false, isFuture: true,
        students: plumbingStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses6d', label: 'Session 5', date: 'Wed, 4 Mar 2026', time: '08:30 – 15:30', room: 'Workshop B',
        description: 'Mini install project tying cold, hot, and waste together with sign-off checklist.',
        isToday: false, isFuture: true,
        students: plumbingStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
    ],
  },

  // ── Upcoming-only event ───────────────────────────────────────────────────
  {
    id: 'ev4',
    course: 'Renewables Overview',
    trade: 'Electrical',
    eventType: 'Webinar',
    dateRange: '2 Mar – 20 Mar 2026',
    time: '10:00 – 16:00',
    totalSessions: 4,
    totalStudents: 5,
    sessions: [
      {
        id: 'ses7a', label: 'Session 1', date: 'Mon, 2 Mar 2026', time: '10:00 – 16:00', room: 'Lab 2',
        description: 'Solar PV chain: modules, inverters, metering, and shading / orientation basics.',
        isToday: false, isFuture: true,
        students: [
          { id: 'st15', name: 'Ben Thomas', email: 'b.thomas@email.com', status: 'Unmarked' },
          { id: 'st16', name: 'Rachel Green', email: 'r.green@email.com', status: 'Unmarked' },
          { id: 'st17', name: 'Yuki Tanaka', email: 'y.tanaka@email.com', status: 'Unmarked' },
          { id: 'st18', name: 'Amina Khan', email: 'a.khan@email.com', status: 'Unmarked' },
          { id: 'st19', name: 'Daniel Okafor', email: 'd.okafor@email.com', status: 'Unmarked' },
        ],
      },
      {
        id: 'ses7b', label: 'Session 2', date: 'Wed, 4 Mar 2026', time: '10:00 – 16:00', room: 'Lab 2',
        description: 'Heat pumps: ASHP vs GSHP, flow temperatures, emitters, and planning constraints.',
        isToday: false, isFuture: true,
        students: [
          { id: 'st15', name: 'Ben Thomas', email: 'b.thomas@email.com', status: 'Unmarked' },
          { id: 'st16', name: 'Rachel Green', email: 'r.green@email.com', status: 'Unmarked' },
          { id: 'st17', name: 'Yuki Tanaka', email: 'y.tanaka@email.com', status: 'Unmarked' },
          { id: 'st18', name: 'Amina Khan', email: 'a.khan@email.com', status: 'Unmarked' },
          { id: 'st19', name: 'Daniel Okafor', email: 'd.okafor@email.com', status: 'Unmarked' },
        ],
      },
      {
        id: 'ses7c', label: 'Session 3', date: 'Mon, 9 Mar 2026', time: '10:00 – 16:00', room: 'Lab 2',
        description: 'Battery storage, smart tariffs, and how renewables interact with the distribution network.',
        isToday: false, isFuture: true,
        students: [
          { id: 'st15', name: 'Ben Thomas', email: 'b.thomas@email.com', status: 'Unmarked' },
          { id: 'st16', name: 'Rachel Green', email: 'r.green@email.com', status: 'Unmarked' },
          { id: 'st17', name: 'Yuki Tanaka', email: 'y.tanaka@email.com', status: 'Unmarked' },
          { id: 'st18', name: 'Amina Khan', email: 'a.khan@email.com', status: 'Unmarked' },
          { id: 'st19', name: 'Daniel Okafor', email: 'd.okafor@email.com', status: 'Unmarked' },
        ],
      },
      {
        id: 'ses7d', label: 'Session 4', date: 'Fri, 20 Mar 2026', time: '10:00 – 16:00', room: 'Lab 2',
        description: 'Case studies: combining PV, storage, and heat pumps; Q&A and further learning routes.',
        isToday: false, isFuture: true,
        students: [
          { id: 'st15', name: 'Ben Thomas', email: 'b.thomas@email.com', status: 'Unmarked' },
          { id: 'st16', name: 'Rachel Green', email: 'r.green@email.com', status: 'Unmarked' },
          { id: 'st17', name: 'Yuki Tanaka', email: 'y.tanaka@email.com', status: 'Unmarked' },
          { id: 'st18', name: 'Amina Khan', email: 'a.khan@email.com', status: 'Unmarked' },
          { id: 'st19', name: 'Daniel Okafor', email: 'd.okafor@email.com', status: 'Unmarked' },
        ],
      },
    ],
  },
];

// ─── KNOWLEDGE UNITS ────────────────────────────────────────────────────────

export const knowledgeUnits: KnowledgeUnit[] = [
  { id: 'ku1', name: 'Gas Combustion Principles', relatedCourse: 'Introduction to Gas Safety', activities: 2, theoryAssessments: 0, practicalAssessments: 0, status: 'Active' },
  { id: 'ku2', name: 'Electrical Safety Regulations', relatedCourse: 'Advanced Circuit Theory', activities: 1, theoryAssessments: 0, practicalAssessments: 0, status: 'Active' },
  { id: 'ku3', name: 'Hydraulics Fundamentals', relatedCourse: 'Plumbing Basics 101', activities: 1, theoryAssessments: 0, practicalAssessments: 0, status: 'Inactive' },
  { id: 'ku4', name: 'Gas Appliance Installation', relatedCourse: 'Gas Safety Fundamentals', activities: 3, theoryAssessments: 1, practicalAssessments: 1, status: 'Active' },
  { id: 'ku5', name: 'Wiring Regulations (BS 7671)', relatedCourse: 'Advanced Circuit Theory', activities: 2, theoryAssessments: 1, practicalAssessments: 0, status: 'Active' },
  { id: 'ku6', name: 'Pipe Joining Techniques', relatedCourse: 'Plumbing Basics 101', activities: 4, theoryAssessments: 0, practicalAssessments: 2, status: 'Active' },
  { id: 'ku7', name: 'Ventilation & Flue Systems', relatedCourse: 'Introduction to Gas Safety', activities: 1, theoryAssessments: 1, practicalAssessments: 0, status: 'Active' },
  { id: 'ku8', name: 'Renewable Energy Systems', relatedCourse: 'Renewables Overview', activities: 0, theoryAssessments: 0, practicalAssessments: 0, status: 'Inactive' },
];

export const relatedCourses = [
  'Introduction to Gas Safety',
  'Gas Safety Fundamentals',
  'Advanced Circuit Theory',
  'Plumbing Basics 101',
  'Renewables Overview',
];

// ─── QUALIFICATIONS ─────────────────────────────────────────────────────────

export const qualifications: Qualification[] = [
  {
    id: 'q1',
    name: 'Level 3 Gas Engineering',
    description: 'Covers all gas safety fundamentals, combustion principles, and appliance installation for aspiring gas engineers.',
    knowledgeUnitIds: ['ku1', 'ku4', 'ku7'],
    status: 'Active',
    createdAt: '10 Jan 2026',
  },
  {
    id: 'q2',
    name: 'Level 3 Electrical Installation',
    description: 'Full qualification covering electrical safety regulations, wiring standards, and circuit theory.',
    knowledgeUnitIds: ['ku2', 'ku5'],
    status: 'Active',
    createdAt: '15 Jan 2026',
  },
  {
    id: 'q3',
    name: 'Level 2 Plumbing',
    description: 'Foundation plumbing qualification including hydraulics, pipe joining, and basic installations.',
    knowledgeUnitIds: ['ku3', 'ku6'],
    status: 'Draft',
    createdAt: '20 Jan 2026',
  },
];
