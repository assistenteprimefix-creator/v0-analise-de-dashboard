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
import ErrorBoundary from './components/ErrorBoundary'
import { KPISkeleton, ChartSkeleton, TableSkeleton, InsightsSkeleton } from './components/Skeleton'

const fmtUSD = (n) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toLocaleString('en-US')}`
}

function SectionTitle({ icon: Icon, title, children }) {
  return (
    <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
      <Icon size={15} className="text-blue-500 dark:text-blue-400 shrink-0" />
      <span>{title}</span>
      {children}
    </h2>
  )
}

export default function App() {
  const theme = useThemeProvider()
  const { monthly, properties, loading, refreshing, error, lastUpdated, refresh } = useSheets()
  const [alertsOnly, setAlertsOnly] = useState(false)

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

      <main className="p-4 sm:p-6 space-y-6 max-w-screen-2xl mx-auto">

        {/* KPIs */}
        {loading && !monthly.length
          ? <KPISkeleton />
          : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
              <KPICard
                icon={Building2} label="Propriedades" value={kpis.propertiesCount} color="blue"
                tooltip="Total de propriedades no portfólio"
                sub={kpis.alerts > 0 ? `${kpis.alerts} com ação` : undefined}
              />
              <KPICard
                icon={CalendarCheck} label="Reservas YTD" value={kpis.totalBookings.toLocaleString('pt-BR')} color="purple"
                tooltip={`Total de reservas acumuladas no ano${kpis.lastMonthLabel ? ` · variação vs ${kpis.lastMonthLabel}` : ''}`}
                trend={kpis.trendBookings}
              />
              <KPICard
                icon={DollarSign} label="Rental Total" value={fmtUSD(kpis.totalRental)} color="cyan"
                tooltip="Receita total de aluguel acumulada no ano (YTD)"
                trend={kpis.trendRental}
              />
              <KPICard
                icon={TrendingUp} label="Receita Empresa" value={fmtUSD(kpis.totalCompany)} color="green"
                tooltip="Total recebido pela empresa (comissão + taxas)"
                trend={kpis.trendCompany}
              />
              <KPICard
                icon={PiggyBank} label="Lucro Líquido" value={fmtUSD(kpis.totalCompanyProfit)} color="teal"
                tooltip="Lucro líquido da empresa após custos operacionais"
              />
              <KPICard
                icon={Users} label="Receita Proprietários" value={fmtUSD(kpis.totalOwner)} color="orange"
                tooltip="Total repassado aos proprietários das unidades"
              />
              <KPICard
                icon={BarChart2} label="Ocupação Média" value={`${kpis.avgOcc.toFixed(1)}%`}
                color={kpis.avgOcc >= 60 ? 'green' : 'rose'}
                tooltip="Taxa de ocupação média de todas as propriedades ativas"
                trend={kpis.trendOcc}
              />
            </div>
          )
        }

        {/* Auto Insights */}
        {loading && !monthly.length
          ? <InsightsSkeleton />
          : (
            <ErrorBoundary>
              <InsightsPanel monthly={monthly} properties={properties} />
            </ErrorBoundary>
          )
        }

        {/* Charts row 1: Revenue + Occupancy */}
        {loading && !monthly.length
          ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2"><ChartSkeleton height={220} /></div>
              <ChartSkeleton height={220} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <ErrorBoundary><RevenueChart data={monthly} /></ErrorBoundary>
              </div>
              <ErrorBoundary><OccupancyChart data={monthly} /></ErrorBoundary>
            </div>
          )
        }

        {/* Charts row 2: Revenue Breakdown + Bookings */}
        {loading && !monthly.length
          ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartSkeleton height={220} />
              <ChartSkeleton height={220} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ErrorBoundary><RevenueBreakdown data={monthly} /></ErrorBoundary>
              <ErrorBoundary><BookingsChart data={monthly} /></ErrorBoundary>
            </div>
          )
        }

        {/* Analytics row: Condo + Occ Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ErrorBoundary><CondoBreakdown properties={properties} /></ErrorBoundary>
          <ErrorBoundary><OccupancyDistribution properties={properties} /></ErrorBoundary>
        </div>

        {/* Property analysis row: Bedroom Stats + Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ErrorBoundary><BedroomStats properties={properties} /></ErrorBoundary>
          <ErrorBoundary><EventsInsight properties={properties} /></ErrorBoundary>
        </div>

        {/* Revenue Ranking per property */}
        <SectionTitle icon={DollarSign} title="Ranking de Receita por Propriedade" />
        <ErrorBoundary><RevenueRanking properties={properties} /></ErrorBoundary>

        {/* Top Performers */}
        <SectionTitle icon={TrendingUp} title="Análise de Performance" />
        <ErrorBoundary><TopPerformers properties={properties} /></ErrorBoundary>

        {/* Properties Table */}
        <SectionTitle icon={Building2} title="Todas as Propriedades">
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
        </SectionTitle>
        {loading && !properties.length
          ? <TableSkeleton />
          : (
            <ErrorBoundary>
              <PropertyTable properties={properties} alertsOnly={alertsOnly} onClearAlerts={() => setAlertsOnly(false)} />
            </ErrorBoundary>
          )
        }

      </main>
    </div>
    </ThemeContext.Provider>
  )
}
