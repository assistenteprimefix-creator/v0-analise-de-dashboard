import { Building2, CalendarCheck, DollarSign, TrendingUp, Users, BarChart2, PiggyBank } from 'lucide-react'
import KPICard from '../components/KPICard'
import { RevenueChart, OccupancyChart, BookingsChart } from '../components/Charts'
import InsightsPanel from '../components/InsightsPanel'
import RevenueBreakdown from '../components/RevenueBreakdown'
import ErrorBoundary from '../components/ErrorBoundary'
import { KPISkeleton, ChartSkeleton, InsightsSkeleton } from '../components/Skeleton'

const fmtUSD = (n) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toLocaleString('en-US')}`
}

export default function GlobalView({ monthly, properties, kpis, loading }) {
  const isLoading = loading && !monthly.length

  return (
    <div className="space-y-6">
      {/* KPIs */}
      {isLoading ? (
        <KPISkeleton />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
          <KPICard
            icon={Building2}
            label="Propriedades"
            value={kpis.propertiesCount}
            color="blue"
            tooltip="Total de propriedades no portfolio"
            sub={kpis.alerts > 0 ? `${kpis.alerts} com acao` : undefined}
          />
          <KPICard
            icon={CalendarCheck}
            label="Reservas YTD"
            value={kpis.totalBookings.toLocaleString('pt-BR')}
            color="purple"
            tooltip={`Total de reservas acumuladas no ano${kpis.lastMonthLabel ? ` - variacao vs ${kpis.lastMonthLabel}` : ''}`}
            trend={kpis.trendBookings}
          />
          <KPICard
            icon={DollarSign}
            label="Rental Total"
            value={fmtUSD(kpis.totalRental)}
            color="cyan"
            tooltip="Receita total de aluguel acumulada no ano (YTD)"
            trend={kpis.trendRental}
          />
          <KPICard
            icon={TrendingUp}
            label="Receita Empresa"
            value={fmtUSD(kpis.totalCompany)}
            color="green"
            tooltip="Total recebido pela empresa (comissao + taxas)"
            trend={kpis.trendCompany}
          />
          <KPICard
            icon={PiggyBank}
            label="Lucro Liquido"
            value={fmtUSD(kpis.totalCompanyProfit)}
            color="teal"
            tooltip="Lucro liquido da empresa apos custos operacionais"
          />
          <KPICard
            icon={Users}
            label="Receita Proprietarios"
            value={fmtUSD(kpis.totalOwner)}
            color="orange"
            tooltip="Total repassado aos proprietarios das unidades"
          />
          <KPICard
            icon={BarChart2}
            label="Ocupacao Media"
            value={`${kpis.avgOcc.toFixed(1)}%`}
            color={kpis.avgOcc >= 60 ? 'green' : 'rose'}
            tooltip="Taxa de ocupacao media de todas as propriedades ativas"
            trend={kpis.trendOcc}
          />
        </div>
      )}

      {/* Auto Insights */}
      {isLoading ? (
        <InsightsSkeleton />
      ) : (
        <ErrorBoundary>
          <InsightsPanel monthly={monthly} properties={properties} />
        </ErrorBoundary>
      )}

      {/* Charts row 1: Revenue + Occupancy */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ChartSkeleton height={220} />
          </div>
          <ChartSkeleton height={220} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ErrorBoundary>
              <RevenueChart data={monthly} />
            </ErrorBoundary>
          </div>
          <ErrorBoundary>
            <OccupancyChart data={monthly} />
          </ErrorBoundary>
        </div>
      )}

      {/* Charts row 2: Revenue Breakdown + Bookings */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height={220} />
          <ChartSkeleton height={220} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ErrorBoundary>
            <RevenueBreakdown data={monthly} />
          </ErrorBoundary>
          <ErrorBoundary>
            <BookingsChart data={monthly} />
          </ErrorBoundary>
        </div>
      )}
    </div>
  )
}
