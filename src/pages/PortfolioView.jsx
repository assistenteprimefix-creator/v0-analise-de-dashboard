import { useState } from 'react'
import { Building2, DollarSign, TrendingUp, Grid3x3, BarChart3, GitCompare } from 'lucide-react'
import PropertyTable from '../components/PropertyTable'
import TopPerformers from '../components/TopPerformers'
import CondoBreakdown from '../components/CondoBreakdown'
import OccupancyDistribution from '../components/OccupancyDistribution'
import BedroomStats from '../components/BedroomStats'
import RevenueRanking from '../components/RevenueRanking'
import OccupancyHeatmap from '../components/OccupancyHeatmap'
import PricingAnalytics from '../components/PricingAnalytics'
import PropertyComparator from '../components/PropertyComparator'
import PropertyDetailModal from '../components/PropertyDetailModal'
import ErrorBoundary from '../components/ErrorBoundary'
import { TableSkeleton } from '../components/Skeleton'

function SectionTitle({ icon: Icon, title, children }) {
  return (
    <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
      <Icon size={15} className="text-blue-500 dark:text-blue-400 shrink-0" />
      <span>{title}</span>
      {children}
    </h2>
  )
}

function StatCard({ label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400',
  }

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}

export default function PortfolioView({ properties, loading }) {
  const isLoading = loading && !properties.length
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProperty, setSelectedProperty] = useState(null)

  // Calculate portfolio stats
  const totalProperties = properties.length
  const totalBedrooms = properties.reduce((s, p) => s + (p.bedrooms || 0), 0)
  const condoCount = new Set(properties.map(p => p.condominium).filter(Boolean)).size
  const guestFavorites = properties.filter(p => p.guestFavorite).length
  const petFriendly = properties.filter(p => p.isPet).length
  const avgOccupancy = properties.length
    ? Math.round(properties.reduce((s, p) => s + (p.avgOccupancy || 0), 0) / properties.length)
    : 0

  const handlePropertyClick = (property) => {
    setSelectedProperty(property)
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Propriedades" value={totalProperties} color="blue" />
        <StatCard label="Total Quartos" value={totalBedrooms} color="purple" />
        <StatCard label="Condominios" value={condoCount} color="green" />
        <StatCard label="Guest Favorites" value={guestFavorites} sub={`${totalProperties ? Math.round(guestFavorites/totalProperties*100) : 0}% do portfolio`} color="amber" />
        <StatCard label="Pet Friendly" value={petFriendly} sub={`${totalProperties ? Math.round(petFriendly/totalProperties*100) : 0}% aceita pets`} color="green" />
        <StatCard label="Ocupacao Media" value={`${avgOccupancy}%`} color={avgOccupancy >= 60 ? 'green' : 'amber'} />
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={Building2} label="Visao Geral" />
        <TabButton active={activeTab === 'heatmap'} onClick={() => setActiveTab('heatmap')} icon={Grid3x3} label="Heatmap" />
        <TabButton active={activeTab === 'pricing'} onClick={() => setActiveTab('pricing')} icon={BarChart3} label="Precos" />
        <TabButton active={activeTab === 'compare'} onClick={() => setActiveTab('compare')} icon={GitCompare} label="Comparar" />
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Analytics row: Condo + Occ Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ErrorBoundary>
              <CondoBreakdown properties={properties} />
            </ErrorBoundary>
            <ErrorBoundary>
              <OccupancyDistribution properties={properties} />
            </ErrorBoundary>
          </div>

          {/* Bedroom Stats */}
          <ErrorBoundary>
            <BedroomStats properties={properties} />
          </ErrorBoundary>

          {/* Revenue Ranking per property */}
          <div>
            <SectionTitle icon={DollarSign} title="Ranking de Receita por Propriedade" />
            <div className="mt-3">
              <ErrorBoundary>
                <RevenueRanking properties={properties} />
              </ErrorBoundary>
            </div>
          </div>

          {/* Top Performers */}
          <div>
            <SectionTitle icon={TrendingUp} title="Analise de Performance" />
            <div className="mt-3">
              <ErrorBoundary>
                <TopPerformers properties={properties} />
              </ErrorBoundary>
            </div>
          </div>

          {/* Properties Table */}
          <div>
            <SectionTitle icon={Building2} title="Todas as Propriedades" />
            <div className="mt-3">
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <ErrorBoundary>
                  <PropertyTable properties={properties} onPropertyClick={handlePropertyClick} />
                </ErrorBoundary>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'heatmap' && (
        <ErrorBoundary>
          <OccupancyHeatmap properties={properties} onPropertyClick={handlePropertyClick} />
        </ErrorBoundary>
      )}

      {activeTab === 'pricing' && (
        <ErrorBoundary>
          <PricingAnalytics properties={properties} />
        </ErrorBoundary>
      )}

      {activeTab === 'compare' && (
        <ErrorBoundary>
          <PropertyComparator properties={properties} />
        </ErrorBoundary>
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          allProperties={properties}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  )
}
