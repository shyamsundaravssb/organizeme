import SkeletonCard from "./SkeletonCard";

export default function PlaylistPageSkeleton() {
  return (
    <div className="container mx-auto p-4 sm:p-8 animate-pulse">
      <div className="h-10 bg-surface-secondary rounded w-48 mb-4"></div>
      <div className="h-10 bg-surface-secondary rounded w-3/4 mb-2"></div>
      <div className="h-6 bg-surface-secondary rounded w-1/2 mb-8"></div>
      <div className="h-16 bg-surface-secondary rounded-lg mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
