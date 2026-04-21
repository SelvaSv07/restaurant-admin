import { BillsOrderTypesDonut } from "@/components/app/bills-order-types-donut";
import { BillsStatsCards } from "@/components/app/bills-stats-cards";
import { DashboardPanel } from "@/components/app/dashboard-panel";

export function BillsAnalyticsSection({
  stats,
  orderTypes,
  periodLabel,
}: {
  stats: { total: number; draft: number; completed: number; voided: number };
  orderTypes: { dineIn: number; takeaway: number };
  periodLabel: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,374px)]">
        <BillsStatsCards
          total={stats.total}
          onProcess={stats.draft}
          completed={stats.completed}
          canceled={stats.voided}
        />
        <DashboardPanel
          title="Order types"
          titleAddon={periodLabel}
          subtitle="Dine-in vs takeaway mix"
          className="min-h-[280px]"
        >
          <BillsOrderTypesDonut dineIn={orderTypes.dineIn} takeaway={orderTypes.takeaway} />
        </DashboardPanel>
      </div>
    </div>
  );
}
