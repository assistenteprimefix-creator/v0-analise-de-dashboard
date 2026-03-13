import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

import { getTooltipStyle, GRID_COLOR, TICK_COLOR } from '../utils/chartTheme'

const COLORS = ['#3b82f6','#06b6d4','#10b981','#f59e0b','#8b5cf6','#f43f5e','#14b8a6','#a855f7','#ec4899','#0ea5e9']

export default function BedroomStats({ properties }) {
  const { occData, ratioData } = useMemo(() => {
    const map = {}
    properties.forEach(p => {
      const k = p.bedrooms
      if (!k) return
      if (!map[k]) map[k] = { beds: k, totalOcc: 0, withOcc: 0, gf: 0, count: 0, totalRating: 0, rated: 0 }
      map[k].count++
      if (p.avgOccupancy > 0) { map[k].totalOcc += p.avgOccupancy; map[k].withOcc++ }
      if (p.guestFavorite) map[k].gf++
      if (p.rating > 0) { map[k].totalRating += p.rating; map[k].rated++ }
    })

    const rows = Object.values(map)
      .filter(m => m.withOcc > 0)
      .sort((a, b) => a.beds - b.beds)
      .map(m => ({
        label: `${m.beds}🛏️`,
        beds: m.beds,
        avgOcc: m.withOcc ? Math.round(m.totalOcc / m.withOcc) : 0,
        count: m.count,
        gfPct: Math.round(m.gf / m.count * 100),
        avgRating: m.rated ? Math.round(m.totalRating / m.rated * 10) / 10 : 0,
      }))

    return {
      occData: rows,
      ratioData: rows.map(r => ({ ...r, gfPct: r.gfPct })),
    }
  }, [properties])

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm dark:shadow-none">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Desempenho por N° de Quartos</h3>
      <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Ocupação média e % Guest Favorite por tipo de imóvel</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={occData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `${v}%`} tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} width={38} domain={[0, 100]} />
          <Tooltip
            formatter={(v, name) => [`${v}%`, name === 'avgOcc' ? 'Ocupação Média' : name]}
            {...getTooltipStyle()}
          />
          <Bar dataKey="avgOcc" radius={[6, 6, 0, 0]} maxBarSize={36}>
            {occData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary table */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {occData.map((r, i) => (
          <div key={r.beds} className="rounded-lg bg-gray-100 dark:bg-slate-800/50 p-2.5 text-center">
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{r.label}</p>
            <p className="text-sm font-bold mt-1" style={{ color: COLORS[i % COLORS.length] }}>{r.avgOcc}%</p>
            <p className="text-xs text-gray-400 dark:text-slate-600">{r.count} props</p>
            {r.avgRating > 0 && <p className="text-xs text-amber-500 mt-0.5">★ {r.avgRating}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
