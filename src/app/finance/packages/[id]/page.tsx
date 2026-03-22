'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { financePackages, FinanceStage, PackageStatus } from '@/lib/finance-data';
import { PackageCockpitHeader } from './components/package-cockpit-header';
import { RevenueTimeline } from './components/revenue-timeline';
import { StageList } from './components/stage-list';
import { SummaryPanel } from './components/summary-panel';

export default function PackageCockpitPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const pkg = financePackages.find(p => p.id === id);

  if (!pkg) notFound();

  const router = useRouter();
  const [stages, setStages] = useState<FinanceStage[]>(pkg.stages);
  const [digitalAccessPct, setDigitalAccessPct] = useState(pkg.digitalAccessPercent);
  const [packageStatus, setPackageStatus] = useState<PackageStatus>(pkg.status);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const recalcAllRevenue = (nextStages: FinanceStage[]): FinanceStage[] => {
    const total = nextStages.reduce((s, st) => s + st.price, 0);
    if (total === 0) return nextStages.map(s => ({ ...s, revenueRecognition: 0 }));
    return nextStages.map(s => ({ ...s, revenueRecognition: Math.round((s.price / total) * 100) }));
  };

  const updateRevenue = useCallback((stageId: string, val: number) => {
    setStages(prev => {
      const deliverySum = prev.reduce((s, st) => s + st.price, 0);
      const derivedPrice = Math.round((deliverySum * val) / 100);
      return prev.map(s => (s.id === stageId ? { ...s, revenueRecognition: val, price: derivedPrice } : s));
    });
  }, []);

  const updateRefund = useCallback((stageId: string, val: number) => {
    setStages(prev => prev.map(s => (s.id === stageId ? { ...s, exposedRefund: val } : s)));
  }, []);

  const updatePrice = useCallback((stageId: string, val: number) => {
    setStages(prev => {
      const updated = prev.map(s => (s.id === stageId ? { ...s, price: val } : s));
      return recalcAllRevenue(updated);
    });
  }, []);

  const updateTotalPrice = useCallback((newTotal: number) => {
    setStages(prev => {
      const revTotal = prev.reduce((s, st) => s + st.revenueRecognition, 0);

      if (revTotal > 0) {
        return prev.map(s => ({
          ...s,
          price: Math.round((newTotal * s.revenueRecognition) / revTotal),
        }));
      }

      const even = Math.round(newTotal / prev.length);
      return prev.map(s => ({ ...s, price: even }));
    });
  }, []);

  const toggleSellable = useCallback((stageId: string, isSellable: boolean) => {
    setStages(prev => prev.map(s => (s.id === stageId ? { ...s, isSellable } : s)));
  }, []);

  const toggleCommissionable = useCallback((stageId: string, isCommissionable: boolean) => {
    setStages(prev => prev.map(s => (s.id === stageId ? { ...s, isCommissionable } : s)));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 400));
    setIsSaving(false);
    router.push('/finance/packages');
  }, [router]);

  let running = 0;
  const cumulatives = stages.map(s => {
    running += s.revenueRecognition;
    return running;
  });

  const totalActivities = stages.flatMap(s => s.activities).length;
  const totalRefund = stages.reduce((s, st) => s + st.exposedRefund, 0);
  const sumOfStagePrices = stages.reduce((s, st) => s + st.price, 0);
  const computedTotalPrice = sumOfStagePrices;
  const pricedStages = stages.filter(s => s.price > 0).length;
  const allPriced = pricedStages === stages.length;
  const pricingPct = stages.length > 0 ? Math.round((pricedStages / stages.length) * 100) : 0;

  return (
    <div className="flex flex-col min-h-full">
      <PackageCockpitHeader
        pkg={pkg}
        packageStatus={packageStatus}
        setPackageStatus={setPackageStatus}
        statusDropdownOpen={statusDropdownOpen}
        setStatusDropdownOpen={setStatusDropdownOpen}
        allPriced={allPriced}
        isSaving={isSaving}
        onSave={handleSave}
        computedTotalPrice={computedTotalPrice}
        onConfirmTotalPrice={updateTotalPrice}
        totalRefund={totalRefund}
        totalActivities={totalActivities}
        pricedStages={pricedStages}
        stagesLength={stages.length}
        pricingPct={pricingPct}
      />

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 p-4 overflow-auto">
          <RevenueTimeline stages={stages} />
          <StageList
            stages={stages}
            cumulatives={cumulatives}
            onUpdateRevenue={updateRevenue}
            onUpdateRefund={updateRefund}
            onUpdatePrice={updatePrice}
            onToggleSellable={toggleSellable}
            onToggleCommissionable={toggleCommissionable}
          />
        </div>

        <div
          className="w-68 shrink-0 border-l border-gray-200 overflow-auto p-4 bg-gray-50/60"
          style={{ width: '17rem' }}
        >
          <SummaryPanel
            pkg={pkg}
            stages={stages}
            digitalAccessPct={digitalAccessPct}
            onUpdateDigitalAccessPct={setDigitalAccessPct}
          />
        </div>
      </div>
    </div>
  );
}
