import { useMemo } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { Sun, CloudRain, Thermometer, TrendingUp, Calendar } from 'lucide-react'
import { getTooltipStyle, GRID_COLOR, TICK_COLOR } from '../utils/chartTheme'

const SEASONS = {
  'Jan': 'winter',
  'Fev': 'winter',
  'Mar': 'spring',
  'Abr': 'spring',
  'Mai': 'spring',
  'Jun': 'summer',
  'Jul': 'summer',
  'Ago': 'summer',
  'Set': 'fall',
  'Out': 'fall',
  'Nov': 'fall',
  'Dez': 'winter',
}

const SEASON_LABELS = {
  winter: { label: 'Inverno', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  spring: { label: 'Primavera', icon: Sun, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
  summer: { label: 'Verao', icon: Thermometer, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  fall: { label: 'Outono', icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
}

const fmtUSD = v => {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`
  return `$${v.toLocaleString('en-US')}`
}

export default function SeasonalityChart({ data }) {
  const analysis = useMemo(() => {
    if (!data.length) return null

    // Group by season
    const seasonData = { winter: [], spring: [], summer: [], fall: [] }
    data.forEach(m => {
      const season = SEASONS[m.mes]
      if (season) {
        seasonData[season].push(m)
      }
    })

    // Calculate averages per season
    const seasonStats = Object.entries(seasonData).map(([season, months]) => {
      if (!months.length) return { season, avgRevenue: 0, avgOccupancy: 0, avgBookings: 0, months: 0 }
      
      const avgRevenue = months.reduce((s, m) => s + m.rental, 0) / months.length
      const avgOccupancy = months.filter(m => m.ocupacao > 0).reduce((s, m) => s + m.ocupacao, 0) / Math.max(1, months.filter(m => m.ocupacao > 0).length)
      const avgBookings = months.reduce((s, m) => s + m.bookings, 0) / months.length
      const totalRevenue = months.reduce((s, m) => s + m.rental, 0)

      return {
        season,
        avgRevenue: Math.round(avgRevenue),
        avgOccupancy: Math.round(avgOccupancy),
        avgBookings: Math.round(avgBookings),
        totalRevenue,
        months: months.length,
      }
    })

    // Find best/worst seasons
    const bestRevenue = [...seasonStats].sort((a, b) => b.avgRevenue - a.avgRevenue)[0]
    const bestOccupancy = [...seasonStats].sort((a, b) => b.avgOccupancy - a.avgOccupancy)[0]
    const worstSeason = [...seasonStats].filter(s => s.months > 0).sort((a, b) => a.avgRevenue - b.avgRevenue)[0]

    // Radar data
    const radarData = data.map(m => ({
      month: m.mes,
      revenue: m.rental,
      occupancy: m.ocupacao,
      bookings: m.bookings * 100, // Scale for visibility
    }))

    // Monthly comparison data
    const monthlyData = data.map(m => ({
      mes: m.mes,
      revenue: m.rental,
      occupancy: m.ocupacao,
      season: SEASONS[m.mes],
    }))

    return {
      seasonStats,
      bestRevenue,
      bestOccupancy,
      worstSeason,
      radarData,
      monthlyData,
    }
  }, [data])

  if (!analysis) return null

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar size={15} className="text-purple-500" />
          Analise de Sazonalidade
        </h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Season Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {analysis.seasonStats.map(s => {
            const config = SEASON_LABELS[s.season]
            const Icon = config.icon
            const isBest = s.season === analysis.bestRevenue?.season

            return (
              <div
                key={s.season}
                className={`rounded-xl border p-4 ${config.bg} ${
                  isBest ? 'border-2 border-green-400 dark:border-green-500' : 'border-gray-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={config.color} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{config.label}</span>
                  </div>
                  {isBest && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500 text-white font-medium">
                      Melhor
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{fmtUSD(s.avgRevenue)}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  {s.avgOccupancy}% ocupacao | {s.avgBookings} reservas/mes
                </p>
              </div>
            )
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-3">Padrao Mensal</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analysis.radarData}>
                  <PolarGrid stroke={GRID_COLOR} />
                  <PolarAngleAxis dataKey="month" tick={{ fill: TICK_COLOR, fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fill: TICK_COLOR, fontSize: 9 }} />
                  <Radar name="Ocupacao" dataKey="occupancy" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Tooltip {...getTooltipStyle()} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area Chart */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-3">Receita vs Ocupacao</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analysis.monthlyData} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: TICK_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: TICK_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: TICK_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    formatter={(v, name) => [name === 'revenue' ? fmtUSD(v) : `${v}%`, name === 'revenue' ? 'Receita' : 'Ocupacao']}
                    {...getTooltipStyle()}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => <span className="text-xs text-gray-600 dark:text-slate-400">{value === 'revenue' ? 'Receita' : 'Ocupacao'}</span>}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" />
                  <Area yAxisId="right" type="monotone" dataKey="occupancy" stroke="#3b82f6" strokeWidth={2} fill="url(#colorOcc)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">Alta Temporada</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {SEASON_LABELS[analysis.bestRevenue?.season]?.label || '-'}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Media de {fmtUSD(analysis.bestRevenue?.avgRevenue || 0)}/mes
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-blue-500" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Melhor Ocupacao</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {SEASON_LABELS[analysis.bestOccupancy?.season]?.label || '-'}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {analysis.bestOccupancy?.avgOccupancy || 0}% de ocupacao media
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain size={14} className="text-amber-500" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Baixa Temporada</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {SEASON_LABELS[analysis.worstSeason?.season]?.label || '-'}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Oportunidade de promocoes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
