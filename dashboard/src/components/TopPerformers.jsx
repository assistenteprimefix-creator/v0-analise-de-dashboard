import { TrendingUp, TrendingDown, Star, Trophy } from 'lucide-react'

export default function TopPerformers({ properties }) {
  if (!properties.length) return null

  const withOcc = properties.filter(p => p.avgOccupancy > 0)
  const top5 = [...withOcc].sort((a, b) => b.avgOccupancy - a.avgOccupancy).slice(0, 5)
  const bottom5 = [...withOcc].sort((a, b) => a.avgOccupancy - b.avgOccupancy).slice(0, 5)

  const topRated = [...properties]
    .filter(p => p.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <PerfCard title="Top Ocupação" icon={TrendingUp} color="green" items={top5} field="avgOccupancy" fmt={v => `${v}%`} />
      <PerfCard title="Baixa Ocupação" icon={TrendingDown} color="red" items={bottom5} field="avgOccupancy" fmt={v => `${v}%`} />
      <PerfCard title="Melhor Avaliação" icon={Star} color="amber" items={topRated} field="rating" fmt={v => v.toFixed(2)} />
    </div>
  )
}

function PerfCard({ title, icon: Icon, color, items, field, fmt }) {
  const colors = {
    green: { border: 'border-green-100 dark:border-green-500/20', icon: 'text-green-600 dark:text-green-400', badge: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' },
    red:   { border: 'border-red-100 dark:border-red-500/20',     icon: 'text-red-600 dark:text-red-400',     badge: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' },
    amber: { border: 'border-amber-100 dark:border-amber-500/20', icon: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' },
  }
  const c = colors[color]

  return (
    <div className={`rounded-2xl border ${c.border} bg-white dark:bg-[#111827] p-4 shadow-sm dark:shadow-none`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className={c.icon} />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((p, i) => (
          <div key={p.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-gray-300 dark:text-slate-600 w-4 shrink-0">{i + 1}.</span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{p.bedrooms} 🛏️ · {p.condominium?.split(' ')[0]}</p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${c.badge}`}>
              {fmt(p[field])}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
