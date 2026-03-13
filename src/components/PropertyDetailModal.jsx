import { useMemo } from 'react'
import { X, Star, Trophy, PawPrint, Calendar, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Home, Bed, MapPin, ExternalLink } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getTooltipStyle, GRID_COLOR, TICK_COLOR } from '../utils/chartTheme'

const MONTHS = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']

const fmtUSD = v => v ? `$${v.toLocaleString('en-US')}` : '-'
const fmtUSDk = v => {
  if (!v) return '-'
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`
  return `$${v}`
}

function StatBox({ label, value, sub, icon: Icon, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400',
    cyan: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-100 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400',
    red: 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400',
  }

  return (
    <div className={`rounded-xl border p-3 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={14} />}
        <span className="text-xs text-gray-500 dark:text-slate-400">{label}</span>
      </div>
      <p className="text-lg font-bold">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function OccupancyChart({ occupancy }) {
  const data = MONTHS.map(m => ({
    month: m,
    occupancy: occupancy?.[m] ?? 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="occGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: TICK_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: TICK_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
        <Tooltip
          formatter={v => [`${v}%`, 'Ocupacao']}
          {...getTooltipStyle()}
        />
        <Area type="monotone" dataKey="occupancy" stroke="#3b82f6" strokeWidth={2} fill="url(#occGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function PricingBar({ property }) {
  const data = [
    { name: 'Min', value: property.minPrice, color: '#10b981' },
    { name: 'Base', value: property.basePrice, color: '#3b82f6' },
    { name: 'Max', value: property.maxPrice, color: '#f59e0b' },
  ].filter(d => d.value > 0)

  if (!data.length) return null

  return (
    <div className="flex items-end gap-3 h-20">
      {data.map(d => {
        const maxVal = Math.max(property.minPrice, property.basePrice, property.maxPrice)
        const height = maxVal > 0 ? (d.value / maxVal) * 100 : 0
        return (
          <div key={d.name} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full rounded-t-lg transition-all"
              style={{ height: `${height}%`, backgroundColor: d.color, minHeight: '8px' }}
            />
            <span className="text-xs font-medium" style={{ color: d.color }}>{fmtUSD(d.value)}</span>
            <span className="text-[10px] text-gray-400 dark:text-slate-500">{d.name}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function PropertyDetailModal({ property, onClose, allProperties = [] }) {
  if (!property) return null

  // Calculate property rank
  const rank = useMemo(() => {
    if (!allProperties.length) return null
    const sorted = [...allProperties].filter(p => p.ytdRental > 0).sort((a, b) => b.ytdRental - a.ytdRental)
    const idx = sorted.findIndex(p => p.name === property.name)
    return idx >= 0 ? idx + 1 : null
  }, [allProperties, property.name])

  // Get condominium average
  const condoAvg = useMemo(() => {
    const sameCondos = allProperties.filter(p => p.condominium === property.condominium && p.avgOccupancy > 0)
    if (!sameCondos.length) return null
    return Math.round(sameCondos.reduce((s, p) => s + p.avgOccupancy, 0) / sameCondos.length)
  }, [allProperties, property.condominium])

  // Calculate occupancy trend
  const occTrend = useMemo(() => {
    const vals = MONTHS.map(m => property.occupancy?.[m] ?? 0).filter(v => v > 0)
    if (vals.length < 2) return null
    const recent = vals.slice(-3)
    const earlier = vals.slice(0, 3)
    const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length
    const earlierAvg = earlier.reduce((s, v) => s + v, 0) / earlier.length
    return earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg * 100) : null
  }, [property.occupancy])

  const bestMonth = useMemo(() => {
    let best = { month: null, val: 0 }
    MONTHS.forEach(m => {
      const v = property.occupancy?.[m] ?? 0
      if (v > best.val) best = { month: m, val: v }
    })
    return best.month ? best : null
  }, [property.occupancy])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#111827] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-gray-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Home size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{property.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin size={12} /> {property.condominium}
                </span>
                <span className="text-sm text-gray-400 dark:text-slate-500">|</span>
                <span className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
                  <Bed size={12} /> {property.bedrooms} quartos
                </span>
                {property.propertyId && (
                  <>
                    <span className="text-sm text-gray-400 dark:text-slate-500">|</span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">ID: {property.propertyId}</span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {property.guestFavorite && (
                  <span className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Trophy size={10} /> Guest Favorite
                  </span>
                )}
                {property.isPet && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <PawPrint size={10} /> Pet Friendly
                  </span>
                )}
                {property.rating > 0 && (
                  <span className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> {property.rating.toFixed(2)}
                  </span>
                )}
                {rank && (
                  <span className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                    #{rank} em receita
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
          {/* Action Alert */}
          {property.acao && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">Acao Pendente</p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">{property.acao}</p>
              </div>
            </div>
          )}

          {/* Event Alert */}
          {property.eventos && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
              <Calendar size={18} className="text-purple-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">Evento Proximo</p>
                <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">{property.eventos}</p>
              </div>
            </div>
          )}

          {/* Revenue Stats */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <DollarSign size={14} className="text-green-500" /> Receita YTD
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Rental Total" value={fmtUSDk(property.ytdRental)} icon={DollarSign} color="cyan" />
              <StatBox label="Proprietario" value={fmtUSDk(property.ownerYTD)} icon={TrendingUp} color="green" />
              <StatBox label="Empresa" value={fmtUSDk(property.companyYTD)} icon={TrendingUp} color="purple" />
              <StatBox label="Media Mensal" value={fmtUSDk(property.avgMonthlyRental)} sub={`${property.avgBookings?.toFixed(1) || 0} reservas/mes`} icon={Calendar} color="blue" />
            </div>
          </div>

          {/* Occupancy Chart */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-500" /> Ocupacao Mensal
              {condoAvg && (
                <span className="text-xs text-gray-400 dark:text-slate-500 font-normal ml-auto">
                  Media {property.condominium}: {condoAvg}%
                </span>
              )}
            </h3>
            <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 p-4">
              <OccupancyChart occupancy={property.occupancy} />
              <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{property.avgOccupancy}%</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Media Anual</p>
                </div>
                {bestMonth && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{bestMonth.val}%</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Melhor ({bestMonth.month})</p>
                  </div>
                )}
                {occTrend !== null && (
                  <div className="text-center">
                    <p className={`text-lg font-bold flex items-center gap-1 ${occTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {occTrend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {occTrend > 0 ? '+' : ''}{occTrend.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Tendencia</p>
                  </div>
                )}
                {condoAvg && (
                  <div className="text-center">
                    <p className={`text-lg font-bold ${property.avgOccupancy >= condoAvg ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {property.avgOccupancy >= condoAvg ? '+' : ''}{property.avgOccupancy - condoAvg}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">vs Condominio</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <DollarSign size={14} className="text-amber-500" /> Faixa de Precos
              </h3>
              <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 p-4">
                <PricingBar property={property} />
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Acoes Rapidas</h3>
              <div className="space-y-2">
                {property.propertyId && (
                  <a
                    href={`https://www.airbnb.com/rooms/${property.propertyId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5A5F] hover:bg-[#e54950] text-white text-sm font-medium transition-colors"
                  >
                    <ExternalLink size={14} />
                    Ver no Airbnb
                  </a>
                )}
                <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors">
                  <Calendar size={14} />
                  Ver Calendario
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm font-medium transition-colors">
                  <TrendingUp size={14} />
                  Comparar com outras
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
