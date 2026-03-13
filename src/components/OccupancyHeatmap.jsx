import { useMemo, useState } from 'react'
import { Grid3x3, ChevronDown, ChevronUp, Filter } from 'lucide-react'

const MONTHS = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']

function getOccColor(value) {
  if (value === 0) return 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'
  if (value >= 80) return 'bg-green-500 text-white'
  if (value >= 60) return 'bg-green-400 text-white'
  if (value >= 40) return 'bg-amber-400 text-white'
  if (value >= 20) return 'bg-orange-400 text-white'
  return 'bg-red-400 text-white'
}

function HeatCell({ value, onClick }) {
  return (
    <div
      className={`w-full aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all ${getOccColor(value)}`}
      onClick={onClick}
      title={`${value}%`}
    >
      {value > 0 ? value : '-'}
    </div>
  )
}

export default function OccupancyHeatmap({ properties, onPropertyClick }) {
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [filterCondo, setFilterCondo] = useState('all')
  const [collapsed, setCollapsed] = useState(false)

  const condos = useMemo(() => {
    const set = new Set(properties.map(p => p.condominium).filter(Boolean))
    return Array.from(set).sort()
  }, [properties])

  const sorted = useMemo(() => {
    let list = [...properties].filter(p => {
      if (filterCondo !== 'all' && p.condominium !== filterCondo) return false
      return true
    })

    list.sort((a, b) => {
      let va, vb
      if (sortBy === 'name') {
        va = a.name.toLowerCase()
        vb = b.name.toLowerCase()
      } else if (sortBy === 'avg') {
        va = a.avgOccupancy || 0
        vb = b.avgOccupancy || 0
      } else if (sortBy === 'condo') {
        va = a.condominium?.toLowerCase() || ''
        vb = b.condominium?.toLowerCase() || ''
      } else {
        va = a.occupancy?.[sortBy] ?? 0
        vb = b.occupancy?.[sortBy] ?? 0
      }

      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [properties, sortBy, sortDir, filterCondo])

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortDir(col === 'name' || col === 'condo' ? 'asc' : 'desc')
    }
  }

  // Calculate column averages
  const monthAverages = useMemo(() => {
    const avgs = {}
    MONTHS.forEach(m => {
      const vals = sorted.map(p => p.occupancy?.[m] ?? 0).filter(v => v > 0)
      avgs[m] = vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0
    })
    return avgs
  }, [sorted])

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden shadow-sm dark:shadow-none">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Grid3x3 size={16} className="text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Heatmap de Ocupacao</h3>
          <span className="text-xs text-gray-400 dark:text-slate-500">({sorted.length} propriedades)</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterCondo}
            onChange={e => setFilterCondo(e.target.value)}
            className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300"
          >
            <option value="all">Todos Condominios</option>
            {condos.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors"
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 flex items-center gap-4 flex-wrap text-xs">
        <span className="text-gray-500 dark:text-slate-400">Legenda:</span>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-green-500" />
          <span className="text-gray-500 dark:text-slate-400">80%+</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-green-400" />
          <span className="text-gray-500 dark:text-slate-400">60-79%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-amber-400" />
          <span className="text-gray-500 dark:text-slate-400">40-59%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-orange-400" />
          <span className="text-gray-500 dark:text-slate-400">20-39%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-red-400" />
          <span className="text-gray-500 dark:text-slate-400">{`<`}20%</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      {!collapsed && (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Month Headers */}
            <div className="grid grid-cols-[200px_repeat(12,1fr)_60px] gap-1 px-4 py-2 bg-gray-50 dark:bg-slate-800/30 border-b border-gray-200 dark:border-slate-800">
              <button
                className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 flex items-center gap-1"
                onClick={() => toggleSort('name')}
              >
                Propriedade
                {sortBy === 'name' && (sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
              </button>
              {MONTHS.map(m => (
                <button
                  key={m}
                  className="text-center text-[10px] font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                  onClick={() => toggleSort(m)}
                >
                  {m}
                  {sortBy === m && (sortDir === 'asc' ? <ChevronUp size={8} className="inline ml-0.5" /> : <ChevronDown size={8} className="inline ml-0.5" />)}
                </button>
              ))}
              <button
                className="text-center text-[10px] font-semibold text-blue-500 dark:text-blue-400 hover:text-blue-600"
                onClick={() => toggleSort('avg')}
              >
                Media
                {sortBy === 'avg' && (sortDir === 'asc' ? <ChevronUp size={8} className="inline ml-0.5" /> : <ChevronDown size={8} className="inline ml-0.5" />)}
              </button>
            </div>

            {/* Property Rows */}
            <div className="divide-y divide-gray-100 dark:divide-slate-800/60 max-h-[400px] overflow-y-auto">
              {sorted.map(p => (
                <div
                  key={p.name}
                  className="grid grid-cols-[200px_repeat(12,1fr)_60px] gap-1 px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div
                    className="text-xs text-gray-700 dark:text-slate-300 truncate pr-2 cursor-pointer hover:text-blue-500"
                    onClick={() => onPropertyClick?.(p)}
                    title={p.name}
                  >
                    {p.name}
                  </div>
                  {MONTHS.map(m => (
                    <HeatCell
                      key={m}
                      value={p.occupancy?.[m] ?? 0}
                      onClick={() => onPropertyClick?.(p)}
                    />
                  ))}
                  <div className="flex items-center justify-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      p.avgOccupancy >= 60 ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                      p.avgOccupancy >= 40 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                      'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                    }`}>
                      {p.avgOccupancy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Monthly Averages Row */}
            <div className="grid grid-cols-[200px_repeat(12,1fr)_60px] gap-1 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border-t border-blue-200 dark:border-blue-500/20">
              <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">Media Mensal</div>
              {MONTHS.map(m => (
                <div key={m} className="flex items-center justify-center">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    {monthAverages[m]}%
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-center">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                  {sorted.length ? Math.round(sorted.reduce((s, p) => s + (p.avgOccupancy || 0), 0) / sorted.length) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
