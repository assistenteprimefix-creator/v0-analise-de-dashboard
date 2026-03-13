import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const fmtCurrency = v => {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`
  return `$${v}`
}

import { getTooltipStyle, GRID_COLOR, TICK_COLOR } from '../utils/chartTheme'

// Only include months that have real data
function activeMonths(data) {
  return data.filter(m => m.bookings > 0 || m.rental > 0)
}

export function RevenueChart({ data }) {
  const chartData = activeMonths(data)
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm dark:shadow-none">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Receita Mensal</h3>
      <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Rental Total vs Proprietário vs Empresa</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gradRental" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradOwner" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCompany" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="mes" tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtCurrency} tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
          <Tooltip formatter={(v, n) => [fmtCurrency(v), n]} {...getTooltipStyle()} />
          <Legend wrapperStyle={{ fontSize: 11, color: TICK_COLOR }} />
          <Area type="monotone" dataKey="rental" name="Rental" stroke="#3b82f6" fill="url(#gradRental)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="owner" name="Proprietário" stroke="#10b981" fill="url(#gradOwner)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="companyTotal" name="Empresa" stroke="#f59e0b" fill="url(#gradCompany)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function OccupancyChart({ data }) {
  const chartData = activeMonths(data)
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm dark:shadow-none">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Taxa de Ocupação</h3>
      <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Ocupação média mensal de todas as propriedades</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gradOcc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
              <stop offset="100%" stopColor="#0284c7" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="mes" tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `${v}%`} tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} width={40} domain={[0, 100]} />
          <Tooltip formatter={v => [`${v.toFixed(1)}%`, 'Ocupação']} {...getTooltipStyle()} />
          <Bar dataKey="ocupacao" name="Ocupação" fill="url(#gradOcc)" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BookingsChart({ data }) {
  const chartData = activeMonths(data)
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm dark:shadow-none">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Reservas por Mês</h3>
      <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Total de bookings confirmados</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gradBookings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="mes" tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
          <Tooltip formatter={v => [v, 'Reservas']} {...getTooltipStyle()} />
          <Bar dataKey="bookings" name="Reservas" fill="url(#gradBookings)" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
