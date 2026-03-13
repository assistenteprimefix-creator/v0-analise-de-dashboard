function Pulse({ className }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-slate-800 ${className}`} />
}

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-[#111827] p-5">
          <div className="flex items-start justify-between mb-3">
            <Pulse className="w-9 h-9" />
          </div>
          <Pulse className="h-7 w-20 mb-2" />
          <Pulse className="h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ height = 220 }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5">
      <Pulse className="h-4 w-36 mb-2" />
      <Pulse className="h-3 w-52 mb-5" />
      <Pulse className={`w-full`} style={{ height }} />
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex gap-3">
        <Pulse className="h-9 flex-1 min-w-[180px]" />
        <Pulse className="h-9 w-40" />
        <Pulse className="h-9 w-28" />
        <Pulse className="h-9 w-24" />
      </div>
      <div className="divide-y divide-gray-100 dark:divide-slate-800/60">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="flex-1 space-y-1.5">
              <Pulse className="h-3.5 w-48" />
              <Pulse className="h-2.5 w-28" />
            </div>
            <Pulse className="h-5 w-10 rounded-full" />
            <Pulse className="h-5 w-14 rounded-full" />
            <Pulse className="h-5 w-12 rounded-full" />
            <Pulse className="h-5 w-12 rounded-full" />
            <Pulse className="h-5 w-12 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function InsightsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-[#111827] p-4">
          <Pulse className="h-3 w-24 mb-2" />
          <Pulse className="h-5 w-32 mb-1" />
          <Pulse className="h-3 w-28" />
        </div>
      ))}
    </div>
  )
}
