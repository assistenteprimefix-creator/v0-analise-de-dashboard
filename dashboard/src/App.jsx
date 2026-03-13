import { useMemo, useState } from 'react'
import { Building2, CalendarCheck, DollarSign, TrendingUp, Users, BarChart2, AlertTriangle, PiggyBank, Zap } from 'lucide-react'
import { useSheets } from './hooks/useSheets'
import { ThemeContext, useThemeProvider } from './hooks/useTheme'
import Header from './components/Header'
import KPICard from './components/KPICard'
import { RevenueChart, OccupancyChart, BookingsChart } from './components/Charts'
import PropertyTable from './components/PropertyTable'
import TopPerformers from './components/TopPerformers'
import CondoBreakdown from './components/CondoBreakdown'
import InsightsPanel from './components/InsightsPanel'
import RevenueBreakdown from './components/RevenueBreakdown'
import OccupancyDistribution from './components/OccupancyDistribution'
import BedroomStats from './components/BedroomStats'
import EventsInsight from './components/EventsInsight'
import RevenueRanking from './components/RevenueRanking'

const fmtUSD = (n) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toLocaleString('en-US')}`
}

export default function App() {
  const theme = useThemeProvider()
  const { monthly, properties, loading, refreshing, error, lastUpdated, refresh } = useSheets()
  const [alertsOnly, setAlertsOnly] = useState(false)

  const kpis = useMemo(() => {
    const totalBookings = monthly.reduce((s, m) => s + m.bookings, 0)
    const totalRental = monthly.reduce((s, m) => s + m.rental, 0)
    const totalOwner = monthly.reduce((s, m) => s + m.owner, 0)
    const totalCompany = monthly.reduce((s, m) => s + m.companyTotal, 0)
    const totalCompanyProfit = monthly.reduce((s, m) => s + m.companyProfit, 0)
    const months = monthly.filter(m => m.ocupacao > 0)
    const avgOcc = months.length ? months.reduce((s, m) => s + m.ocupacao, 0) / months.length : 0
    const propertiesCount = properties.length
    const alerts = properties.filter(p => p.acao).length
    return { totalBookings, totalRental, totalOwner, totalCompany, totalCompanyProfit, avgOcc, propertiesCount, alerts }
  }, [monthly, properties])

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
            Verifique se a planilha está compartilhada como "Qualquer pessoa com o link pode visualizar".
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
      <Header lastUpdated={lastUpdated} onRefresh={refresh} loading={loading} refreshing={refreshing} />

      {loading && !monthly.length ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-400 text-sm">Carregando dados da planilha...</p>
          </div>
        </div>
      ) : (
        <main className="p-6 space-y-6 max-w-screen-2xl mx-auto">

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <KPICard icon={Building2} label="Propriedades" value={kpis.propertiesCount} color="blue" />
            <KPICard icon={CalendarCheck} label="Reservas YTD" value={kpis.totalBookings.toLocaleString('pt-BR')} color="purple" />
            <KPICard icon={DollarSign} label="Rental Total" value={fmtUSD(kpis.totalRental)} color="cyan" />
            <KPICard icon={TrendingUp} label="Receita Empresa" value={fmtUSD(kpis.totalCompany)} color="green" />
            <KPICard icon={PiggyBank} label="Lucro Líquido" value={fmtUSD(kpis.totalCompanyProfit)} color="teal" />
            <KPICard icon={Users} label="Receita Proprietários" value={fmtUSD(kpis.totalOwner)} color="orange" />
            <KPICard icon={BarChart2} label="Ocupação Média" value={`${kpis.avgOcc.toFixed(1)}%`} color={kpis.avgOcc >= 60 ? 'green' : 'rose'} />
          </div>

          {/* Auto Insights */}
          <InsightsPanel monthly={monthly} properties={properties} />

          {/* Charts row 1: Revenue + Occupancy */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2"><RevenueChart data={monthly} /></div>
            <OccupancyChart data={monthly} />
          </div>

          {/* Charts row 2: Revenue Breakdown + Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RevenueBreakdown data={monthly} />
            <BookingsChart data={monthly} />
          </div>

          {/* Analytics row: Condo + Occ Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CondoBreakdown properties={properties} />
            <OccupancyDistribution properties={properties} />
          </div>

          {/* Property analysis row: Bedroom Stats + Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BedroomStats properties={properties} />
            <EventsInsight properties={properties} />
          </div>

          {/* Revenue Ranking per property */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <DollarSign size={15} className="text-blue-500 dark:text-blue-400" />
              Ranking de Receita por Propriedade
            </h2>
            <RevenueRanking properties={properties} />
          </div>

          {/* Top Performers */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingUp size={15} className="text-blue-500 dark:text-blue-400" />
              Análise de Performance
            </h2>
            <TopPerformers properties={properties} />
          </div>

          {/* Properties Table */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Building2 size={15} className="text-blue-500 dark:text-blue-400" />
              Todas as Propriedades
              {kpis.alerts > 0 && (
                <button
                  onClick={() => setAlertsOnly(v => !v)}
                  className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                    alertsOnly
                      ? 'bg-red-500/40 text-red-300 ring-1 ring-red-500/50'
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  }`}
                >
                  <AlertTriangle size={10} />{kpis.alerts} com ação pendente
                </button>
              )}
            </h2>
            <PropertyTable properties={properties} alertsOnly={alertsOnly} onClearAlerts={() => setAlertsOnly(false)} />
          </div>

        </main>
      )}
    </div>
    </ThemeContext.Provider>
  )
}
