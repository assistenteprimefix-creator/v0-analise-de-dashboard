import { RefreshCw, LayoutDashboard, Home, Wrench, Clock, Sun, Moon, Settings, TrendingUp, Search, Command } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const TABS = [
  { id: 'global', label: 'Visao Global', icon: TrendingUp },
  { id: 'portfolio', label: 'Casas & Portfolio', icon: Home },
  { id: 'operations', label: 'Operacao & Melhorias', icon: Wrench },
]

export default function Header({ lastUpdated, onRefresh, loading, refreshing, activeTab, onTabChange, alertCount = 0 }) {
  const { dark, toggle } = useTheme()

  const fmt = lastUpdated
    ? lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0b0f1a]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100 dark:border-slate-800/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight tracking-tight uppercase">
              Prime Fix
            </h1>
            <p className="text-[10px] text-blue-500 dark:text-blue-400 font-medium tracking-widest uppercase">
              Analytics Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search trigger */}
          <button
            onClick={() => {
              // Trigger the CommandPalette via keyboard event
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
            }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Search size={14} />
            <span className="text-xs">Buscar...</span>
            <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-[10px] font-medium text-gray-500 dark:text-slate-400">
              <Command size={10} />K
            </kbd>
          </button>

          {/* Sync status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
            <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wide">Sync</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-slate-200">{fmt}</span>
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading || refreshing}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/25"
            aria-label="Atualizar dados"
          >
            <RefreshCw size={16} className={loading || refreshing ? 'animate-spin' : ''} />
          </button>

          {/* Client name */}
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-slate-700">
            <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wide">Cliente</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">MR MOUSE Rentals</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-amber-500 dark:text-amber-400 transition-colors"
            title={dark ? 'Modo claro' : 'Modo escuro'}
            aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Settings */}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors"
            aria-label="Configuracoes"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav className="flex items-center gap-1 px-4 sm:px-6 py-2 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const showBadge = tab.id === 'operations' && alertCount > 0

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-blue-500 dark:text-blue-400' : ''} />
              <span>{tab.label}</span>
              {showBadge && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[20px] text-center">
                  {alertCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </header>
  )
}
