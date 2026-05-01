// components/admin/RevenueChart.tsx
"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO, isValid } from "date-fns";

interface Props {
  data: { date: string; revenue: number; orders: number }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  
  const dateStr = payload[0]?.payload?.date;
  let formattedDate = dateStr;
  
  try {
    if (dateStr) {
      const parsedDate = parseISO(dateStr);
      if (isValid(parsedDate)) {
        formattedDate = format(parsedDate, "d MMM yyyy");
      }
    }
  } catch (error) {
    console.error("Date formatting error:", error);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-900 mb-1">
        {formattedDate}
      </p>
      <p className="text-primary-600">
        รายได้: ฿{payload[0]?.value?.toLocaleString() || 0}
      </p>
      <p className="text-gray-500">
        คำสั่งซื้อ: {payload[0]?.payload?.orders || 0} รายการ
      </p>
    </div>
  );
};

export default function RevenueChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-gray-400">
        <p>ไม่มีข้อมูล</p>
      </div>
    );
  }

  const formatted = data.map((d) => {
    let label = d.date;
    try {
      const parsedDate = parseISO(d.date);
      if (isValid(parsedDate)) {
        label = format(parsedDate, "d/M");
      }
    } catch (error) {
      console.error("Date parsing error:", error);
    }
    
    return {
      ...d,
      label,
      revenue: Number(d.revenue) || 0,
      orders: Number(d.orders) || 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#bf50f3" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#bf50f3" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis 
          dataKey="label" 
          tick={{ fontSize: 11, fill: "#9ca3af" }} 
          axisLine={false} 
          tickLine={false} 
        />
        <YAxis 
          tick={{ fontSize: 11, fill: "#9ca3af" }} 
          axisLine={false} 
          tickLine={false}
          tickFormatter={(v) => {
            const num = Number(v) || 0;
            if (num >= 1000) {
              return `฿${(num / 1000).toFixed(0)}K`;
            }
            return `฿${num}`;
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#bf50f3" 
          strokeWidth={2}
          fill="url(#gradRevenue)" 
          dot={false} 
          activeDot={{ r: 4, strokeWidth: 0 }} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
