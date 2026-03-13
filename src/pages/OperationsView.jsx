import { useMemo, useState } from 'react'
import { AlertTriangle, Calendar, CheckCircle2, Clock, Wrench, Star, Trophy, AlertCircle, ChevronRight, Filter, X } from 'lucide-react'
import EventsInsight from '../components/EventsInsight'
import ErrorBoundary from '../components/ErrorBoundary'

function PriorityBadge({ priority }) {
  const styles = {
    high: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25',
    medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
    low: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25',
  }
  const labels = { high: 'Alta', medium: 'Media', low: 'Baixa' }

  return (
    <span className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full border ${styles[priority]}`}>
      {labels[priority]}
    </span>
  )
}

function ActionCard({ property, onResolve }) {
  // Determine priority based on keywords
  const getPriority = (action) => {
    const lower = action.toLowerCase()
    if (lower.includes('urgente') || lower.includes('imediato') || lower.includes('critico')) return 'high'
    if (lower.includes('revisar') || lower.includes('verificar') || lower.includes('ajustar')) return 'medium'
    return 'low'
  }

  const priority = getPriority(property.acao)

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {property.name}
              </h3>
              <PriorityBadge priority={priority} />
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">
              {property.condominium} - {property.bedrooms} quartos
            </p>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
              <AlertTriangle size={14} className="text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{property.acao}</p>
            </div>
          </div>
        </div>

        {/* Property quick stats */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
          <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
            Occ: {property.avgOccupancy}%
          </span>
          {property.rating > 0 && (
            <span className="text-xs px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Star size={10} fill="currentColor" />
              {property.rating.toFixed(2)}
            </span>
          )}
          {property.guestFavorite && (
            <span className="text-xs px-2 py-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Trophy size={10} />
              Guest Fav
            </span>
          )}
          {property.eventos && (
            <span className="text-xs px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Calendar size={10} />
              {property.eventos}
            </span>
          )}
        </div>
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800">
        <button className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 flex items-center gap-1">
          <Clock size={12} />
          Ver historico
        </button>
        <button
          onClick={() => onResolve?.(property)}
          className="text-xs px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium flex items-center gap-1 transition-colors"
        >
          <CheckCircle2 size={12} />
          Marcar resolvido
        </button>
      </div>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    red: 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400',
    green: 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400',
  }

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-black/20 flex items-center justify-center">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  )
}

export default function OperationsView({ properties }) {
  const [filterPriority, setFilterPriority] = useState('all')

  const stats = useMemo(() => {
    const withAction = properties.filter(p => p.acao)
    const withEvents = properties.filter(p => p.eventos)
    const lowOccupancy = properties.filter(p => p.avgOccupancy > 0 && p.avgOccupancy < 40)
    const highPerformers = properties.filter(p => p.avgOccupancy >= 70 && p.guestFavorite)

    return {
      pendingActions: withAction.length,
      upcomingEvents: withEvents.length,
      lowOccupancy: lowOccupancy.length,
      highPerformers: highPerformers.length,
    }
  }, [properties])

  const actionsWithPriority = useMemo(() => {
    return properties
      .filter(p => p.acao)
      .map(p => {
        const lower = p.acao.toLowerCase()
        let priority = 'low'
        if (lower.includes('urgente') || lower.includes('imediato') || lower.includes('critico')) priority = 'high'
        else if (lower.includes('revisar') || lower.includes('verificar') || lower.includes('ajustar')) priority = 'medium'
        return { ...p, priority }
      })
      .filter(p => filterPriority === 'all' || p.priority === filterPriority)
      .sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 }
        return order[a.priority] - order[b.priority]
      })
  }, [properties, filterPriority])

  const handleResolve = (property) => {
    // In a real app, this would call an API
    console.log('[v0] Marking as resolved:', property.name)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard icon={AlertTriangle} label="Acoes Pendentes" value={stats.pendingActions} color="red" />
        <SummaryCard icon={Calendar} label="Eventos Proximos" value={stats.upcomingEvents} color="blue" />
        <SummaryCard icon={AlertCircle} label="Ocupacao Baixa" value={stats.lowOccupancy} color="amber" />
        <SummaryCard icon={Trophy} label="Alta Performance" value={stats.highPerformers} color="green" />
      </div>

      {/* Actions Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Wrench size={15} className="text-red-500" />
            Acoes Pendentes ({actionsWithPriority.length})
          </h2>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300"
            >
              <option value="all">Todas</option>
              <option value="high">Alta Prioridade</option>
              <option value="medium">Media Prioridade</option>
              <option value="low">Baixa Prioridade</option>
            </select>
          </div>
        </div>

        {actionsWithPriority.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} className="text-green-500" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Nenhuma acao pendente!</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Todas as propriedades estao em ordem.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {actionsWithPriority.map(p => (
              <ActionCard key={p.name} property={p} onResolve={handleResolve} />
            ))}
          </div>
        )}
      </div>

      {/* Events Section */}
      <ErrorBoundary>
        <EventsInsight properties={properties} />
      </ErrorBoundary>

      {/* Low Occupancy Alert Section */}
      {stats.lowOccupancy > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <AlertCircle size={15} className="text-amber-500" />
            Propriedades com Ocupacao Baixa ({stats.lowOccupancy})
          </h2>
          <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 overflow-hidden">
            <div className="divide-y divide-amber-100 dark:divide-amber-500/10">
              {properties
                .filter(p => p.avgOccupancy > 0 && p.avgOccupancy < 40)
                .sort((a, b) => a.avgOccupancy - b.avgOccupancy)
                .slice(0, 5)
                .map(p => (
                  <div key={p.name} className="flex items-center justify-between p-3 hover:bg-amber-100/50 dark:hover:bg-amber-500/10 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{p.condominium}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{p.avgOccupancy}%</span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
