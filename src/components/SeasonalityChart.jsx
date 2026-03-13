import { useMemo } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react'
import { getTooltipStyle, GRID_COLOR, TICK_COLOR } from '../utils/chartTheme'

// Definicao de temporadas conforme regra do cliente
const SEASONS = {
  'Jan': 'alta',   // Alta Temporada
  'Fev': 'alta',   // Alta Temporada
  'Mar': 'alta',   // Alta Temporada
  'Abr': 'media',  // Media Temporada
  'Mai': 'baixa',  // Baixa Temporada
  'Jun': 'media',  // Media Temporada
  'Jul': 'alta',   // Alta Temporada
  'Ago': 'baixa',  // Baixa Temporada
  'Set': 'baixa',  // Baixa Temporada
  'Out': 'baixa',  // Baixa Temporada
  'Nov': 'media',  // Media Temporada
  'Dez': 'alta',   // Alta Temporada
}

const SEASON_LABELS = {
  alta: { label: 'Alta Temporada', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-200 dark:border-green-500/30' },
  media: { label: 'Media Temporada', icon: Minus, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30' },
  baixa: { label: 'Baixa Temporada', icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/30' },
}

// Meses por temporada para referencia
const SEASON_MONTHS = {
  alta: ['Jan', 'Fev', 'Mar', 'Jul', 'Dez'],
  media: ['Abr', 'Jun', 'Nov'],
  baixa: ['Mai', 'Ago', 'Set', 'Out'],
}

const fmtUSD = v => {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`
  return `$${v.toLocaleString('en-US')}`
}

export default function SeasonalityChart({ data }) {
  const analysis = useMemo(() => {
    if (!data.length) return null

    // Group by season (Alta, Media, Baixa)
    const seasonData = { alta: [], media: [], baixa: [] }
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
        {/* Season Cards - Ordenados: Alta, Media, Baixa */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {['alta', 'media', 'baixa'].map(seasonKey => {
            const s = analysis.seasonStats.find(stat => stat.season === seasonKey)
            if (!s) return null
            const config = SEASON_LABELS[s.season]
            const Icon = config.icon

            return (
              <div
                key={s.season}
                className={`rounded-xl border p-4 ${config.bg} ${config.border}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                      <Icon size={16} className={config.color} />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{config.label}</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmtUSD(s.avgRevenue)}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Media por mes | {s.months} meses
                </p>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700/50 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500">Ocupacao</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.avgOccupancy}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500">Reservas/mes</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.avgBookings}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">
                    Meses: {SEASON_MONTHS[s.season].join(', ')}
                  </p>
                </div>
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

        {/* Insights e Recomendacoes */}
        <div className="rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Calendar size={14} className="text-blue-500" />
            Insights de Temporada
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Maior Receita</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {SEASON_LABELS[analysis.bestRevenue?.season]?.label || '-'}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {fmtUSD(analysis.bestRevenue?.avgRevenue || 0)}/mes em media
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Maior Ocupacao</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {SEASON_LABELS[analysis.bestOccupancy?.season]?.label || '-'}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {analysis.bestOccupancy?.avgOccupancy || 0}% de ocupacao
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Oportunidade</p>
              <p className="font-medium text-gray-900 dark:text-white">Baixa Temporada</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Maio, Ago, Set, Out - Promocoes recomendadas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
