import { useMemo } from 'react'
import { TrendingUp, BarChart2, Trophy, Star, DollarSign, Zap, AlertTriangle, Home } from 'lucide-react'

const fmtUSD = v => {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`
  return `$${v.toLocaleString('en-US')}`
}

const COLORS = {
  blue:   'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/25',
  cyan:   'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/25',
  green:  'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/25',
  amber:  'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/25',
  purple: 'bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/25',
  orange: 'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/25',
}

function InsightCard({ icon: Icon, color, label, value, sub }) {
  const c = COLORS[color] || COLORS.blue
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${c}`}>
      <div className="mt-0.5 shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function InsightsPanel({ monthly, properties }) {
  const insights = useMemo(() => {
    const active = monthly.filter(m => m.rental > 0)
    if (!active.length || !properties.length) return []

    // Best revenue month
    const bestRev = [...active].sort((a, b) => b.rental - a.rental)[0]

    // Best occupancy month
    const bestOcc = [...active].filter(m => m.ocupacao > 0).sort((a, b) => b.ocupacao - a.ocupacao)[0]

    // Avg revenue per booking
    const totalBookings = active.reduce((s, m) => s + m.bookings, 0)
    const totalRental = active.reduce((s, m) => s + m.rental, 0)
    const avgRevPerBooking = totalBookings ? Math.round(totalRental / totalBookings) : 0

    // Best resort by avg occupancy
    const condoMap = {}
    properties.forEach(p => {
      if (!p.condominium || !p.avgOccupancy) return
      if (!condoMap[p.condominium]) condoMap[p.condominium] = { total: 0, count: 0 }
      condoMap[p.condominium].total += p.avgOccupancy
      condoMap[p.condominium].count++
    })
    const bestCondo = Object.entries(condoMap)
      .map(([name, v]) => ({ name, avg: Math.round(v.total / v.count), count: v.count }))
      .filter(c => c.count >= 2)
      .sort((a, b) => b.avg - a.avg)[0]

    // Guest Favorite stats
    const gfCount = properties.filter(p => p.guestFavorite).length
    const gfPct = Math.round(gfCount / properties.length * 100)

    // High occupancy (≥60%)
    const withOcc = properties.filter(p => p.avgOccupancy > 0)
    const highOcc = withOcc.filter(p => p.avgOccupancy >= 60).length
    const highOccPct = withOcc.length ? Math.round(highOcc / withOcc.length * 100) : 0

    // Revenue efficiency: month with best revenue/booking ratio
    const efficiency = active
      .filter(m => m.bookings > 0)
      .map(m => ({ mes: m.mes, ratio: Math.round(m.rental / m.bookings) }))
      .sort((a, b) => b.ratio - a.ratio)[0]

    return [
      {
        icon: TrendingUp, color: 'blue',
        label: 'Mês mais rentável',
        value: bestRev ? `${bestRev.mes} · ${fmtUSD(bestRev.rental)}` : '—',
        sub: `${bestRev?.bookings} reservas no mês`,
      },
      {
        icon: BarChart2, color: 'cyan',
        label: 'Pico de ocupação',
        value: bestOcc ? `${bestOcc.mes} · ${bestOcc.ocupacao.toFixed(1)}%` : '—',
        sub: 'maior taxa mensal de ocupação',
      },
      {
        icon: Trophy, color: 'amber',
        label: 'Resort destaque',
        value: bestCondo ? `${bestCondo.name.split(' ').slice(0,2).join(' ')}` : '—',
        sub: bestCondo ? `${bestCondo.avg}% ocupação média` : '',
      },
      {
        icon: Star, color: 'green',
        label: 'Guest Favorites',
        value: `${gfCount} props (${gfPct}%)`,
        sub: 'com selo Airbnb Guest Favorite',
      },
      {
        icon: DollarSign, color: 'purple',
        label: 'Receita por reserva',
        value: fmtUSD(avgRevPerBooking),
        sub: `média geral YTD`,
      },
      {
        icon: Zap, color: 'orange',
        label: 'Ocupação ≥60%',
        value: `${highOcc} de ${withOcc.length} props`,
        sub: `${highOccPct}% do portfólio ativo`,
      },
    ]
  }, [monthly, properties])

  if (!insights.length) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <Zap size={15} className="text-amber-400" />
        Insights Automáticos
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
      </div>
    </div>
  )
}
