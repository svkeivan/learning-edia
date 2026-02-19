export type AssessmentType = 'Multiple Choice' | 'Short Answer' | 'Mixed' | 'File Upload';
export type AssessmentStatus = 'Active' | 'Draft' | 'Archived';
export type SubmissionStatus = 'Pass' | 'Fail' | 'Grading' | 'Not Started';
export type RPLStatus = 'Pending' | 'Accepted' | 'Rejected';
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
    status: 'Draft',
    totalSubmissions: 0,
    gradedSubmissions: 0,
    pendingGrading: 0,
    passRate: 0,
    avgScore: 0,
    passMark: 70,
    dueDate: '1 Apr 2026',
    createdAt: '10 Feb 2026',
    questionCount: 16,
  },
];

// ─── SUBMISSIONS ─────────────────────────────────────────────────────────────

export interface AnswerItem {
  question: string;
  answer: string;
  type: 'mc' | 'text';
}

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
}

export const submissions: StudentSubmission[] = [
  // a1 – Gas Safety (auto-graded, all done)
  { id: 's1', assessmentId: 'a1', student: 'James Wilson', email: 'j.wilson@email.com', submittedAt: '14 Feb 2026, 09:32', score: 85, status: 'Pass', attemptNumber: 1, timeTaken: '18 min' },
  { id: 's2', assessmentId: 'a1', student: 'Sarah Ahmed', email: 's.ahmed@email.com', submittedAt: '14 Feb 2026, 10:15', score: 72, status: 'Pass', attemptNumber: 1, timeTaken: '22 min' },
  { id: 's3', assessmentId: 'a1', student: 'Mike Chen', email: 'm.chen@email.com', submittedAt: '14 Feb 2026, 11:02', score: 65, status: 'Fail', attemptNumber: 1, timeTaken: '25 min' },
  { id: 's4', assessmentId: 'a1', student: 'Emma Thompson', email: 'e.thompson@email.com', submittedAt: '14 Feb 2026, 11:45', score: 91, status: 'Pass', attemptNumber: 1, timeTaken: '16 min' },
  { id: 's5', assessmentId: 'a1', student: 'David Park', email: 'd.park@email.com', submittedAt: '15 Feb 2026, 09:10', score: 78, status: 'Pass', attemptNumber: 1, timeTaken: '20 min' },
  { id: 's6', assessmentId: 'a1', student: 'Lisa Rodriguez', email: 'l.rodriguez@email.com', submittedAt: '15 Feb 2026, 09:55', score: 88, status: 'Pass', attemptNumber: 1, timeTaken: '19 min' },

  // a2 – Electrical Safety (mixed – 3 awaiting grading)
  {
    id: 's7', assessmentId: 'a2', student: 'Tom Baker', email: 't.baker@email.com',
    submittedAt: '13 Feb 2026, 14:20', score: null, status: 'Grading', attemptNumber: 1, timeTaken: '35 min',
    answers: [
      { question: 'Explain the purpose of an RCD and how it protects against electric shock.', answer: 'An RCD monitors the difference between live and neutral currents. If it detects an imbalance of 30mA or more it disconnects power within 30ms, preventing serious injury.', type: 'text' },
      { question: 'What is the maximum permitted voltage drop on a ring circuit?', answer: '3% for lighting circuits, 5% for power circuits of the nominal supply voltage.', type: 'text' },
    ],
  },
  {
    id: 's8', assessmentId: 'a2', student: 'Anna Smith', email: 'a.smith@email.com',
    submittedAt: '13 Feb 2026, 15:05', score: null, status: 'Grading', attemptNumber: 1, timeTaken: '28 min',
    answers: [
      { question: 'Explain the purpose of an RCD and how it protects against electric shock.', answer: 'RCDs protect people from electric shock by cutting power when they sense a fault. They measure current on live and neutral and if there is a difference it trips.', type: 'text' },
      { question: 'What is the maximum permitted voltage drop on a ring circuit?', answer: 'I believe it is 5% but I am not entirely certain for the different circuit types.', type: 'text' },
    ],
  },
  { id: 's9', assessmentId: 'a2', student: 'Carlos Diaz', email: 'c.diaz@email.com', submittedAt: '14 Feb 2026, 09:00', score: 73, status: 'Pass', attemptNumber: 1, timeTaken: '30 min' },
  { id: 's10', assessmentId: 'a2', student: 'Priya Patel', email: 'p.patel@email.com', submittedAt: '14 Feb 2026, 10:30', score: 58, status: 'Fail', attemptNumber: 1, timeTaken: '38 min' },
  { id: 's11', assessmentId: 'a2', student: 'Rachel Green', email: 'r.green@email.com', submittedAt: '-', score: null, status: 'Not Started', attemptNumber: 0, timeTaken: '-' },
  {
    id: 's12', assessmentId: 'a2', student: 'Ben Thomas', email: 'b.thomas@email.com',
    submittedAt: '15 Feb 2026, 14:30', score: null, status: 'Grading', attemptNumber: 1, timeTaken: '32 min',
    answers: [
      { question: 'Explain the purpose of an RCD and how it protects against electric shock.', answer: 'RCDs continuously monitor current on two conductors. They trip if they detect any difference indicating a fault to earth. This prevents electrocution.', type: 'text' },
      { question: 'What is the maximum permitted voltage drop on a ring circuit?', answer: 'The voltage drop should not exceed 3% for lighting circuits according to BS 7671.', type: 'text' },
    ],
  },

  // a3 – Plumbing (mixed)
  {
    id: 's13', assessmentId: 'a3', student: 'Omar Hassan', email: 'o.hassan@email.com',
    submittedAt: '12 Feb 2026, 13:45', score: null, status: 'Grading', attemptNumber: 1, timeTaken: '42 min',
    answers: [{ question: 'Describe the process for testing a soldered capillary joint for leaks.', answer: 'After soldering, allow the joint to cool completely. Then pressurise the system to 1.5 times the working pressure using clean cold water and inspect all joints visually.', type: 'text' }],
  },
  {
    id: 's14', assessmentId: 'a3', student: 'Nina Kowalski', email: 'n.kowalski@email.com',
    submittedAt: '13 Feb 2026, 09:20', score: null, status: 'Grading', attemptNumber: 1, timeTaken: '38 min',
    answers: [{ question: 'Describe the process for testing a soldered capillary joint for leaks.', answer: 'You need to test under pressure. Fill the pipe with water and check for drips at the joint area.', type: 'text' }],
  },
  { id: 's15', assessmentId: 'a3', student: 'Liam Murphy', email: 'l.murphy@email.com', submittedAt: '14 Feb 2026, 14:15', score: 76, status: 'Pass', attemptNumber: 1, timeTaken: '33 min' },

  // a5 – Circuit Analysis
  {
    id: 's16', assessmentId: 'a5', student: 'Tom Baker', email: 't.baker@email.com',
    submittedAt: '16 Feb 2026, 10:15', score: null, status: 'Grading', attemptNumber: 1, timeTaken: '45 min',
    answers: [{ question: "Using Kirchhoff's Voltage Law, explain how to calculate voltage across each resistor in a series circuit.", answer: "KVL states the sum of all voltage drops must equal the supply voltage. For each resistor V = IR where I is the same throughout, so V1 = I×R1, V2 = I×R2, and Vs = V1 + V2 + ... + Vn.", type: 'text' }],
  },
  {
    id: 's17', assessmentId: 'a5', student: 'Anna Smith', email: 'a.smith@email.com',
    submittedAt: '16 Feb 2026, 11:30', score: null, status: 'Grading', attemptNumber: 1, timeTaken: '38 min',
    answers: [{ question: "Using Kirchhoff's Voltage Law, explain how to calculate voltage across each resistor in a series circuit.", answer: "KVL states the sum of EMFs equals the sum of voltage drops. You add up resistances and use V=IR to find each voltage drop.", type: 'text' }],
  },
];

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

export interface AttendanceEvent {
  id: string;
  course: string;
  trade: 'Gas Engineering' | 'Electrical' | 'Plumbing';
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
    dateRange: '27 Jan – 14 Feb 2026',
    time: '09:00 – 17:00',
    totalSessions: 3,
    totalStudents: 6,
    sessions: [
      {
        id: 'ses0a', label: 'Session 1', date: 'Tue, 27 Jan 2026', time: '09:00 – 17:00', room: 'Room 1A',
        isToday: false, isFuture: false,
        students: gasStudents.map(s => ({ ...s, status: s.id === 'st3' ? 'Absent' as AttendanceStatus : 'Present' as AttendanceStatus })),
      },
      {
        id: 'ses0b', label: 'Session 2', date: 'Tue, 4 Feb 2026', time: '09:00 – 17:00', room: 'Room 1A',
        isToday: false, isFuture: false,
        students: gasStudents.map(s => ({ ...s, status: 'Present' as AttendanceStatus })),
      },
      {
        id: 'ses0c', label: 'Session 3', date: 'Fri, 14 Feb 2026', time: '09:00 – 17:00', room: 'Room 1A',
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
    dateRange: '10 Feb – 28 Feb 2026',
    time: '09:00 – 17:00',
    totalSessions: 6,
    totalStudents: 6,
    sessions: [
      {
        id: 'ses1', label: 'Session 1', date: 'Mon, 10 Feb 2026', time: '09:00 – 17:00', room: 'Room 3A',
        isToday: false, isFuture: false,
        students: gasStudents.map(s => ({ ...s, status: s.id === 'st3' ? 'Absent' as AttendanceStatus : 'Present' as AttendanceStatus })),
      },
      {
        id: 'ses2', label: 'Session 2', date: 'Wed, 12 Feb 2026', time: '09:00 – 17:00', room: 'Room 3A',
        isToday: false, isFuture: false,
        students: gasStudents.map(s => ({
          ...s,
          status: (s.id === 'st3' || s.id === 'st5') ? 'Absent' as AttendanceStatus : 'Present' as AttendanceStatus,
        })),
      },
      {
        id: 'ses3', label: 'Session 3', date: 'Wed, 18 Feb 2026', time: '09:00 – 17:00', room: 'Room 2B',
        isToday: true, isFuture: false,
        students: gasStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses3a', label: 'Session 4', date: 'Fri, 21 Feb 2026', time: '09:00 – 17:00', room: 'Room 2B',
        isToday: false, isFuture: true,
        students: gasStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses3b', label: 'Session 5', date: 'Mon, 24 Feb 2026', time: '09:00 – 17:00', room: 'Room 3A',
        isToday: false, isFuture: true,
        students: gasStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses3c', label: 'Session 6', date: 'Fri, 28 Feb 2026', time: '09:00 – 17:00', room: 'Room 3A',
        isToday: false, isFuture: true,
        students: gasStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
    ],
  },
  {
    id: 'ev2',
    course: 'Advanced Circuit Theory',
    trade: 'Electrical',
    dateRange: '16 Feb – 06 Mar 2026',
    time: '10:00 – 16:00',
    totalSessions: 4,
    totalStudents: 4,
    sessions: [
      {
        id: 'ses4', label: 'Session 1', date: 'Mon, 16 Feb 2026', time: '10:00 – 16:00', room: 'Lab 1',
        isToday: false, isFuture: false,
        students: circuitStudents.map(s => ({ ...s, status: s.id === 'st9' ? 'Absent' as AttendanceStatus : 'Present' as AttendanceStatus })),
      },
      {
        id: 'ses5', label: 'Session 2', date: 'Wed, 18 Feb 2026', time: '10:00 – 16:00', room: 'Lab 1',
        isToday: true, isFuture: false,
        students: circuitStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses5a', label: 'Session 3', date: 'Mon, 23 Feb 2026', time: '10:00 – 16:00', room: 'Lab 1',
        isToday: false, isFuture: true,
        students: circuitStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses5b', label: 'Session 4', date: 'Fri, 6 Mar 2026', time: '10:00 – 16:00', room: 'Lab 2',
        isToday: false, isFuture: true,
        students: circuitStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
    ],
  },
  {
    id: 'ev3',
    course: 'Plumbing Basics 101',
    trade: 'Plumbing',
    dateRange: '18 Feb – 04 Mar 2026',
    time: '08:30 – 15:30',
    totalSessions: 5,
    totalStudents: 4,
    sessions: [
      {
        id: 'ses6', label: 'Session 1', date: 'Wed, 18 Feb 2026', time: '08:30 – 15:30', room: 'Workshop B',
        isToday: true, isFuture: false,
        students: plumbingStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses6a', label: 'Session 2', date: 'Fri, 20 Feb 2026', time: '08:30 – 15:30', room: 'Workshop B',
        isToday: false, isFuture: true,
        students: plumbingStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses6b', label: 'Session 3', date: 'Tue, 24 Feb 2026', time: '08:30 – 15:30', room: 'Workshop A',
        isToday: false, isFuture: true,
        students: plumbingStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses6c', label: 'Session 4', date: 'Fri, 27 Feb 2026', time: '08:30 – 15:30', room: 'Workshop B',
        isToday: false, isFuture: true,
        students: plumbingStudents.map(s => ({ ...s, status: 'Unmarked' as AttendanceStatus })),
      },
      {
        id: 'ses6d', label: 'Session 5', date: 'Wed, 4 Mar 2026', time: '08:30 – 15:30', room: 'Workshop B',
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
    dateRange: '2 Mar – 20 Mar 2026',
    time: '10:00 – 16:00',
    totalSessions: 4,
    totalStudents: 5,
    sessions: [
      {
        id: 'ses7a', label: 'Session 1', date: 'Mon, 2 Mar 2026', time: '10:00 – 16:00', room: 'Lab 2',
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
