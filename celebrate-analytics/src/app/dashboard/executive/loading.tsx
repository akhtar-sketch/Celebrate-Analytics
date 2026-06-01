export default function Loading() {
  return (
    <div className="space-y-10 animate-pulse">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2.5">
          <div className="h-2.5 w-32 bg-edge rounded-full" />
          <div className="h-7 w-36 bg-edge rounded-lg" />
          <div className="h-3.5 w-48 bg-edge-soft rounded-full" />
        </div>
        <div className="h-9 w-52 bg-surface border border-edge rounded-xl shrink-0" />
      </div>

      {/* Hero KPIs */}
      <div className="flex items-start gap-10 pb-8 border-b border-edge-soft">
        {[0, 1, 2].map((i) => (
          <>
            {i > 0 && <div key={`div-${i}`} className="w-px self-stretch bg-edge-soft" />}
            <div key={i} className="space-y-2.5 min-w-0">
              <div className="h-2.5 w-24 bg-edge-soft rounded-full" />
              <div className="h-10 w-36 bg-edge rounded-xl" />
            </div>
          </>
        ))}
      </div>

      {/* Location breakdown */}
      <div>
        <div className="h-2.5 w-60 bg-edge-soft rounded-full mb-4" />
        <div className="bg-surface border border-edge rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-edge">
            {[32, 16, 16, 16, 20].map((w, i) => (
              <div
                key={i}
                className={`h-2 bg-edge-soft rounded-full ${i > 0 ? 'ml-auto' : ''}`}
                style={{ width: `${w * 4}px` }}
              />
            ))}
          </div>
          {/* Rows */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-3 border-b border-edge-soft/60"
            >
              <div className="h-3.5 bg-edge rounded-full w-28" />
              <div className="h-3.5 bg-edge-soft rounded-full w-20 ml-auto" />
              <div className="h-3.5 bg-edge-soft rounded-full w-12" />
              <div className="h-3.5 bg-edge-soft rounded-full w-14" />
              <div className="flex items-center gap-2 justify-end">
                <div className="h-2.5 w-10 bg-edge-soft rounded-full" />
                <div className="h-1.5 w-16 bg-edge-soft rounded-full" />
              </div>
            </div>
          ))}
          {/* Footer */}
          <div className="flex items-center gap-4 px-5 py-3 border-t border-edge bg-wash/30">
            <div className="h-3.5 w-10 bg-edge rounded-full" />
            <div className="h-3.5 w-24 bg-edge rounded-full ml-auto" />
            <div className="h-3.5 w-12 bg-edge-soft rounded-full" />
            <div className="h-3.5 w-14 bg-edge-soft rounded-full" />
            <div className="h-2.5 w-8 bg-edge-soft rounded-full" />
          </div>
        </div>
      </div>

    </div>
  )
}
