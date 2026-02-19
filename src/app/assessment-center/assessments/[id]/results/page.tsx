import Link from 'next/link';
import { assessments, submissions } from '@/lib/mock-data';
import { notFound } from 'next/navigation';

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

function StatusBadge({ status, score, passMark }: { status: string; score: number | null; passMark: number }) {
  if (status === 'Pass') return <Badge label="Pass" color="bg-green-100 text-green-700" />;
  if (status === 'Fail') return <Badge label="Fail" color="bg-red-100 text-red-700" />;
  if (status === 'Grading') return <Badge label="Awaiting Grading" color="bg-blue-100 text-blue-700" />;
  return <Badge label="Not Started" color="bg-gray-100 text-gray-500" />;
}

function ScoreCell({ score, passMark }: { score: number | null; passMark: number }) {
  if (score === null) return <span className="text-gray-400 text-sm">—</span>;
  const passed = score >= passMark;
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${passed ? 'bg-green-500' : 'bg-red-400'}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-sm font-semibold ${passed ? 'text-green-700' : 'text-red-600'}`}>{score}%</span>
    </div>
  );
}

export default async function AssessmentResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = assessments.find(a => a.id === id);
  if (!assessment) notFound();

  const subs = submissions.filter(s => s.assessmentId === id);
  const graded = subs.filter(s => s.score !== null);
  const passed = subs.filter(s => s.status === 'Pass');
  const pending = subs.filter(s => s.status === 'Grading');
  const notStarted = subs.filter(s => s.status === 'Not Started');

  const tradeColors: Record<string, string> = {
    'Gas Engineering': 'bg-orange-100 text-orange-700',
    'Electrical': 'bg-yellow-100 text-yellow-700',
    'Plumbing': 'bg-blue-100 text-blue-700',
  };

  const typeColors: Record<string, string> = {
    'Multiple Choice': 'bg-purple-100 text-purple-700',
    'Short Answer': 'bg-sky-100 text-sky-700',
    'Mixed': 'bg-indigo-100 text-indigo-700',
    'File Upload': 'bg-teal-100 text-teal-700',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link href="/assessment-center/assessments" className="hover:text-orange-600 transition-colors">
          Assessments
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{assessment.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge label={assessment.type} color={typeColors[assessment.type] ?? 'bg-gray-100 text-gray-600'} />
            <Badge label={assessment.trade} color={tradeColors[assessment.trade] ?? 'bg-gray-100 text-gray-600'} />
            <span className="text-sm text-gray-500">{assessment.module}</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">{assessment.questionCount} questions</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">Pass mark: {assessment.passMark}%</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">Due {assessment.dueDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {pending.length > 0 && (
            <Link
              href="/assessment-center/grading"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Grade {pending.length} Pending
            </Link>
          )}
          <button className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
        {[
          { label: 'Total Enrolled', value: subs.length, sub: 'students', color: 'text-gray-900' },
          { label: 'Submitted', value: graded.length + pending.length, sub: `${subs.length > 0 ? Math.round(((graded.length + pending.length) / subs.length) * 100) : 0}% of enrolled`, color: 'text-gray-900' },
          { label: 'Pass Rate', value: `${assessment.passRate}%`, sub: `${passed.length} of ${graded.length} graded`, color: 'text-green-600' },
          { label: 'Average Score', value: assessment.avgScore > 0 ? `${assessment.avgScore}%` : '—', sub: `pass mark ${assessment.passMark}%`, color: assessment.avgScore >= assessment.passMark ? 'text-green-600' : 'text-red-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Score distribution bar */}
      {graded.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <p className="text-sm font-semibold text-gray-900 mb-3">Score Distribution</p>
          <div className="flex items-end gap-1 h-16">
            {[
              { label: '<50%', count: graded.filter(s => s.score !== null && s.score < 50).length },
              { label: '50–59', count: graded.filter(s => s.score !== null && s.score >= 50 && s.score < 60).length },
              { label: '60–69', count: graded.filter(s => s.score !== null && s.score >= 60 && s.score < 70).length },
              { label: '70–79', count: graded.filter(s => s.score !== null && s.score >= 70 && s.score < 80).length },
              { label: '80–89', count: graded.filter(s => s.score !== null && s.score >= 80 && s.score < 90).length },
              { label: '90–100', count: graded.filter(s => s.score !== null && s.score !== null && s.score >= 90).length },
            ].map(bucket => {
              const pct = graded.length > 0 ? (bucket.count / graded.length) * 100 : 0;
              const isPassing = bucket.label !== '<50%' && bucket.label !== '50–59' && bucket.label !== '60–69' || assessment.passMark <= 60;
              return (
                <div key={bucket.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{bucket.count > 0 ? bucket.count : ''}</span>
                  <div className="w-full flex items-end" style={{ height: '40px' }}>
                    <div
                      className={`w-full rounded-t-sm ${bucket.count === 0 ? 'bg-gray-100' : pct > 0 && parseInt(bucket.label) >= assessment.passMark ? 'bg-green-400' : 'bg-red-300'}`}
                      style={{ height: pct > 0 ? `${Math.max(pct * 0.4, 4)}px` : '4px' }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 text-center leading-tight">{bucket.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Student Submissions</h2>
          <div className="flex gap-2">
            {(['All', 'Pass', 'Fail', 'Grading', 'Not Started'] as const).map(f => {
              const count = f === 'All' ? subs.length : subs.filter(s => s.status === f).length;
              return (
                <span key={f} className="text-xs text-gray-500 border border-gray-200 rounded-md px-2 py-1">
                  {f} ({count})
                </span>
              );
            })}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Attempt</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Time Taken</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {subs.map(s => (
              <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                      {s.student.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{s.student}</p>
                      <p className="text-xs text-gray-400">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-600">{s.submittedAt}</td>
                <td className="px-4 py-4 text-gray-600">{s.attemptNumber > 0 ? `#${s.attemptNumber}` : '—'}</td>
                <td className="px-4 py-4 text-gray-600">{s.timeTaken}</td>
                <td className="px-4 py-4">
                  <ScoreCell score={s.score} passMark={assessment.passMark} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={s.status} score={s.score} passMark={assessment.passMark} />
                </td>
                <td className="px-4 py-4 text-right">
                  {s.status === 'Grading' && (
                    <Link
                      href="/assessment-center/grading"
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Grade
                    </Link>
                  )}
                  {s.score !== null && (
                    <button className="text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md transition-colors">
                      View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
