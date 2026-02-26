'use client';

import Link from 'next/link';
import { financePackages, FinancePackage, PackageStatus, TradeType } from '@/lib/finance-data';
import { useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function totalRefundExposure(pkg: FinancePackage): number {
  return pkg.stages.reduce((sum, s) => sum + s.exposedRefund, 0);
}

function digitalAssetsTotal(pkg: FinancePackage): number {
  const deliverySum = pkg.stages.reduce((s, st) => s + st.price, 0);
  return Math.round(deliverySum * pkg.digitalAccessPercent / 100);
}

function totalActivities(pkg: FinancePackage): number {
  return pkg.stages.reduce((sum, s) => sum + s.activities.length, 0);
}

function pricingProgress(pkg: FinancePackage): { priced: number; total: number; pct: number } {
  const total = pkg.stages.length;
  const priced = pkg.stages.filter(s => s.price > 0).length;
  return { priced, total, pct: total > 0 ? Math.round((priced / total) * 100) : 0 };
}

function formatPrice(n: number) {
  return `£${n.toLocaleString('en-GB')}`;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusStyles: Record<PackageStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  'Ready to Sell': 'bg-emerald-100 text-emerald-700',
};

const tradeStyles: Record<TradeType, string> = {
  Electrical: 'bg-yellow-100 text-yellow-700',
  'Gas Engineering': 'bg-orange-100 text-orange-700',
  Plumbing: 'bg-blue-100 text-blue-700',
  'Multi-Trade': 'bg-purple-100 text-purple-700',
};

function StatusBadge({ status }: { status: PackageStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Ready to Sell' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {status}
    </span>
  );
}

function TradeBadge({ trade }: { trade: TradeType }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tradeStyles[trade]}`}>
      {trade}
    </span>
  );
}

// ─── Package Card ─────────────────────────────────────────────────────────────

function PricingProgressBar({ pkg }: { pkg: FinancePackage }) {
  const { priced, total, pct } = pricingProgress(pkg);
  const isComplete = pct === 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">Pricing progress</span>
        <span className={`text-xs font-semibold tabular-nums ${isComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
          {priced} of {total} courses
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-orange-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PackageCard({ pkg }: { pkg: FinancePackage }) {
  const refundTotal = totalRefundExposure(pkg);
  const digitalTotal = digitalAssetsTotal(pkg);
  const activityCount = totalActivities(pkg);

  return (
    <Link
      href={`/finance/packages/${pkg.id}`}
      className="group block bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-300 hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-orange-600 transition-colors truncate">
            {pkg.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{pkg.description}</p>
        </div>
        <StatusBadge status={pkg.status} />
      </div>

      {/* Info pills: trade, courses, modules, activities */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <TradeBadge trade={pkg.trade} />
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{pkg.courseCount} courses</span>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{pkg.moduleCount} modules</span>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{activityCount} activities</span>
      </div>

      {/* Financial stats: total price, total refund, digital assets */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-xs text-gray-500 mb-0.5">Total Price</p>
          <p className="text-sm font-bold text-gray-900">{formatPrice(pkg.totalPrice)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-xs text-gray-500 mb-0.5">Total Refund</p>
          <p className="text-sm font-bold text-gray-900">{formatPrice(refundTotal)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-xs text-gray-500 mb-0.5">Digital Assets</p>
          <p className="text-sm font-bold text-gray-900">{formatPrice(digitalTotal)}</p>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STATUS_FILTERS: Array<PackageStatus | 'All'> = ['All', 'Pending', 'Ready to Sell'];

export default function FinancePackagesPage() {
  const [statusFilter, setStatusFilter] = useState<PackageStatus | 'All'>('All');
  const [search, setSearch] = useState('');

  const filtered = financePackages.filter(pkg => {
    const matchesStatus = statusFilter === 'All' || pkg.status === statusFilter;
    const matchesSearch = pkg.name.toLowerCase().includes(search.toLowerCase()) ||
      pkg.trade.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <span>Finance</span>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-gray-600">Packages</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Finance Manager</h1>
        <p className="text-sm text-gray-500 mt-1">Review pricing structures, revenue recognition and refund policies across all course packages.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search packages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === f
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Package grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="mx-auto mb-3 opacity-40">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="text-sm">No packages found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(pkg => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );
}
