import { RefreshCw, Home, Clock, Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function Header({ lastUpdated, onRefresh, loading, refreshing }) {
  const { dark, toggle } = useTheme()

  const fmt = lastUpdated
    ? lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 border-b border-gray-200 dark:border-slate-800 bg-white/90 dark:bg-[#0b0f1a]/90 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Home size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Mr Mouse Vacation Rentals</h1>
          <p className="text-xs text-gray-400 dark:text-slate-500">Dashboard de Gestão · 2026</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {refreshing && (
          <span className="text-xs text-blue-500 dark:text-blue-400/70 flex items-center gap-1">
            <RefreshCw size={11} className="animate-spin" />
            Atualizando...
          </span>
        )}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
          <Clock size={13} />
          <span>Atualizado às {fmt}</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors"
          title={dark ? 'Modo claro' : 'Modo escuro'}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button
          onClick={onRefresh}
          disabled={loading || refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>
    </header>
  )
}
