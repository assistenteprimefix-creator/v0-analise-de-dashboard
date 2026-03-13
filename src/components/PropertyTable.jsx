import { useState, useMemo, useEffect, useCallback } from 'react'
import { Search, Star, ChevronUp, ChevronDown, AlertCircle, Trophy, X, PawPrint, Download, SlidersHorizontal, Eye } from 'lucide-react'

function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const MONTH_ORDER = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']

function OccBadge({ value }) {
  if (value === 0) return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-400">—</span>
  if (value >= 70) return <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-600 dark:text-green-400 font-medium">{value}%</span>
  if (value >= 40) return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-medium">{value}%</span>
  return <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-600 dark:text-red-400 font-medium">{value}%</span>
}

function SortIcon({ active, dir }) {
  if (!active) return <ChevronUp size={12} className="opacity-20" />
  return dir === 'asc' ? <ChevronUp size={12} className="text-blue-400" /> : <ChevronDown size={12} className="text-blue-400" />
}

function Th({ col, sortCol, sortDir, onSort, children, className = '' }) {
  return (
    <th
      className={`px-3 py-3 text-left text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-slate-300 select-none whitespace-nowrap ${className}`}
      onClick={() => onSort(col)}
    >
      <span className="flex items-center gap-1">
        {children}
        <SortIcon active={sortCol === col} dir={sortDir} />
      </span>
    </th>
  )
}

const fmtUSD = v => v ? `$${v.toLocaleString('en-US')}` : '—'
const fmtUSDk = v => {
  if (!v) return '—'
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`
  return `$${v}`
}

function getPropertyValue(p, col) {
  if (col.startsWith('occ_')) return p.occupancy?.[col.slice(4)] ?? 0
  return p[col]
}

export default function PropertyTable({ properties, alertsOnly = false, onClearAlerts, onPropertyClick }) {
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 250)
  const [condo, setCondo] = useState('all')
  const [beds, setBeds] = useState('all')
  const [guestFav, setGuestFav] = useState(false)
  const [petOnly, setPetOnly] = useState(false)
  const [sortCol, setSortCol] = useState('ytdRental')
  const [sortDir, setSortDir] = useState('desc')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [occRange, setOccRange] = useState([0, 100])
  const [priceRange, setPriceRange] = useState([0, 10000])

  const condos = useMemo(() => {
    const set = new Set(properties.map(p => p.condominium).filter(Boolean))
    return Array.from(set).sort()
  }, [properties])

  const bedOptions = useMemo(() => {
    const set = new Set(properties.map(p => p.bedrooms).filter(Boolean))
    return Array.from(set).sort((a, b) => a - b)
  }, [properties])

  const occMonths = useMemo(() => {
    const set = new Set()
    properties.forEach(p => Object.keys(p.occupancy || {}).forEach(m => set.add(m.toUpperCase())))
    return MONTH_ORDER.filter(m => set.has(m))
  }, [properties])

  const hasRevenue = useMemo(() => properties.some(p => p.ytdRental > 0), [properties])

  const filtered = useMemo(() => {
    let list = [...properties]
    if (alertsOnly) list = list.filter(p => p.acao)
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (condo !== 'all') list = list.filter(p => p.condominium === condo)
    if (beds !== 'all') list = list.filter(p => p.bedrooms === Number(beds))
    if (guestFav) list = list.filter(p => p.guestFavorite)
    if (petOnly) list = list.filter(p => p.isPet)
    // Advanced filters
    if (showAdvanced) {
      list = list.filter(p => {
        const occ = p.avgOccupancy || 0
        const price = p.basePrice || 0
        return occ >= occRange[0] && occ <= occRange[1] && price >= priceRange[0] && price <= priceRange[1]
      })
    }

    list.sort((a, b) => {
      let va = getPropertyValue(a, sortCol)
      let vb = getPropertyValue(b, sortCol)
      if (va == null) va = sortDir === 'asc' ? Infinity : -Infinity
      if (vb == null) vb = sortDir === 'asc' ? Infinity : -Infinity
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [properties, search, condo, beds, guestFav, petOnly, sortCol, sortDir, showAdvanced, occRange, priceRange])

  const exportCSV = useCallback(() => {
    const headers = ['Nome', 'Condominio', 'Quartos', 'Ocupacao Media', 'Rental YTD', 'Proprietario YTD', 'Avaliacao', 'Preco Base', 'Guest Favorite', 'Pet Friendly']
    const rows = filtered.map(p => [
      p.name,
      p.condominium,
      p.bedrooms,
      p.avgOccupancy,
      p.ytdRental,
      p.ownerYTD,
      p.rating,
      p.basePrice,
      p.guestFavorite ? 'Sim' : 'Nao',
      p.isPet ? 'Sim' : 'Nao',
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `propriedades_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [filtered])

  const toggleSort = col => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const hasFilters = searchInput || condo !== 'all' || beds !== 'all' || guestFav || petOnly || alertsOnly || (showAdvanced && (occRange[0] > 0 || occRange[1] < 100 || priceRange[0] > 0 || priceRange[1] < 10000))
  const clearFilters = () => { setSearchInput(''); setCondo('all'); setBeds('all'); setGuestFav(false); setPetOnly(false); setOccRange([0, 100]); setPriceRange([0, 10000]); onClearAlerts?.() }

  const thProps = { sortCol, sortDir, onSort: toggleSort }

  const colSpanTotal = 5 + occMonths.length + (hasRevenue ? 2 : 0)

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden shadow-sm dark:shadow-none">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Buscar propriedade..."
            className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={condo}
          onChange={e => setCondo(e.target.value)}
          className="px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 min-w-[160px]"
        >
          <option value="all">Todos Condôminos</option>
          {condos.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={beds}
          onChange={e => setBeds(e.target.value)}
          className="px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="all">Todos Quartos</option>
          {bedOptions.map(b => <option key={b} value={b}>{b} 🛏️</option>)}
        </select>

        <button
          onClick={() => setGuestFav(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-colors ${
            guestFav
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 dark:text-amber-400'
              : 'bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          <Trophy size={13} />
          Guest Fav.
        </button>

        <button
          onClick={() => setPetOnly(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-colors ${
            petOnly
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          <PawPrint size={13} />
          Pet
        </button>

        <button
          onClick={() => setShowAdvanced(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-colors ${
            showAdvanced
              ? 'bg-blue-500/20 border-blue-500/40 text-blue-600 dark:text-blue-400'
              : 'bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          <SlidersHorizontal size={13} />
          Avancado
        </button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2.5 py-2 text-xs rounded-xl bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-300 transition-colors"
            title="Limpar todos os filtros"
          >
            <X size={12} />
            Limpar
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-400 dark:text-slate-500">
            {filtered.length} de {properties.length}
          </span>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
            title="Exportar para CSV"
          >
            <Download size={12} />
            CSV
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-slate-400">Ocupacao:</span>
            <input
              type="number"
              min={0}
              max={100}
              value={occRange[0]}
              onChange={e => setOccRange([Number(e.target.value), occRange[1]])}
              className="w-14 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg"
            />
            <span className="text-xs text-gray-400">-</span>
            <input
              type="number"
              min={0}
              max={100}
              value={occRange[1]}
              onChange={e => setOccRange([occRange[0], Number(e.target.value)])}
              className="w-14 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg"
            />
            <span className="text-xs text-gray-400">%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-slate-400">Preco Base:</span>
            <span className="text-xs text-gray-400">$</span>
            <input
              type="number"
              min={0}
              value={priceRange[0]}
              onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-20 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg"
            />
            <span className="text-xs text-gray-400">-</span>
            <span className="text-xs text-gray-400">$</span>
            <input
              type="number"
              min={0}
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-20 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Mobile card view */}
      <div className="sm:hidden divide-y divide-gray-100 dark:divide-slate-800/60">
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-400 dark:text-slate-500">
            Nenhuma propriedade encontrada
            {hasFilters && (
              <button onClick={clearFilters} className="ml-2 text-blue-400 hover:text-blue-300 underline">Limpar filtros</button>
            )}
          </div>
        )}
        {filtered.map(p => (
          <div key={p.name} className="p-4 space-y-2" onClick={() => onPropertyClick?.(p)}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 cursor-pointer">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate hover:text-blue-500">{p.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{p.condominium} · {p.bedrooms} quartos</p>
              </div>
              <div className="flex flex-wrap gap-1 justify-end shrink-0">
                {p.guestFavorite && (
                  <span className="text-xs bg-amber-500/20 text-amber-500 dark:text-amber-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Trophy size={9} />GF
                  </span>
                )}
                {p.isPet && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <PawPrint size={9} />Pet
                  </span>
                )}
                {p.acao && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5" title={p.acao}>
                    <AlertCircle size={9} />Ação
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {p.ytdRental > 0 && (
                <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg font-medium">
                  Rental: {fmtUSDk(p.ytdRental)}
                </span>
              )}
              {p.ownerYTD > 0 && (
                <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg font-medium">
                  Prop: {fmtUSDk(p.ownerYTD)}
                </span>
              )}
              <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-1 rounded-lg">
                Occ: <OccBadge value={p.avgOccupancy} />
              </span>
              {p.rating > 0 && (
                <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star size={10} fill="currentColor" />{p.rating.toFixed(2)}
                </span>
              )}
              {p.basePrice > 0 && (
                <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-1 rounded-lg">
                  Base: {fmtUSD(p.basePrice)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-[#0d1117]">
            <tr>
              <Th col="name" {...thProps} className="sticky left-0 bg-gray-50 dark:bg-[#0d1117] z-10 min-w-[200px]">Propriedade</Th>
              <Th col="bedrooms" {...thProps}>Quartos</Th>
              {hasRevenue && <Th col="ytdRental" {...thProps}>Rental YTD</Th>}
              {hasRevenue && <Th col="ownerYTD" {...thProps}>Proprietário YTD</Th>}
              <Th col="avgOccupancy" {...thProps}>Média Occ.</Th>
              {occMonths.map(m => <Th key={m} col={`occ_${m}`} {...thProps}>{m}</Th>)}
              <Th col="rating" {...thProps}>Avaliação</Th>
              <Th col="basePrice" {...thProps}>Base</Th>
              <Th col="minPrice" {...thProps}>Min</Th>
              <Th col="maxPrice" {...thProps}>Max</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
            {filtered.map(p => (
              <tr key={p.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors group">
                <td className="px-3 py-2.5 sticky left-0 bg-white dark:bg-[#111827] group-hover:bg-gray-50 dark:group-hover:bg-[#161f30] z-10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPropertyClick?.(p)}
                      className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 flex items-center justify-center text-blue-500 transition-colors shrink-0"
                      title="Ver detalhes"
                    >
                      <Eye size={12} />
                    </button>
                    <span className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-500" onClick={() => onPropertyClick?.(p)}>{p.name}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400 dark:text-slate-500">{p.condominium}</span>
                    {p.guestFavorite && (
                      <span className="text-xs bg-amber-500/20 text-amber-500 dark:text-amber-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 whitespace-nowrap">
                        <Trophy size={9} />GF
                      </span>
                    )}
                    {p.isPet && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 whitespace-nowrap">
                        <PawPrint size={9} />Pet
                      </span>
                    )}
                    {p.acao && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 whitespace-nowrap" title={p.acao}>
                        <AlertCircle size={9} />Ação
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">{p.bedrooms} 🛏️</td>
                {hasRevenue && (
                  <td className="px-3 py-2.5">
                    {p.ytdRental > 0
                      ? <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{fmtUSDk(p.ytdRental)}</span>
                      : <span className="text-gray-300 dark:text-slate-600 text-sm">—</span>}
                  </td>
                )}
                {hasRevenue && (
                  <td className="px-3 py-2.5">
                    {p.ownerYTD > 0
                      ? <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{fmtUSDk(p.ownerYTD)}</span>
                      : <span className="text-gray-300 dark:text-slate-600 text-sm">—</span>}
                  </td>
                )}
                <td className="px-3 py-2.5"><OccBadge value={p.avgOccupancy} /></td>
                {occMonths.map(m => (
                  <td key={m} className="px-3 py-2.5">
                    <OccBadge value={p.occupancy?.[m] ?? 0} />
                  </td>
                ))}
                <td className="px-3 py-2.5">
                  {p.rating > 0 ? (
                    <span className="flex items-center gap-1 text-sm text-amber-500 dark:text-amber-400 font-medium">
                      <Star size={12} fill="currentColor" />{p.rating.toFixed(2)}
                    </span>
                  ) : <span className="text-gray-300 dark:text-slate-600 text-sm">—</span>}
                </td>
                <td className="px-3 py-2.5 text-sm text-gray-700 dark:text-slate-300">{fmtUSD(p.basePrice)}</td>
                <td className="px-3 py-2.5 text-sm text-green-500 dark:text-green-400">{fmtUSD(p.minPrice)}</td>
                <td className="px-3 py-2.5 text-sm text-blue-500 dark:text-blue-400">{fmtUSD(p.maxPrice)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={colSpanTotal} className="text-center py-10 text-gray-400 dark:text-slate-500 text-sm">
                  Nenhuma propriedade encontrada
                  {hasFilters && (
                    <button onClick={clearFilters} className="ml-2 text-blue-400 hover:text-blue-300 underline">
                      Limpar filtros
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>{/* end desktop table */}
    </div>
  )
}
