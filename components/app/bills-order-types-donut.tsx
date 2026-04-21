"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const ORANGE = "#ff6b1e";
const PEACH = "#fdcea1";

export function BillsOrderTypesDonut({
  dineIn,
  takeaway,
}: {
  dineIn: number;
  takeaway: number;
}) {
  const total = dineIn + takeaway;
  const data = [
    { name: "Dine In", value: dineIn, color: ORANGE },
    { name: "Takeaway", value: takeaway, color: PEACH },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-[#858585]">
        No orders in this range
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col items-stretch gap-6 sm:flex-row sm:items-center">
      <div className="relative mx-auto size-[152px] shrink-0">
        <ResponsiveContainer width={152} height={152}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={76}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
          <p className="text-[11px] text-[#858585]">Total orders</p>
          <p className="text-[22px] font-semibold leading-tight text-[#333]">{total}</p>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5">
        <OrderTypeRow label="Dine In" count={dineIn} barColor={ORANGE} />
        <OrderTypeRow label="Takeaway" count={takeaway} barColor={PEACH} />
      </div>
    </div>
  );
}

function OrderTypeRow({
  label,
  count,
  barColor,
}: {
  label: string;
  count: number;
  barColor: string;
}) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 h-9 w-2 shrink-0 rounded-sm" style={{ background: barColor }} />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-sm font-medium text-[#333]">{label}</p>
        <p className="text-lg font-semibold text-[#858585]">{count}</p>
      </div>
    </div>
  );
}
