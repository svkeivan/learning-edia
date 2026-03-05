'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getIqaChecks, getIqaCategories, getIqaTutors } from '@/lib/iqa-data';

function useIqaStats() {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, categories: 0, tutors: 0 });
  useEffect(() => {
    const update = () => {
      const checks = getIqaChecks();
      const categories = getIqaCategories();
      const tutors = getIqaTutors();
      setStats({
        pending: checks.filter(c => c.status === 'Pending').length,
        approved: checks.filter(c => c.status === 'Approved').length,
        rejected: checks.filter(c => c.status === 'Rejected').length,
        categories: categories.length,
        tutors: tutors.length,
      });
    };
    update();
    window.addEventListener('iqa-checks-updated', update);
    window.addEventListener('iqa-categories-updated', update);
    return () => {
      window.removeEventListener('iqa-checks-updated', update);
      window.removeEventListener('iqa-categories-updated', update);
    };
  }, []);
  return stats;
}

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

export default function IqaOverviewPage() {
  const { pending, approved, rejected, categories, tutors } = useIqaStats();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-gray-500 mb-1">IQA</p>
          <h1 className="text-2xl font-bold text-gray-900">Internal Quality Assurance</h1>
          <p className="text-gray-500 mt-1 text-sm">Review tutor assessments and ensure grading quality</p>
        </div>
        <Link
          href="/iqa/review-queue"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          Review Queue
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Pending Recheck"
          value={pending}
          sub="awaiting IQA review"
          color="text-blue-600"
          href="/iqa/review-queue?status=Pending"
        />
        <StatCard
          label="Approved"
          value={approved}
          sub="tutor assessments verified"
          color="text-green-600"
          href="/iqa/review-queue?status=Approved"
        />
        <StatCard
          label="Rejected"
          value={rejected}
          sub="require re-grading"
          color="text-red-600"
          href="/iqa/review-queue?status=Rejected"
        />
        <StatCard
          label="Categories"
          value={categories}
          sub={`${tutors} tutors assigned`}
          color="text-gray-900"
          href="/iqa/categories"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/iqa/review-queue" className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-200 transition-colors">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Review Assessments</p>
              <p className="text-gray-500 text-xs mt-0.5">{pending} pending recheck</p>
            </div>
          </div>
        </Link>

        <Link href="/iqa/assign" className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-orange-300 transition-all group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 group-hover:bg-orange-200 transition-colors">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Assign for Recheck</p>
              <p className="text-gray-500 text-xs mt-0.5">Manually assign assessments to tutors</p>
            </div>
          </div>
        </Link>

        <Link href="/iqa/people" className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-green-300 transition-all group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0 group-hover:bg-green-200 transition-colors">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Manage People</p>
              <p className="text-gray-500 text-xs mt-0.5">Assign people to categories</p>
            </div>
          </div>
        </Link>

        <Link href="/iqa/categories" className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-amber-300 transition-all group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-200 transition-colors">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Manage Categories</p>
              <p className="text-gray-500 text-xs mt-0.5">Tutor risk levels and recheck %</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3.5 flex items-start gap-3">
        <svg className="text-blue-500 shrink-0 mt-0.5" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
        <p className="text-sm text-blue-800">
          <strong>IQA</strong> ensures tutor assessment quality. Team leads assign tutors to risk categories; each category defines the percentage of assessments that require recheck by other tutors or the team lead. Reviewers can approve or reject tutor gradings.
        </p>
      </div>
    </div>
  );
}
