export default function ItemPageSkeleton() {
  return (
    <div className="container mx-auto p-4 sm:p-8 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div className="h-10 bg-surface-secondary rounded w-48 self-start"></div>
        <div className="flex gap-2 sm:gap-4">
          <div className="h-10 bg-surface-secondary rounded w-28"></div>
          <div className="h-10 bg-surface-secondary rounded w-28"></div>
          <div className="h-10 bg-surface-secondary rounded w-24"></div>
        </div>
      </div>
      <div className="bg-surface p-8 rounded-lg shadow-lg border border-border">
        <div className="h-10 bg-surface-secondary rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-surface-secondary rounded w-1/2 mb-8"></div>
        <div className="space-y-3">
          <div className="h-4 bg-surface-secondary rounded"></div>
          <div className="h-4 bg-surface-secondary rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}
