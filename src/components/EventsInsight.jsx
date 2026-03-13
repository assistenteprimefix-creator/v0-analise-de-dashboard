import { useMemo } from 'react'
import { Calendar } from 'lucide-react'

const EVENT_COLORS = {
  'Cheio': '#10b981',
  'Páscoa': '#f59e0b',
  'Natal': '#3b82f6',
  'Réveillon': '#8b5cf6',
  'Carnaval': '#ec4899',
  'Outros': '#64748b',
}

function colorForEvent(name) {
  return EVENT_COLORS[name] || '#06b6d4'
}

export default function EventsInsight({ properties }) {
  const { eventData, priceData } = useMemo(() => {
    const evMap = {}

    properties.forEach(p => {
      const raw = (p.eventos || '').trim()
      const keys = raw ? raw.split(/[/,;]/).map(s => s.trim()).filter(Boolean) : ['Sem Evento']
      keys.forEach(key => {
        const label = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
        if (!evMap[label]) evMap[label] = { totalOcc: 0, count: 0, minPrices: [], basePrices: [] }
        if (p.avgOccupancy > 0) { evMap[label].totalOcc += p.avgOccupancy; evMap[label].count++ }
        if (p.minPrice > 0) evMap[label].minPrices.push(p.minPrice)
        if (p.basePrice > 0) evMap[label].basePrices.push(p.basePrice)
      })
    })

    const eventData = Object.entries(evMap)
      .filter(([, v]) => v.count >= 2)
      .map(([name, v]) => ({
        name,
        avgOcc: v.count ? Math.round(v.totalOcc / v.count) : 0,
        count: v.count,
        avgMin: v.minPrices.length ? Math.round(v.minPrices.reduce((a, b) => a + b, 0) / v.minPrices.length) : 0,
        avgBase: v.basePrices.length ? Math.round(v.basePrices.reduce((a, b) => a + b, 0) / v.basePrices.length) : 0,
        color: colorForEvent(name),
      }))
      .sort((a, b) => b.avgOcc - a.avgOcc)
      .slice(0, 8)

    return { eventData }
  }, [properties])

  if (!eventData.length) return null

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2 mb-1">
        <Calendar size={14} className="text-blue-500 dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Ocupação por Evento</h3>
      </div>
      <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Ocupação média das propriedades por tipo de evento cadastrado</p>

      <div className="space-y-2.5">
        {eventData.map(ev => (
          <div key={ev.name} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-slate-400 w-24 shrink-0 truncate" title={ev.name}>{ev.name}</span>
            <div className="flex-1 bg-gray-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${ev.avgOcc}%`, background: ev.color }}
              />
            </div>
            <span className="text-xs font-semibold w-10 text-right shrink-0" style={{ color: ev.color }}>
              {ev.avgOcc}%
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-600 w-12 shrink-0 text-right">{ev.count} props</span>
          </div>
        ))}
      </div>

      {/* Price reference */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-800">
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-2">Preço base médio por evento</p>
        <div className="flex flex-wrap gap-2">
          {eventData.filter(e => e.avgBase > 0).map(ev => (
            <div key={ev.name} className="flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-slate-800/60 px-2.5 py-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ev.color }} />
              <span className="text-xs text-gray-500 dark:text-slate-400">{ev.name}:</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-white">${ev.avgBase}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
