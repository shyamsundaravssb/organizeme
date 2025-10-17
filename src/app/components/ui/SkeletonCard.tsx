export default function SkeletonCard() {
  return (
    <div className="p-6 bg-surface rounded-lg shadow-md border border-border animate-pulse">
      <div className="h-6 bg-surface-secondary rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-surface-secondary rounded w-1/2"></div>
    </div>
  );
}
