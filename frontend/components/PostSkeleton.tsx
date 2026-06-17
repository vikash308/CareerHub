export default function PostSkeleton() {
  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl overflow-hidden">
      <div className="flex gap-3 items-center mb-5">
        <div className="skeleton-shimmer w-11 h-11 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-shimmer h-3 w-36 rounded-md" />
          <div className="skeleton-shimmer h-2.5 w-48 rounded-md" />
        </div>
      </div>

      <div className="space-y-2.5 mb-5">
        <div className="skeleton-shimmer h-3 w-full rounded-md" />
        <div className="skeleton-shimmer h-3 w-[92%] rounded-md" />
        <div className="skeleton-shimmer h-3 w-[78%] rounded-md" />
      </div>

      <div className="skeleton-shimmer h-52 w-full rounded-xl mb-5" />

      <div className="flex items-center gap-4 border-t border-white/5 pt-3.5">
        <div className="skeleton-shimmer h-3 w-12 rounded-md" />
        <div className="skeleton-shimmer h-3 w-12 rounded-md" />
        <div className="ml-auto skeleton-shimmer h-3 w-14 rounded-md" />
      </div>
    </div>
  );
}
