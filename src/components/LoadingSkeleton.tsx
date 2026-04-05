export function SlangCardSkeleton() {
  return (
    <div className="bg-surface-raised rounded-2xl border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 bg-white/5 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
        <div className="h-5 w-16 bg-white/5 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-white/5 rounded relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
        <div className="h-4 w-3/4 bg-white/5 rounded relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
      </div>
      <div className="flex items-center gap-4 pt-2">
        <div className="h-8 w-20 bg-white/5 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
        <div className="h-8 w-20 bg-white/5 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
      </div>
    </div>
  );
}

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <SlangCardSkeleton key={i} />
      ))}
    </div>
  );
}
