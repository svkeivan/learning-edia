import Link from 'next/link';
import { assessments, submissions, rplRequests, attendanceEvents } from '@/lib/mock-data';

const totalPendingGrading = assessments.reduce((a, b) => a + b.pendingGrading, 0);
const avgPassRate = Math.round(
  assessments.filter(a => a.totalSubmissions > 0).reduce((sum, a) => sum + a.passRate, 0) /
  assessments.filter(a => a.totalSubmissions > 0).length
);
const pendingRPL = rplRequests.filter(r => r.status === 'Pending').length;
const todaySessions = attendanceEvents.flatMap(e => e.sessions).filter(s => s.isToday).length;

const recentSubmissions = submissions
  .filter(s => s.status !== 'Not Started' && s.submittedAt !== '-')
  .slice(0, 6);

const upcomingAssessments = assessments
  .filter(a => a.status === 'Active')
  .slice(0, 4);

function StatCard({
  label, value, sub, color, href,
}: {
  label: string; value: string | number; sub: string; color: string; href: string;
}) {
  return (
    <Link href={href} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-1 hover:shadow-md transition-shadow group">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pass: 'bg-green-100 text-green-700',
    Fail: 'bg-red-100 text-red-700',
    Grading: 'bg-blue-100 text-blue-700',
    'Not Started': 'bg-gray-100 text-gray-500',
    Active: 'bg-green-100 text-green-700',
    Draft: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

export default function AssessmentCenterOverview() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-gray-500 mb-1">Assessment Center</p>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-500 mt-1 text-sm">Wednesday, 18 February 2026 · Welcome back, Admin</p>
        </div>
        <Link
          href="/assessment-center/assessments"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Assessment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Assessments" value={assessments.length}
          sub={`${assessments.filter(a => a.status === 'Active').length} active`}
          color="text-gray-900" href="/assessment-center/assessments"
        />
        <StatCard
          label="Pending Grading" value={totalPendingGrading}
          sub="submissions awaiting review"
          color="text-blue-600" href="/assessment-center/grading"
        />
        <StatCard
          label="Average Pass Rate" value={`${avgPassRate}%`}
          sub="across all active assessments"
          color="text-green-600" href="/assessment-center/reports"
        />
        <StatCard
          label="RPL Requests" value={pendingRPL}
          sub="pending your review"
          color="text-amber-600" href="/assessment-center/rpl-requests"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/assessment-center/grading" className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-200 transition-colors">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Grade Submissions</p>
              <p className="text-gray-500 text-xs mt-0.5">{totalPendingGrading} submissions waiting</p>
            </div>
          </div>
        </Link>

        <Link href="/assessment-center/rpl-requests" className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-amber-300 transition-all group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-200 transition-colors">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Review RPL Requests</p>
              <p className="text-gray-500 text-xs mt-0.5">{pendingRPL} pending review</p>
            </div>
          </div>
        </Link>

        <Link href="/assessment-center/attendance" className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-green-300 transition-all group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0 group-hover:bg-green-200 transition-colors">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Mark Attendance</p>
              <p className="text-gray-500 text-xs mt-0.5">{todaySessions} sessions today</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Submissions</h2>
            <Link href="/assessment-center/grading" className="text-xs text-orange-600 font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentSubmissions.map(s => {
              const assessment = assessments.find(a => a.id === s.assessmentId);
              return (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-semibold shrink-0">
                    {s.student.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.student}</p>
                    <p className="text-xs text-gray-500 truncate">{assessment?.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={s.status} />
                    {s.score !== null && (
                      <p className="text-xs text-gray-400 mt-0.5">{s.score}%</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Assessments */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Active Assessments</h2>
            <Link href="/assessment-center/assessments" className="text-xs text-orange-600 font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingAssessments.map(a => (
              <Link key={a.id} href={`/assessment-center/assessments/${a.id}/results`} className="block px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.trade}</p>
                  </div>
                  {a.pendingGrading > 0 && (
                    <span className="shrink-0 bg-blue-100 text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
                      {a.pendingGrading} pending
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${a.passRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">{a.passRate}% pass</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
