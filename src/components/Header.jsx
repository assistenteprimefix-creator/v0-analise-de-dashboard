import { RefreshCw, Home, Clock, Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function Header({ lastUpdated, onRefresh, loading, refreshing }) {
  const { dark, toggle } = useTheme()

  const fmt = lastUpdated
    ? lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-slate-800 bg-white/90 dark:bg-[#0b0f1a]/90 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <Home size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight truncate">
              Mr Mouse Vacation Rentals
            </h1>
            <p className="text-xs text-gray-400 dark:text-slate-500 hidden sm:block">Dashboard de Gestão · 2026</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {refreshing && (
            <span className="hidden sm:flex text-xs text-blue-500 dark:text-blue-400/70 items-center gap-1">
              <RefreshCw size={11} className="animate-spin" />
              Atualizando...
            </span>
          )}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
            <Clock size={13} />
            <span>Atualizado às {fmt}</span>
          </div>

          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors"
            title={dark ? 'Modo claro' : 'Modo escuro'}
            aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            onClick={onRefresh}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 transition-colors disabled:opacity-50"
            aria-label="Atualizar dados"
          >
            <RefreshCw size={13} className={loading || refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>
    </header>
  )
}
