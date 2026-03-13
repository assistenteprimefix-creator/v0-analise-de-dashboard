import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getTooltipStyle, GRID_COLOR, TICK_COLOR } from '../utils/chartTheme'

const fmtUSD = v => {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`
  return `$${v}`
}

const CONDO_COLORS = [
  '#3b82f6','#06b6d4','#10b981','#f59e0b','#8b5cf6',
  '#f43f5e','#14b8a6','#a855f7','#ec4899','#0ea5e9',
  '#84cc16','#fb923c',
]

export default function RevenueRanking({ properties }) {
  const { top, bottom, condoColorMap } = useMemo(() => {
    const withRev = properties.filter(p => p.ytdRental > 0)
    if (!withRev.length) return { top: [], bottom: [], condoColorMap: {} }

    const condos = [...new Set(withRev.map(p => p.condominium).filter(Boolean))]
    const colorMap = Object.fromEntries(condos.map((c, i) => [c, CONDO_COLORS[i % CONDO_COLORS.length]]))

    const sorted = [...withRev].sort((a, b) => b.ytdRental - a.ytdRental)
    const top = sorted.slice(0, 15).map(p => ({
      name: p.name.replace(/([A-Z]+)\s(\d+)/, '$1 $2').slice(0, 18),
      fullName: p.name,
      ytdRental: p.ytdRental,
      ownerYTD: p.ownerYTD,
      companyYTD: p.companyYTD,
      color: colorMap[p.condominium] || '#64748b',
      condominium: p.condominium,
    }))
    const bottom = sorted.slice(-10).reverse().map(p => ({
      name: p.name.slice(0, 18),
      fullName: p.name,
      ytdRental: p.ytdRental,
      color: colorMap[p.condominium] || '#64748b',
      condominium: p.condominium,
    }))

    return { top, bottom, condoColorMap: colorMap }
  }, [properties])

  if (!top.length) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Top 15 revenue */}
      <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm dark:shadow-none">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Top 15 · Rental YTD</h3>
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Propriedades com maior receita total no ano</p>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={top} layout="vertical" margin={{ top: 0, right: 60, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
            <XAxis type="number" tickFormatter={fmtUSD} tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: TICK_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} width={115} />
            <Tooltip
              formatter={(v, name) => [fmtUSD(v), name === 'ytdRental' ? 'Rental Total' : name]}
              labelFormatter={(_,  payload) => payload?.[0]?.payload?.fullName || ''}
              {...getTooltipStyle()}
            />
            <Bar dataKey="ytdRental" radius={[0, 6, 6, 0]} maxBarSize={18} label={{ position: 'right', formatter: fmtUSD, fill: TICK_COLOR, fontSize: 10 }}>
              {top.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom 10 + condominium legend */}
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm dark:shadow-none flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Menor Receita</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">10 propriedades com menor YTD</p>
          <div className="space-y-2">
            {bottom.map((p, i) => (
              <div key={p.fullName} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 dark:text-slate-500 w-4 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 dark:text-slate-300 truncate">{p.fullName}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{p.condominium}</p>
                </div>
                <span className="text-xs font-semibold shrink-0" style={{ color: p.color }}>{fmtUSD(p.ytdRental)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Condominium color legend */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 shadow-sm dark:shadow-none">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Condomínios</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(condoColorMap).map(([name, color]) => (
              <div key={name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-xs text-gray-500 dark:text-slate-400">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
