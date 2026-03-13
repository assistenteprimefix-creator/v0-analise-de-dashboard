import { useState, useMemo } from 'react'
import { X, Plus, Search, Star, Trophy, PawPrint, TrendingUp, TrendingDown, Check, Minus } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from 'recharts'

const MONTHS = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

const fmtUSD = v => v ? `$${v.toLocaleString('en-US')}` : '-'
const fmtUSDk = v => {
  if (!v) return '-'
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`
  return `$${v}`
}

function PropertySelector({ properties, selected, onSelect, onRemove, maxSelections = 4 }) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search) return properties.slice(0, 10)
    return properties
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 10)
  }, [properties, search])

  const canAdd = selected.length < maxSelections

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {selected.map((p, i) => (
          <div
            key={p.name}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
            style={{ borderColor: COLORS[i], backgroundColor: `${COLORS[i]}15` }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
            <span className="text-sm font-medium text-gray-800 dark:text-white">{p.name}</span>
            <button
              onClick={() => onRemove(p)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {canAdd && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            <Plus size={14} />
            <span className="text-sm">Adicionar</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="relative">
          <div className="absolute inset-0 -m-2 bg-black/20 rounded-lg" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl overflow-hidden z-10">
            <div className="p-2 border-b border-gray-200 dark:border-slate-700">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar propriedade..."
                  className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-slate-900 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filtered.map(p => {
                const isSelected = selected.some(s => s.name === p.name)
                return (
                  <button
                    key={p.name}
                    onClick={() => {
                      if (!isSelected) {
                        onSelect(p)
                        setIsOpen(false)
                        setSearch('')
                      }
                    }}
                    disabled={isSelected}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                      isSelected ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">{p.condominium} - {p.bedrooms}Q</p>
                    </div>
                    {isSelected && <Check size={14} className="text-green-500" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CompareRow({ label, values, format = 'text', highlight = 'none' }) {
  const best = highlight === 'max' ? Math.max(...values.filter(v => typeof v === 'number')) : 
               highlight === 'min' ? Math.min(...values.filter(v => typeof v === 'number' && v > 0)) : null

  return (
    <div className="grid grid-cols-[140px_repeat(4,1fr)] gap-2 py-2.5 border-b border-gray-100 dark:border-slate-800 last:border-0">
      <div className="text-xs text-gray-500 dark:text-slate-400 font-medium">{label}</div>
      {values.map((v, i) => {
        const isBest = best !== null && v === best
        let display = v
        if (format === 'currency') display = fmtUSDk(v)
        else if (format === 'percent') display = v ? `${v}%` : '-'
        else if (format === 'boolean') display = v ? <Check size={14} className="text-green-500" /> : <Minus size={14} className="text-gray-300" />
        else if (format === 'rating') display = v ? (
          <span className="flex items-center gap-1 text-amber-500">
            <Star size={10} fill="currentColor" />{v.toFixed(2)}
          </span>
        ) : '-'

        return (
          <div
            key={i}
            className={`text-sm text-center ${
              isBest ? 'font-bold text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-slate-300'
            }`}
          >
            {display}
          </div>
        )
      })}
    </div>
  )
}

export default function PropertyComparator({ properties, initialSelection = [] }) {
  const [selected, setSelected] = useState(initialSelection.slice(0, 4))

  const handleSelect = (p) => {
    if (selected.length < 4) {
      setSelected([...selected, p])
    }
  }

  const handleRemove = (p) => {
    setSelected(selected.filter(s => s.name !== p.name))
  }

  // Normalize data for radar chart (0-100 scale)
  const radarData = useMemo(() => {
    if (selected.length < 2) return []

    const maxRevenue = Math.max(...selected.map(p => p.ytdRental || 0))
    const maxPrice = Math.max(...selected.map(p => p.basePrice || 0))
    const maxRating = 5

    return [
      { metric: 'Ocupacao', ...Object.fromEntries(selected.map((p, i) => [`p${i}`, p.avgOccupancy || 0])) },
      { metric: 'Receita', ...Object.fromEntries(selected.map((p, i) => [`p${i}`, maxRevenue ? (p.ytdRental / maxRevenue) * 100 : 0])) },
      { metric: 'Avaliacao', ...Object.fromEntries(selected.map((p, i) => [`p${i}`, (p.rating / maxRating) * 100])) },
      { metric: 'Preco', ...Object.fromEntries(selected.map((p, i) => [`p${i}`, maxPrice ? (p.basePrice / maxPrice) * 100 : 0])) },
    ]
  }, [selected])

  const paddedValues = (arr) => {
    const result = [...arr]
    while (result.length < 4) result.push(null)
    return result
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden shadow-sm dark:shadow-none">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Comparar Propriedades</h3>
        <PropertySelector
          properties={properties}
          selected={selected}
          onSelect={handleSelect}
          onRemove={handleRemove}
        />
      </div>

      {selected.length < 2 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-gray-400 dark:text-slate-500">
            Selecione pelo menos 2 propriedades para comparar
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Radar Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 11 }} />
                {selected.map((p, i) => (
                  <Radar
                    key={p.name}
                    name={p.name}
                    dataKey={`p${i}`}
                    stroke={COLORS[i]}
                    fill={COLORS[i]}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                ))}
                <Legend 
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value) => <span className="text-gray-600 dark:text-slate-400">{value}</span>}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              {/* Headers */}
              <div className="grid grid-cols-[140px_repeat(4,1fr)] gap-2 py-2 border-b-2 border-gray-200 dark:border-slate-700">
                <div />
                {paddedValues(selected).map((p, i) => (
                  <div key={i} className="text-center">
                    {p && (
                      <>
                        <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: COLORS[i] }} />
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate px-1">{p.name}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Data Rows */}
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                <CompareRow label="Condominio" values={paddedValues(selected.map(p => p.condominium))} />
                <CompareRow label="Quartos" values={paddedValues(selected.map(p => p.bedrooms))} />
                <CompareRow label="Ocupacao Media" values={paddedValues(selected.map(p => p.avgOccupancy))} format="percent" highlight="max" />
                <CompareRow label="Receita YTD" values={paddedValues(selected.map(p => p.ytdRental))} format="currency" highlight="max" />
                <CompareRow label="Prop. YTD" values={paddedValues(selected.map(p => p.ownerYTD))} format="currency" highlight="max" />
                <CompareRow label="Preco Base" values={paddedValues(selected.map(p => p.basePrice))} format="currency" />
                <CompareRow label="Preco Min" values={paddedValues(selected.map(p => p.minPrice))} format="currency" highlight="min" />
                <CompareRow label="Preco Max" values={paddedValues(selected.map(p => p.maxPrice))} format="currency" />
                <CompareRow label="Avaliacao" values={paddedValues(selected.map(p => p.rating))} format="rating" highlight="max" />
                <CompareRow label="Guest Favorite" values={paddedValues(selected.map(p => p.guestFavorite))} format="boolean" />
                <CompareRow label="Pet Friendly" values={paddedValues(selected.map(p => p.isPet))} format="boolean" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
