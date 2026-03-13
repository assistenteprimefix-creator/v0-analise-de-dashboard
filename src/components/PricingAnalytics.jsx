import { useMemo, useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Bed } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis } from 'recharts'
import { getTooltipStyle, GRID_COLOR, TICK_COLOR } from '../utils/chartTheme'

const fmtUSD = v => v ? `$${v.toLocaleString('en-US')}` : '-'

const COLORS = {
  min: '#10b981',
  base: '#3b82f6',
  max: '#f59e0b',
}

function StatCard({ label, value, sub, trend, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20',
    green: 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20',
    amber: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20',
  }

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {trend !== undefined && (
          <span className={`text-xs font-medium flex items-center gap-0.5 mb-1 ${trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function PricingAnalytics({ properties }) {
  const [view, setView] = useState('bedrooms') // bedrooms | condos

  const stats = useMemo(() => {
    const withPrices = properties.filter(p => p.basePrice > 0)
    if (!withPrices.length) return null

    const minPrices = withPrices.map(p => p.minPrice).filter(v => v > 0)
    const basePrices = withPrices.map(p => p.basePrice)
    const maxPrices = withPrices.map(p => p.maxPrice).filter(v => v > 0)

    return {
      avgMin: Math.round(minPrices.reduce((s, v) => s + v, 0) / minPrices.length) || 0,
      avgBase: Math.round(basePrices.reduce((s, v) => s + v, 0) / basePrices.length),
      avgMax: Math.round(maxPrices.reduce((s, v) => s + v, 0) / maxPrices.length) || 0,
      spread: Math.round(((maxPrices.reduce((s, v) => s + v, 0) / maxPrices.length) - (minPrices.reduce((s, v) => s + v, 0) / minPrices.length)) / (minPrices.reduce((s, v) => s + v, 0) / minPrices.length) * 100) || 0,
      count: withPrices.length,
    }
  }, [properties])

  const byBedrooms = useMemo(() => {
    const map = {}
    properties.forEach(p => {
      if (!p.basePrice) return
      const key = p.bedrooms
      if (!map[key]) map[key] = { min: [], base: [], max: [], count: 0 }
      if (p.minPrice) map[key].min.push(p.minPrice)
      map[key].base.push(p.basePrice)
      if (p.maxPrice) map[key].max.push(p.maxPrice)
      map[key].count++
    })

    return Object.entries(map)
      .map(([beds, data]) => ({
        name: `${beds}Q`,
        bedrooms: parseInt(beds),
        min: Math.round(data.min.reduce((s, v) => s + v, 0) / data.min.length) || 0,
        base: Math.round(data.base.reduce((s, v) => s + v, 0) / data.base.length),
        max: Math.round(data.max.reduce((s, v) => s + v, 0) / data.max.length) || 0,
        count: data.count,
      }))
      .sort((a, b) => a.bedrooms - b.bedrooms)
  }, [properties])

  const byCondos = useMemo(() => {
    const map = {}
    properties.forEach(p => {
      if (!p.basePrice || !p.condominium) return
      const key = p.condominium
      if (!map[key]) map[key] = { min: [], base: [], max: [], count: 0 }
      if (p.minPrice) map[key].min.push(p.minPrice)
      map[key].base.push(p.basePrice)
      if (p.maxPrice) map[key].max.push(p.maxPrice)
      map[key].count++
    })

    return Object.entries(map)
      .map(([condo, data]) => ({
        name: condo.length > 15 ? condo.slice(0, 15) + '...' : condo,
        fullName: condo,
        min: Math.round(data.min.reduce((s, v) => s + v, 0) / data.min.length) || 0,
        base: Math.round(data.base.reduce((s, v) => s + v, 0) / data.base.length),
        max: Math.round(data.max.reduce((s, v) => s + v, 0) / data.max.length) || 0,
        count: data.count,
      }))
      .sort((a, b) => b.base - a.base)
  }, [properties])

  const priceVsOccupancy = useMemo(() => {
    return properties
      .filter(p => p.basePrice > 0 && p.avgOccupancy > 0)
      .map(p => ({
        name: p.name,
        price: p.basePrice,
        occupancy: p.avgOccupancy,
        revenue: p.ytdRental || 0,
        bedrooms: p.bedrooms,
      }))
  }, [properties])

  if (!stats) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 text-center">
        <DollarSign size={32} className="text-gray-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-gray-400 dark:text-slate-500">Nenhum dado de preco disponivel</p>
      </div>
    )
  }

  const chartData = view === 'bedrooms' ? byBedrooms : byCondos

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden shadow-sm dark:shadow-none">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-green-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Analise de Precos</h3>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg">
          <button
            onClick={() => setView('bedrooms')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              view === 'bedrooms' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400'
            }`}
          >
            Por Quartos
          </button>
          <button
            onClick={() => setView('condos')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              view === 'condos' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400'
            }`}
          >
            Por Condominio
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Preco Minimo Medio" value={fmtUSD(stats.avgMin)} color="green" />
          <StatCard label="Preco Base Medio" value={fmtUSD(stats.avgBase)} color="blue" />
          <StatCard label="Preco Maximo Medio" value={fmtUSD(stats.avgMax)} color="amber" />
          <StatCard label="Spread Medio" value={`${stats.spread}%`} sub="Diferenca min/max" />
        </div>

        {/* Price Comparison Chart */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Comparacao de Precos {view === 'bedrooms' ? 'por Quartos' : 'por Condominio'}
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: TICK_COLOR, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                angle={view === 'condos' ? -45 : 0}
                textAnchor={view === 'condos' ? 'end' : 'middle'}
                height={view === 'condos' ? 80 : 30}
              />
              <YAxis
                tick={{ fill: TICK_COLOR, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${v}`}
              />
              <Tooltip
                formatter={(v, name) => [fmtUSD(v), name === 'min' ? 'Minimo' : name === 'base' ? 'Base' : 'Maximo']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || payload?.[0]?.payload?.name || ''}
                {...getTooltipStyle()}
              />
              <Bar dataKey="min" fill={COLORS.min} radius={[4, 4, 0, 0]} maxBarSize={40} name="Minimo" />
              <Bar dataKey="base" fill={COLORS.base} radius={[4, 4, 0, 0]} maxBarSize={40} name="Base" />
              <Bar dataKey="max" fill={COLORS.max} radius={[4, 4, 0, 0]} maxBarSize={40} name="Maximo" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Price vs Occupancy Scatter */}
        {priceVsOccupancy.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Relacao Preco Base vs Ocupacao
            </h4>
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis
                  dataKey="price"
                  type="number"
                  tick={{ fill: TICK_COLOR, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `$${v}`}
                  name="Preco Base"
                />
                <YAxis
                  dataKey="occupancy"
                  type="number"
                  tick={{ fill: TICK_COLOR, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}%`}
                  name="Ocupacao"
                  domain={[0, 100]}
                />
                <ZAxis dataKey="revenue" range={[50, 400]} name="Receita YTD" />
                <Tooltip
                  formatter={(v, name) => {
                    if (name === 'price' || name === 'Preco Base') return [fmtUSD(v), 'Preco Base']
                    if (name === 'occupancy' || name === 'Ocupacao') return [`${v}%`, 'Ocupacao']
                    if (name === 'revenue' || name === 'Receita YTD') return [fmtUSD(v), 'Receita YTD']
                    return [v, name]
                  }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
                  {...getTooltipStyle()}
                />
                <Scatter data={priceVsOccupancy} fill="#3b82f6" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-400 dark:text-slate-500 text-center mt-2">
              Tamanho do ponto representa a receita YTD
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.min }} />
            <span className="text-xs text-gray-500 dark:text-slate-400">Minimo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.base }} />
            <span className="text-xs text-gray-500 dark:text-slate-400">Base</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.max }} />
            <span className="text-xs text-gray-500 dark:text-slate-400">Maximo</span>
          </div>
        </div>
      </div>
    </div>
  )
}
