import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#3b82f6','#06b6d4','#10b981','#f59e0b','#8b5cf6','#f43f5e','#14b8a6','#a855f7','#ec4899','#0ea5e9']

import { getTooltipStyle, GRID_COLOR, TICK_COLOR } from '../utils/chartTheme'

export default function CondoBreakdown({ properties }) {
  const data = useMemo(() => {
    const map = {}
    properties.forEach(p => {
      const key = p.condominium?.trim() || 'Outros'
      if (!map[key]) map[key] = { name: key, count: 0, totalOcc: 0, withOcc: 0 }
      map[key].count++
      if (p.avgOccupancy > 0) { map[key].totalOcc += p.avgOccupancy; map[key].withOcc++ }
    })
    return Object.values(map)
      .map(m => ({ ...m, avgOcc: m.withOcc ? Math.round(m.totalOcc / m.withOcc) : 0 }))
      .filter(m => m.avgOcc > 0)
      .sort((a, b) => b.avgOcc - a.avgOcc)
      .slice(0, 12)
  }, [properties])

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm dark:shadow-none">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Ocupação por Condomínio</h3>
      <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Média de ocupação por resort/condomínio</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
          <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <YAxis type="category" dataKey="name" tick={{ fill: TICK_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
          <Tooltip formatter={(v, n) => [`${v}%`, 'Ocupação Média']} {...getTooltipStyle()} />
          <Bar dataKey="avgOcc" radius={[0, 6, 6, 0]} maxBarSize={18}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
