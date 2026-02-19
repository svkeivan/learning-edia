import Link from 'next/link';

export default function ModulesPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-gray-500 mb-1">Learning</p>
          <h1 className="text-2xl font-bold text-gray-900">Modules</h1>
        </div>
        <Link
          href="/admin/modules/create"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Module
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        <p className="text-sm">Modules list goes here.</p>
      </div>
    </div>
  );
}
