function Shimmer() {
  return (
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_2s_infinite]" />
  );
}

export function SlangCardSkeleton() {
  return (
    <div className="bg-surface-raised rounded-2xl border border-white/[0.04] p-6 space-y-4">
      <div className="h-8 w-28 bg-white/[0.04] rounded-lg relative overflow-hidden"><Shimmer /></div>
      <div className="h-3 w-16 bg-white/[0.03] rounded relative overflow-hidden"><Shimmer /></div>
      <div className="space-y-2 mt-3">
        <div className="h-3 w-full bg-white/[0.03] rounded relative overflow-hidden"><Shimmer /></div>
        <div className="h-3 w-3/4 bg-white/[0.03] rounded relative overflow-hidden"><Shimmer /></div>
      </div>
    </div>
  );
}

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <SlangCardSkeleton key={i} />
      ))}
    </div>
  );
}
