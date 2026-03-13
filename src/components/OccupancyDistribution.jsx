import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

import { getTooltipStyle, GRID_COLOR, TICK_COLOR } from '../utils/chartTheme'

const BANDS = [
  { label: '0–20%',   range: [0, 20],  color: '#ef4444' },
  { label: '20–40%',  range: [20, 40], color: '#f97316' },
  { label: '40–60%',  range: [40, 60], color: '#f59e0b' },
  { label: '60–80%',  range: [60, 80], color: '#22c55e' },
  { label: '80–100%', range: [80, 100], color: '#10b981' },
]

export default function OccupancyDistribution({ properties }) {
  const { chartData, avgOcc, total } = useMemo(() => {
    const withOcc = properties.filter(p => p.avgOccupancy > 0)
    const counts = BANDS.map(b => ({ ...b, count: 0 }))
    withOcc.forEach(p => {
      const band = counts.find(b => p.avgOccupancy > b.range[0] && p.avgOccupancy <= b.range[1])
      if (band) band.count++
    })
    const avg = withOcc.length
      ? Math.round(withOcc.reduce((s, p) => s + p.avgOccupancy, 0) / withOcc.length)
      : 0
    return { chartData: counts, avgOcc: avg, total: withOcc.length }
  }, [properties])

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm dark:shadow-none">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Distribuição de Ocupação</h3>
        <span className="text-xs text-gray-400 dark:text-slate-500">Média geral: <span className="text-gray-900 dark:text-white font-semibold">{avgOcc}%</span></span>
      </div>
      <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">{total} propriedades com dados de ocupação</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
          <Tooltip formatter={v => [v, 'Propriedades']} {...getTooltipStyle()} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {chartData.map(b => (
          <div key={b.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: b.color }} />
            <span className="text-xs text-gray-400 dark:text-slate-500">{b.label}: <span className="text-gray-700 dark:text-slate-300 font-medium">{b.count}</span></span>
          </div>
        ))}
      </div>
    </div>
  )
}
