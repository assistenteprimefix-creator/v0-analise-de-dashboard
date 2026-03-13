import { useState, useEffect, useMemo, useRef } from 'react'
import { Search, Home, TrendingUp, Wrench, X, ArrowRight, Command, Star, MapPin, Bed } from 'lucide-react'

const TABS = [
  { id: 'global', label: 'Visao Global', icon: TrendingUp },
  { id: 'portfolio', label: 'Casas & Portfolio', icon: Home },
  { id: 'operations', label: 'Operacao & Melhorias', icon: Wrench },
]

export default function CommandPalette({ properties = [], onNavigate, onPropertySelect, activeTab }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Focus input when open
  useEffect(() => {
    if (open) {
      setSearch('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Filter results
  const results = useMemo(() => {
    const items = []
    const q = search.toLowerCase().trim()

    // Navigation items
    TABS.forEach(tab => {
      if (!q || tab.label.toLowerCase().includes(q)) {
        items.push({ type: 'nav', ...tab })
      }
    })

    // Properties
    if (properties.length) {
      const filtered = properties
        .filter(p => !q || p.name.toLowerCase().includes(q) || p.condominium?.toLowerCase().includes(q))
        .slice(0, 8)

      filtered.forEach(p => {
        items.push({ type: 'property', property: p })
      })
    }

    return items
  }, [search, properties])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (!open) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault()
        handleSelect(results[selectedIndex])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, results, selectedIndex])

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex]
      selected?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const handleSelect = (item) => {
    if (item.type === 'nav') {
      onNavigate?.(item.id)
    } else if (item.type === 'property') {
      onPropertySelect?.(item.property)
    }
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
      >
        <Search size={14} />
        <span>Buscar...</span>
        <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-[10px] font-medium text-gray-500 dark:text-slate-400">
          <Command size={10} />K
        </kbd>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-slate-800">
          <Search size={18} className="text-gray-400 dark:text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedIndex(0) }}
            placeholder="Buscar propriedades, navegar..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none text-sm"
          />
          <button
            onClick={() => setOpen(false)}
            className="w-6 h-6 rounded bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
          >
            <X size={12} />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400 dark:text-slate-500">
              Nenhum resultado encontrado
            </div>
          ) : (
            <>
              {/* Navigation Section */}
              {results.some(r => r.type === 'nav') && (
                <div className="mb-2">
                  <p className="px-2 py-1 text-[10px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                    Navegacao
                  </p>
                  {results.filter(r => r.type === 'nav').map((item, idx) => {
                    const Icon = item.icon
                    const globalIdx = results.findIndex(r => r === item)
                    const isSelected = globalIdx === selectedIndex
                    const isActive = item.id === activeTab

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon size={16} className={isSelected ? 'text-blue-500' : 'text-gray-400 dark:text-slate-500'} />
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        {isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">
                            Ativo
                          </span>
                        )}
                        <ArrowRight size={14} className="text-gray-300 dark:text-slate-600" />
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Properties Section */}
              {results.some(r => r.type === 'property') && (
                <div>
                  <p className="px-2 py-1 text-[10px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                    Propriedades
                  </p>
                  {results.filter(r => r.type === 'property').map((item) => {
                    const p = item.property
                    const globalIdx = results.findIndex(r => r === item)
                    const isSelected = globalIdx === selectedIndex

                    return (
                      <button
                        key={p.name}
                        onClick={() => handleSelect(item)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Home size={16} className={isSelected ? 'text-blue-500' : 'text-gray-400 dark:text-slate-500'} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin size={10} /> {p.condominium?.split(' ').slice(0,2).join(' ')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bed size={10} /> {p.bedrooms}
                            </span>
                            {p.guestFavorite && (
                              <Star size={10} className="text-amber-500 fill-amber-500" />
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                          {p.avgOccupancy}%
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-slate-700">Enter</kbd> selecionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-slate-700">Esc</kbd> fechar
            </span>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-slate-500">
            {results.length} resultado{results.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
