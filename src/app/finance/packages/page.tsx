'use client';

import Link from 'next/link';
import { financePackages, FinancePackage, PackageStatus, TradeType } from '@/lib/finance-data';
import { useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function totalRefundExposure(pkg: FinancePackage): number {
  return pkg.stages[0]?.exposedRefund ?? 0;
}

function totalRevenueRecognition(pkg: FinancePackage): number {
  return pkg.stages.reduce((sum, s) => sum + s.revenueRecognition, 0);
}

function formatPrice(n: number) {
  return `£${n.toLocaleString('en-GB')}`;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusStyles: Record<PackageStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Draft: 'bg-amber-100 text-amber-700',
  Inactive: 'bg-gray-100 text-gray-500',
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
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' : status === 'Draft' ? 'bg-amber-500' : 'bg-gray-400'}`} />
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

// ─── Revenue Gauge ────────────────────────────────────────────────────────────

function RevenueGauge({ pct }: { pct: number }) {
  const isComplete = pct === 100;
  const isOver = pct > 100;
  const color = isOver ? 'bg-red-500' : isComplete ? 'bg-emerald-500' : 'bg-orange-400';
  const textColor = isOver ? 'text-red-600' : isComplete ? 'text-emerald-600' : 'text-orange-600';

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">Revenue recognition</span>
        <span className={`text-xs font-semibold ${textColor}`}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Validation Indicator ─────────────────────────────────────────────────────

function ValidationIndicator({ pkg }: { pkg: FinancePackage }) {
  const revTotal = totalRevenueRecognition(pkg);
  const revOk = revTotal === 100;

  if (pkg.isReadyToSell && revOk) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600">
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        Ready to sell
      </div>
    );
  }

  const issues = [];
  if (!revOk) issues.push(`Revenue: ${revTotal}%`);
  if (!pkg.isReadyToSell) issues.push('Not validated');

  return (
    <div className="flex items-center gap-1.5 text-xs text-amber-600">
      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
      {issues.join(' · ')}
    </div>
  );
}

// ─── Package Card ─────────────────────────────────────────────────────────────

function PackageCard({ pkg }: { pkg: FinancePackage }) {
  const revTotal = totalRevenueRecognition(pkg);
  const maxRefund = totalRefundExposure(pkg);

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

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4">
        <TradeBadge trade={pkg.trade} />
        <span className="text-xs text-gray-400">{pkg.stages.length} stages</span>
        <span className="text-xs text-gray-400">·</span>
        <span className="text-xs text-gray-400">{pkg.courseCount} courses</span>
      </div>

      {/* Financial stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-xs text-gray-500 mb-0.5">Total Price</p>
          <p className="text-sm font-bold text-gray-900">{formatPrice(pkg.totalPrice)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-xs text-gray-500 mb-0.5">Max Refund</p>
          <p className="text-sm font-bold text-gray-900">£{maxRefund}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-xs text-gray-500 mb-0.5">Digital Access</p>
          <p className="text-sm font-bold text-gray-900">{pkg.digitalAccessPercent}%</p>
        </div>
      </div>

      {/* Revenue gauge */}
      <div className="mb-3">
        <RevenueGauge pct={revTotal} />
      </div>

      {/* Validation */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <ValidationIndicator pkg={pkg} />
        <span className="text-xs text-gray-400">
          Updated {new Date(pkg.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </Link>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`rounded-xl p-4 border ${color}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs mt-0.5 opacity-60">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STATUS_FILTERS: Array<PackageStatus | 'All'> = ['All', 'Active', 'Draft', 'Inactive'];

export default function FinancePackagesPage() {
  const [statusFilter, setStatusFilter] = useState<PackageStatus | 'All'>('All');
  const [search, setSearch] = useState('');

  const totalPortfolioValue = financePackages.reduce((s, p) => s + p.totalPrice, 0);
  const packagesReadyToSell = financePackages.filter(p => p.isReadyToSell).length;
  const packagesNeedingAttention = financePackages.filter(p => {
    const rev = totalRevenueRecognition(p);
    return rev !== 100 || !p.isReadyToSell;
  }).length;

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

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <SummaryCard
          label="Total Packages"
          value={String(financePackages.length)}
          sub={`${packagesReadyToSell} ready to sell`}
          color="bg-white border-gray-200 text-gray-900"
        />
        <SummaryCard
          label="Portfolio Value"
          value={formatPrice(totalPortfolioValue)}
          sub="across all packages"
          color="bg-white border-gray-200 text-gray-900"
        />
        <SummaryCard
          label="Ready to Sell"
          value={String(packagesReadyToSell)}
          sub={`${financePackages.length - packagesReadyToSell} pending`}
          color="bg-emerald-50 border-emerald-200 text-emerald-900"
        />
        <SummaryCard
          label="Need Attention"
          value={String(packagesNeedingAttention)}
          sub="pricing issues"
          color={packagesNeedingAttention > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-white border-gray-200 text-gray-900'}
        />
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
