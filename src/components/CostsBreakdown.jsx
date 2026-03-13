import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Wallet, TrendingDown, DollarSign, Percent } from 'lucide-react'
import { getTooltipStyle, GRID_COLOR, TICK_COLOR } from '../utils/chartTheme'

const COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6']

const fmtUSD = v => {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`
  return `$${v.toLocaleString('en-US')}`
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    green: 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400',
    blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400',
  }

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} />
        <span className="text-xs text-gray-500 dark:text-slate-400">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function CostsBreakdown({ data }) {
  const stats = useMemo(() => {
    if (!data.length) return null

    const totals = data.reduce((acc, m) => ({
      rental: acc.rental + m.rental,
      cleaning: acc.cleaning + m.cleaning,
      poolHeat: acc.poolHeat + m.poolHeat,
      bookingFee: acc.bookingFee + m.bookingFee,
      companyProfit: acc.companyProfit + m.companyProfit,
      owner: acc.owner + m.owner,
    }), { rental: 0, cleaning: 0, poolHeat: 0, bookingFee: 0, companyProfit: 0, owner: 0 })

    const totalCosts = totals.cleaning + totals.poolHeat + totals.bookingFee
    const costRatio = totals.rental > 0 ? (totalCosts / totals.rental * 100) : 0
    const profitMargin = totals.rental > 0 ? (totals.companyProfit / totals.rental * 100) : 0

    const pieData = [
      { name: 'Cleaning', value: totals.cleaning, color: '#10b981' },
      { name: 'Pool Heat', value: totals.poolHeat, color: '#f59e0b' },
      { name: 'Booking Fee', value: totals.bookingFee, color: '#8b5cf6' },
    ].filter(d => d.value > 0)

    const monthlyData = data.map(m => ({
      mes: m.mes,
      cleaning: m.cleaning,
      poolHeat: m.poolHeat,
      bookingFee: m.bookingFee,
      total: m.cleaning + m.poolHeat + m.bookingFee,
    }))

    return {
      totals,
      totalCosts,
      costRatio,
      profitMargin,
      pieData,
      monthlyData,
    }
  }, [data])

  if (!stats) return null

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Wallet size={15} className="text-amber-500" />
          Custos Operacionais
        </h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={DollarSign}
            label="Custo Total YTD"
            value={fmtUSD(stats.totalCosts)}
            color="amber"
          />
          <StatCard
            icon={Percent}
            label="Custo / Receita"
            value={`${stats.costRatio.toFixed(1)}%`}
            sub="do rental total"
            color="purple"
          />
          <StatCard
            icon={TrendingDown}
            label="Margem Liquida"
            value={`${stats.profitMargin.toFixed(1)}%`}
            sub="lucro da empresa"
            color="green"
          />
          <StatCard
            icon={Wallet}
            label="Lucro Absoluto"
            value={fmtUSD(stats.totals.companyProfit)}
            color="blue"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-3">Distribuicao de Custos</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => fmtUSD(v)}
                    {...getTooltipStyle()}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-gray-600 dark:text-slate-400">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Bar Chart */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-3">Custos Mensais</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: TICK_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: TICK_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                  <Tooltip
                    formatter={(v) => fmtUSD(v)}
                    {...getTooltipStyle()}
                  />
                  <Bar dataKey="cleaning" name="Cleaning" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="poolHeat" name="Pool Heat" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="bookingFee" name="Booking Fee" fill="#8b5cf6" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Cost Details Table */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-3">Detalhamento por Categoria</p>
          <div className="rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50">
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 dark:text-slate-400">Categoria</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 dark:text-slate-400">Total YTD</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 dark:text-slate-400">% do Custo</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 dark:text-slate-400">Media/Mes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {[
                  { name: 'Cleaning', value: stats.totals.cleaning, color: 'bg-green-500' },
                  { name: 'Pool Heat', value: stats.totals.poolHeat, color: 'bg-amber-500' },
                  { name: 'Booking Fee', value: stats.totals.bookingFee, color: 'bg-purple-500' },
                ].map(item => {
                  const pct = stats.totalCosts > 0 ? (item.value / stats.totalCosts * 100) : 0
                  const avg = data.length > 0 ? item.value / data.filter(m => m.rental > 0).length : 0
                  return (
                    <tr key={item.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-gray-900 dark:text-white">{item.name}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                        {fmtUSD(item.value)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 dark:text-slate-400">
                        {pct.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 dark:text-slate-400">
                        {fmtUSD(Math.round(avg))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 dark:bg-slate-800/50 font-semibold">
                  <td className="px-4 py-2 text-gray-900 dark:text-white">Total</td>
                  <td className="px-4 py-2 text-right text-gray-900 dark:text-white">{fmtUSD(stats.totalCosts)}</td>
                  <td className="px-4 py-2 text-right text-gray-500 dark:text-slate-400">100%</td>
                  <td className="px-4 py-2 text-right text-gray-500 dark:text-slate-400">
                    {fmtUSD(Math.round(stats.totalCosts / Math.max(1, data.filter(m => m.rental > 0).length)))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
