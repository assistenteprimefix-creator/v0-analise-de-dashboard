import { useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useSheets } from './hooks/useSheets'
import { ThemeContext, useThemeProvider } from './hooks/useTheme'
import Header from './components/Header'
import CommandPalette from './components/CommandPalette'
import PropertyDetailModal from './components/PropertyDetailModal'
import GlobalView from './pages/GlobalView'
import PortfolioView from './pages/PortfolioView'
import OperationsView from './pages/OperationsView'

export default function App() {
  const theme = useThemeProvider()
  const { monthly, properties, loading, refreshing, error, lastUpdated, refresh } = useSheets()
  const [activeTab, setActiveTab] = useState('global')
  const [selectedProperty, setSelectedProperty] = useState(null)

  const kpis = useMemo(() => {
    const active = monthly.filter(m => m.bookings > 0 || m.rental > 0)
    const totalBookings = active.reduce((s, m) => s + m.bookings, 0)
    const totalRental = active.reduce((s, m) => s + m.rental, 0)
    const totalOwner = active.reduce((s, m) => s + m.owner, 0)
    const totalCompany = active.reduce((s, m) => s + m.companyTotal, 0)
    const totalCompanyProfit = active.reduce((s, m) => s + m.companyProfit, 0)
    const occMonths = active.filter(m => m.ocupacao > 0)
    const avgOcc = occMonths.length ? occMonths.reduce((s, m) => s + m.ocupacao, 0) / occMonths.length : 0
    const propertiesCount = properties.length
    const alerts = properties.filter(p => p.acao).length

    // Month-over-month trend for last two active months
    const pct = (cur, prev) => prev > 0 ? ((cur - prev) / prev) * 100 : null
    const last = active[active.length - 1]
    const prev = active[active.length - 2]
    const trendRental = last && prev ? pct(last.rental, prev.rental) : null
    const trendBookings = last && prev ? pct(last.bookings, prev.bookings) : null
    const trendOcc = last && prev ? pct(last.ocupacao, prev.ocupacao) : null
    const trendCompany = last && prev ? pct(last.companyTotal, prev.companyTotal) : null
    const lastMonthLabel = last ? last.mes : ''

    return {
      totalBookings, totalRental, totalOwner, totalCompany, totalCompanyProfit,
      avgOcc, propertiesCount, alerts,
      trendRental, trendBookings, trendOcc, trendCompany, lastMonthLabel,
    }
  }, [monthly, properties])

  const alertCount = properties.filter(p => p.acao).length

  if (error) return (
    <ThemeContext.Provider value={theme}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f1a] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-2">{error}</p>
          <p className="text-gray-400 dark:text-slate-500 text-xs mb-6">
            Verifique se a planilha esta compartilhada como "Qualquer pessoa com o link pode visualizar".
          </p>
          <button onClick={refresh} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
            Tentar novamente
          </button>
        </div>
      </div>
    </ThemeContext.Provider>
  )

  return (
    <ThemeContext.Provider value={theme}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f1a]">
        <Header
          lastUpdated={lastUpdated}
          onRefresh={refresh}
          loading={loading}
          refreshing={refreshing}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alertCount={alertCount}
        />

        <main className="p-4 sm:p-6 max-w-screen-2xl mx-auto">
          {activeTab === 'global' && (
            <GlobalView
              monthly={monthly}
              properties={properties}
              kpis={kpis}
              loading={loading}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioView
              properties={properties}
              loading={loading}
            />
          )}

          {activeTab === 'operations' && (
            <OperationsView
              properties={properties}
            />
          )}
        </main>

        {/* Command Palette */}
        <CommandPalette
          properties={properties}
          activeTab={activeTab}
          onNavigate={setActiveTab}
          onPropertySelect={(p) => {
            setActiveTab('portfolio')
            setSelectedProperty(p)
          }}
        />

        {/* Global Property Detail Modal */}
        {selectedProperty && (
          <PropertyDetailModal
            property={selectedProperty}
            allProperties={properties}
            onClose={() => setSelectedProperty(null)}
          />
        )}
      </div>
    </ThemeContext.Provider>
  )
}
