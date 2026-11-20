import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-white/10 bg-[#0d0f14] px-3 py-2">
      <p className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">{label}</p>
      <p className="mt-1 font-grotesk text-sm text-amber">
        {payload[0].value} <span className="text-[10px] text-mute">µg/m³</span>
      </p>
    </div>
  );
}

export default function PmChart({ series = [] }) {
  return (
    <div className="h-[240px] w-full sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 16, right: 12, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="pmFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8a33d" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#e8a33d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(242,239,233,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#8b8f99', fontSize: 10, fontFamily: 'Space Grotesk' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(242,239,233,0.1)' }}
            interval={3}
          />
          <YAxis
            tick={{ fill: '#8b8f99', fontSize: 10, fontFamily: 'Space Grotesk' }}
            tickLine={false}
            axisLine={false}
            width={46}
          />
          <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(242,239,233,0.2)' }} />
          <ReferenceLine
            y={22}
            stroke="#2dd4a7"
            strokeDasharray="4 4"
            strokeOpacity={0.8}
            label={{
              value: '1 🚬 / day',
              position: 'insideTopLeft',
              fill: '#2dd4a7',
              fontSize: 10,
              fontFamily: 'Space Grotesk',
            }}
          />
          <Area
            type="monotone"
            dataKey="pm25"
            stroke="#e8a33d"
            strokeWidth={1.6}
            fill="url(#pmFill)"
            isAnimationActive
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
