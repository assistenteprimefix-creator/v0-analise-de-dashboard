import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const fmtUSD = v => {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`
  return `$${v}`
}

import { getTooltipStyle, GRID_COLOR, TICK_COLOR } from '../utils/chartTheme'

export default function RevenueBreakdown({ data }) {
  const chartData = data
    .filter(m => m.rental > 0)
    .map(m => ({
      mes: m.mes,
      Proprietário: m.owner,
      Empresa: m.companyTotal,
      Limpeza: m.cleaning,
      'Pool Heat': m.poolHeat,
      'Taxa Reserva': m.bookingFee,
    }))

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm dark:shadow-none">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Distribuição de Receita</h3>
      <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Como a receita é dividida por mês</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="mes" tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtUSD} tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
          <Tooltip formatter={(v, n) => [fmtUSD(v), n]} {...getTooltipStyle()} />
          <Legend wrapperStyle={{ fontSize: 11, color: TICK_COLOR }} />
          <Bar dataKey="Proprietário" stackId="a" fill="#10b981" radius={[0,0,0,0]} maxBarSize={40} />
          <Bar dataKey="Empresa" stackId="a" fill="#3b82f6" radius={[0,0,0,0]} maxBarSize={40} />
          <Bar dataKey="Limpeza" stackId="a" fill="#f59e0b" radius={[0,0,0,0]} maxBarSize={40} />
          <Bar dataKey="Pool Heat" stackId="a" fill="#06b6d4" radius={[0,0,0,0]} maxBarSize={40} />
          <Bar dataKey="Taxa Reserva" stackId="a" fill="#8b5cf6" radius={[6,6,0,0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
