export default function KPICard({ icon: Icon, label, value, sub, color = 'blue', trend }) {
  const colors = {
    blue:   { bg: 'from-blue-50 to-blue-50/50 dark:from-blue-500/10 dark:to-blue-600/5',     icon: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',     border: 'border-blue-100 dark:border-blue-500/20' },
    cyan:   { bg: 'from-cyan-50 to-cyan-50/50 dark:from-cyan-500/10 dark:to-cyan-600/5',     icon: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',     border: 'border-cyan-100 dark:border-cyan-500/20' },
    green:  { bg: 'from-green-50 to-green-50/50 dark:from-green-500/10 dark:to-green-600/5', icon: 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-500/20' },
    teal:   { bg: 'from-teal-50 to-teal-50/50 dark:from-teal-500/10 dark:to-teal-600/5',     icon: 'bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400',     border: 'border-teal-100 dark:border-teal-500/20' },
    purple: { bg: 'from-purple-50 to-purple-50/50 dark:from-purple-500/10 dark:to-purple-600/5', icon: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-500/20' },
    orange: { bg: 'from-orange-50 to-orange-50/50 dark:from-orange-500/10 dark:to-orange-600/5', icon: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-500/20' },
    rose:   { bg: 'from-rose-50 to-rose-50/50 dark:from-rose-500/10 dark:to-rose-600/5',     icon: 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400',     border: 'border-rose-100 dark:border-rose-500/20' },
  }
  const c = colors[color] || colors.blue

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} bg-white dark:bg-[#111827] p-5 shadow-sm dark:shadow-none`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
          <Icon size={18} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">{sub}</p>}
    </div>
  )
}
