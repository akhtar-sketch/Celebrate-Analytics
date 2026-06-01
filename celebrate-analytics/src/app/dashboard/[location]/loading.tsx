export default function Loading() {
  return (
    <div className="space-y-10 animate-pulse">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2.5">
          <div className="h-2.5 w-28 bg-edge rounded-full" />
          <div className="h-7 w-44 bg-edge rounded-lg" />
          <div className="h-3.5 w-36 bg-edge-soft rounded-full" />
        </div>
        <div className="h-9 w-52 bg-surface border border-edge rounded-xl shrink-0" />
      </div>

      {/* KPI band */}
      <div className="bg-surface border border-edge rounded-2xl px-6 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-edge-soft">
          {(['pr-6', 'px-6', 'px-6', 'pl-6'] as const).map((pad, i) => (
            <div key={i} className={`${pad} space-y-3`}>
              <div className="h-2.5 w-20 bg-edge-soft rounded-full" />
              <div className="h-8 w-28 bg-edge rounded-lg" />
              <div className="h-2.5 w-16 bg-edge-soft rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Platform breakdown label + cards */}
      <div>
        <div className="h-2.5 w-36 bg-edge-soft rounded-full mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="bg-surface border border-edge rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-edge shrink-0" />
                <div className="h-3.5 w-24 bg-edge rounded-full" />
                <div className="h-3 w-8 bg-edge-soft rounded-full ml-auto" />
              </div>
              <div className="space-y-1.5">
                <div className="h-7 w-28 bg-edge rounded-lg" />
                <div className="h-1 w-full bg-edge-soft rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-1 border-t border-edge-soft">
                {[0, 1, 2, 3].map((j) => (
                  <div key={j} className="space-y-1">
                    <div className="h-2 w-10 bg-edge-soft rounded-full" />
                    <div className="h-3.5 w-14 bg-edge rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spend trend */}
      <div>
        <div className="h-2.5 w-40 bg-edge-soft rounded-full mb-4" />
        <div className="bg-surface border border-edge rounded-2xl h-[236px]" />
      </div>

      {/* Conversions by platform */}
      <div>
        <div className="h-2.5 w-44 bg-edge-soft rounded-full mb-4" />
        <div className="bg-surface border border-edge rounded-2xl h-[236px]" />
      </div>

      {/* Top campaigns */}
      <div>
        <div className="h-2.5 w-48 bg-edge-soft rounded-full mb-4" />
        <div className="bg-surface border border-edge rounded-2xl p-5 space-y-0">
          {/* Table header */}
          <div className="flex items-center gap-4 pb-3 border-b border-edge-soft">
            <div className="h-2 w-20 bg-edge-soft rounded-full" />
            <div className="h-2 w-12 bg-edge-soft rounded-full ml-auto" />
            <div className="h-2 w-10 bg-edge-soft rounded-full" />
            <div className="h-2 w-10 bg-edge-soft rounded-full" />
            <div className="h-2 w-10 bg-edge-soft rounded-full" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-edge-soft/50">
              <div className="w-5 h-5 rounded-md bg-edge shrink-0" />
              <div className="h-3.5 bg-edge rounded-full flex-1 max-w-[180px]" />
              <div className="h-3.5 w-16 bg-edge-soft rounded-full ml-auto" />
              <div className="h-3.5 w-10 bg-edge-soft rounded-full" />
              <div className="h-3.5 w-14 bg-edge-soft rounded-full" />
              <div className="h-3.5 w-12 bg-edge-soft rounded-full" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
