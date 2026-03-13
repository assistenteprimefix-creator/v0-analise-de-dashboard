import { useMemo, useState } from 'react'
import { Target, TrendingUp, Calendar, CheckCircle2, AlertCircle, ChevronRight, Settings, Zap } from 'lucide-react'

const fmtUSD = v => {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`
  return `$${v.toLocaleString('en-US')}`
}

// Default goals (can be made editable)
const DEFAULT_GOALS = {
  yearlyRevenue: 3000000, // $3M
  avgOccupancy: 65,       // 65%
  guestFavorites: 50,     // 50% of properties
  monthlyBookings: 150,   // 150 bookings/month avg
}

function ProgressRing({ progress, size = 60, strokeWidth = 6, color = '#3b82f6' }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          className="text-gray-200 dark:text-slate-700"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}

function GoalCard({ icon: Icon, label, current, goal, unit = '', color = '#3b82f6', format = 'number' }) {
  const progress = goal > 0 ? (current / goal) * 100 : 0
  const isOnTrack = progress >= 75
  const isWarning = progress >= 50 && progress < 75
  const isDanger = progress < 50

  const displayCurrent = format === 'currency' ? fmtUSD(current) : `${current}${unit}`
  const displayGoal = format === 'currency' ? fmtUSD(goal) : `${goal}${unit}`

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon size={16} style={{ color }} />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
        </div>
        {isOnTrack && <CheckCircle2 size={16} className="text-green-500" />}
        {isWarning && <AlertCircle size={16} className="text-amber-500" />}
        {isDanger && <AlertCircle size={16} className="text-red-500" />}
      </div>

      <div className="flex items-center gap-4">
        <ProgressRing progress={progress} color={color} />
        <div className="flex-1">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{displayCurrent}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">Meta: {displayGoal}</p>
          <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: color }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GoalsTracker({ monthly, properties, kpis }) {
  const [showSettings, setShowSettings] = useState(false)
  const [goals, setGoals] = useState(DEFAULT_GOALS)

  const stats = useMemo(() => {
    const activeMonths = monthly.filter(m => m.rental > 0)
    const currentMonth = new Date().getMonth() // 0-11

    // YTD Revenue
    const ytdRevenue = monthly.reduce((s, m) => s + m.rental, 0)

    // Projected yearly (linear extrapolation)
    const avgMonthlyRevenue = activeMonths.length > 0 ? ytdRevenue / activeMonths.length : 0
    const projectedYearly = avgMonthlyRevenue * 12

    // Average occupancy
    const avgOcc = kpis?.avgOcc || 0

    // Guest favorites percentage
    const gfPct = properties.length > 0
      ? (properties.filter(p => p.guestFavorite).length / properties.length) * 100
      : 0

    // Average monthly bookings
    const totalBookings = monthly.reduce((s, m) => s + m.bookings, 0)
    const avgMonthlyBookings = activeMonths.length > 0 ? Math.round(totalBookings / activeMonths.length) : 0

    // Progress percentages
    const revenueProgress = goals.yearlyRevenue > 0 ? (projectedYearly / goals.yearlyRevenue) * 100 : 0
    const occProgress = goals.avgOccupancy > 0 ? (avgOcc / goals.avgOccupancy) * 100 : 0
    const gfProgress = goals.guestFavorites > 0 ? (gfPct / goals.guestFavorites) * 100 : 0
    const bookingsProgress = goals.monthlyBookings > 0 ? (avgMonthlyBookings / goals.monthlyBookings) * 100 : 0

    // Overall score
    const overallScore = Math.round((revenueProgress + occProgress + gfProgress + bookingsProgress) / 4)

    // Recommendations
    const recommendations = []
    if (occProgress < 75) {
      recommendations.push({ text: 'Aumentar ocupacao com promocoes em baixa temporada', priority: 'high' })
    }
    if (gfProgress < 50) {
      recommendations.push({ text: 'Melhorar avaliacoes para conseguir mais Guest Favorites', priority: 'medium' })
    }
    if (revenueProgress < 60) {
      recommendations.push({ text: 'Revisar estrategia de pricing para aumentar receita', priority: 'high' })
    }
    if (bookingsProgress > 100) {
      recommendations.push({ text: 'Considerar aumentar precos - demanda esta alta', priority: 'low' })
    }

    return {
      ytdRevenue,
      projectedYearly,
      avgOcc,
      gfPct,
      avgMonthlyBookings,
      overallScore,
      recommendations,
      monthsElapsed: activeMonths.length,
    }
  }, [monthly, properties, kpis, goals])

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Target size={15} className="text-green-500" />
          Metas & Projecoes 2026
        </h3>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            stats.overallScore >= 75
              ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
              : stats.overallScore >= 50
              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
              : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
          }`}>
            <Zap size={12} />
            Score: {stats.overallScore}%
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GoalCard
            icon={TrendingUp}
            label="Receita Anual"
            current={stats.projectedYearly}
            goal={goals.yearlyRevenue}
            format="currency"
            color="#10b981"
          />
          <GoalCard
            icon={Calendar}
            label="Ocupacao Media"
            current={stats.avgOcc}
            goal={goals.avgOccupancy}
            unit="%"
            color="#3b82f6"
          />
          <GoalCard
            icon={CheckCircle2}
            label="Guest Favorites"
            current={Math.round(stats.gfPct)}
            goal={goals.guestFavorites}
            unit="%"
            color="#f59e0b"
          />
          <GoalCard
            icon={Target}
            label="Reservas/Mes"
            current={stats.avgMonthlyBookings}
            goal={goals.monthlyBookings}
            color="#8b5cf6"
          />
        </div>

        {/* Projection Banner */}
        <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200 dark:border-blue-500/20 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Projecao Anual Baseada em {stats.monthsElapsed} Meses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmtUSD(stats.projectedYearly)}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                YTD: {fmtUSD(stats.ytdRevenue)} | Media Mensal: {fmtUSD(Math.round(stats.ytdRevenue / Math.max(1, stats.monthsElapsed)))}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.avgOcc.toFixed(1)}%</p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase">Ocupacao</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
              <div className="text-center px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{goals.avgOccupancy}%</p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase">Meta</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {stats.recommendations.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-3">Recomendacoes</p>
            <div className="space-y-2">
              {stats.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    rec.priority === 'high'
                      ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
                      : rec.priority === 'medium'
                      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
                      : 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'
                  }`}
                >
                  <AlertCircle
                    size={14}
                    className={
                      rec.priority === 'high'
                        ? 'text-red-500'
                        : rec.priority === 'medium'
                        ? 'text-amber-500'
                        : 'text-green-500'
                    }
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300">{rec.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
