import { assessments } from '@/lib/mock-data';

const tradeData = [
  {
    trade: 'Gas Engineering',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    assessmentCount: assessments.filter(a => a.trade === 'Gas Engineering').length,
    avgPassRate: Math.round(
      assessments.filter(a => a.trade === 'Gas Engineering' && a.totalSubmissions > 0)
        .reduce((sum, a) => sum + a.passRate, 0) /
      (assessments.filter(a => a.trade === 'Gas Engineering' && a.totalSubmissions > 0).length || 1)
    ),
    avgScore: Math.round(
      assessments.filter(a => a.trade === 'Gas Engineering' && a.totalSubmissions > 0)
        .reduce((sum, a) => sum + a.avgScore, 0) /
      (assessments.filter(a => a.trade === 'Gas Engineering' && a.totalSubmissions > 0).length || 1)
    ),
    totalSubmissions: assessments.filter(a => a.trade === 'Gas Engineering').reduce((s, a) => s + a.totalSubmissions, 0),
    attendanceRate: 88,
  },
  {
    trade: 'Electrical',
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    assessmentCount: assessments.filter(a => a.trade === 'Electrical').length,
    avgPassRate: Math.round(
      assessments.filter(a => a.trade === 'Electrical' && a.totalSubmissions > 0)
        .reduce((sum, a) => sum + a.passRate, 0) /
      (assessments.filter(a => a.trade === 'Electrical' && a.totalSubmissions > 0).length || 1)
    ),
    avgScore: Math.round(
      assessments.filter(a => a.trade === 'Electrical' && a.totalSubmissions > 0)
        .reduce((sum, a) => sum + a.avgScore, 0) /
      (assessments.filter(a => a.trade === 'Electrical' && a.totalSubmissions > 0).length || 1)
    ),
    totalSubmissions: assessments.filter(a => a.trade === 'Electrical').reduce((s, a) => s + a.totalSubmissions, 0),
    attendanceRate: 82,
  },
  {
    trade: 'Plumbing',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    assessmentCount: assessments.filter(a => a.trade === 'Plumbing').length,
    avgPassRate: Math.round(
      assessments.filter(a => a.trade === 'Plumbing' && a.totalSubmissions > 0)
        .reduce((sum, a) => sum + a.passRate, 0) /
      (assessments.filter(a => a.trade === 'Plumbing' && a.totalSubmissions > 0).length || 1)
    ),
    avgScore: Math.round(
      assessments.filter(a => a.trade === 'Plumbing' && a.totalSubmissions > 0)
        .reduce((sum, a) => sum + a.avgScore, 0) /
      (assessments.filter(a => a.trade === 'Plumbing' && a.totalSubmissions > 0).length || 1)
    ),
    totalSubmissions: assessments.filter(a => a.trade === 'Plumbing').reduce((s, a) => s + a.totalSubmissions, 0),
    attendanceRate: 91,
  },
];

const monthlyPassRates = [
  { month: 'Sep', rate: 71 },
  { month: 'Oct', rate: 74 },
  { month: 'Nov', rate: 78 },
  { month: 'Dec', rate: 80 },
  { month: 'Jan', rate: 79 },
  { month: 'Feb', rate: 82 },
];

const monthlySubmissions = [
  { month: 'Sep', count: 45 },
  { month: 'Oct', count: 62 },
  { month: 'Nov', count: 58 },
  { month: 'Dec', count: 41 },
  { month: 'Jan', count: 73 },
  { month: 'Feb', count: 87 },
];

function BarChart({
  data,
  valueKey,
  labelKey,
  color,
  maxValue,
  suffix = '',
}: {
  data: Record<string, string | number>[];
  valueKey: string;
  labelKey: string;
  color: string;
  maxValue: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-end gap-2 h-32 pt-2">
      {data.map((item, i) => {
        const value = item[valueKey] as number;
        const pct = (value / maxValue) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-gray-500 font-medium">{value}{suffix}</span>
            <div className="w-full flex items-end" style={{ height: '80px' }}>
              <div
                className={`w-full rounded-t-md ${color} transition-all`}
                style={{ height: `${Math.max(pct * 0.8, 4)}px` }}
              />
            </div>
            <span className="text-xs text-gray-400">{item[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

const overallAvgPassRate = Math.round(
  assessments.filter(a => a.totalSubmissions > 0).reduce((sum, a) => sum + a.passRate, 0) /
  (assessments.filter(a => a.totalSubmissions > 0).length || 1)
);
const totalSubmissions = assessments.reduce((s, a) => s + a.totalSubmissions, 0);
const totalPendingGrading = assessments.reduce((s, a) => s + a.pendingGrading, 0);
const rplAccepted = 1;
const rplPending = 3;

export default function ReportsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Assessment Center</p>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Performance overview · Feb 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-white text-gray-700">
            <option>Last 6 months</option>
            <option>Last 3 months</option>
            <option>This month</option>
            <option>All time</option>
          </select>
          <button className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { label: 'Total Submissions', value: totalSubmissions, delta: '+12', sub: 'this month', color: 'text-gray-900' },
          { label: 'Overall Pass Rate', value: `${overallAvgPassRate}%`, delta: '+3%', sub: 'vs last month', color: 'text-green-600' },
          { label: 'Avg Attendance Rate', value: '87%', delta: '+2%', sub: 'across all trades', color: 'text-blue-600' },
          { label: 'Certs Issued (RPL)', value: rplAccepted, delta: `${rplPending} pending`, sub: 'this period', color: 'text-orange-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-green-600 font-medium">{stat.delta}</span>
              <span className="text-xs text-gray-400">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
        {/* Pass Rate over time */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Pass Rate Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly overall pass rate</p>
            </div>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              ↑ +11% since Sep
            </span>
          </div>
          <BarChart
            data={monthlyPassRates as Record<string, string | number>[]}
            valueKey="rate" labelKey="month" color="bg-orange-500" maxValue={100} suffix="%"
          />
          {/* Benchmark line label */}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-0.5 bg-gray-300" />
            <span className="text-xs text-gray-400">70% pass mark target</span>
          </div>
        </div>

        {/* Submission volume over time */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Submission Volume</h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly submissions received</p>
            </div>
            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              ↑ +19% vs Jan
            </span>
          </div>
          <BarChart
            data={monthlySubmissions as Record<string, string | number>[]}
            valueKey="count" labelKey="month" color="bg-blue-500" maxValue={100}
          />
        </div>
      </div>

      {/* By Trade breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 mb-7">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Performance by Trade</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {tradeData.map(td => (
            <div key={td.trade} className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-3 h-3 rounded-full ${td.color}`} />
                <p className="text-sm font-semibold text-gray-900">{td.trade}</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Pass Rate', value: `${td.avgPassRate}%`, bar: td.avgPassRate, barColor: td.color },
                  { label: 'Avg Score', value: `${td.avgScore}%`, bar: td.avgScore, barColor: 'bg-gray-400' },
                  { label: 'Attendance', value: `${td.attendanceRate}%`, bar: td.attendanceRate, barColor: 'bg-green-400' },
                ].map(metric => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">{metric.label}</span>
                      <span className="text-xs font-semibold text-gray-900">{metric.value}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`${metric.barColor} h-1.5 rounded-full transition-all`}
                        style={{ width: `${metric.bar}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Submissions</span>
                    <span className="font-semibold text-gray-900">{td.totalSubmissions}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-500">Assessments</span>
                    <span className="font-semibold text-gray-900">{td.assessmentCount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Performance Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Assessment Performance Breakdown</h2>
          <span className="text-xs text-gray-400">{assessments.filter(a => a.totalSubmissions > 0).length} assessments with data</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assessment</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trade</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submissions</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pass Rate</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pass Mark</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pending</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {assessments.filter(a => a.totalSubmissions > 0).map(a => {
              const tradeDotColors: Record<string, string> = {
                'Gas Engineering': 'bg-orange-400',
                'Electrical': 'bg-yellow-400',
                'Plumbing': 'bg-blue-400',
              };
              const passOk = a.passRate >= a.passMark;

              return (
                <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-400">{a.module}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <span className={`w-2 h-2 rounded-full ${tradeDotColors[a.trade]}`} />
                      {a.trade}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-700 font-medium">{a.totalSubmissions}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${passOk ? 'bg-green-500' : 'bg-red-400'}`}
                          style={{ width: `${a.passRate}%` }}
                        />
                      </div>
                      <span className={`text-sm font-semibold ${passOk ? 'text-green-700' : 'text-red-600'}`}>
                        {a.passRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-sm font-semibold ${a.avgScore >= a.passMark ? 'text-gray-900' : 'text-red-600'}`}>
                      {a.avgScore > 0 ? `${a.avgScore}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{a.passMark}%</td>
                  <td className="px-4 py-3.5">
                    {a.pendingGrading > 0 ? (
                      <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {a.pendingGrading}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
