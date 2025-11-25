import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <header className="flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded" />
        <span className="text-muted-foreground">/</span>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <div className="flex items-center gap-2 px-2 py-1.5">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </header>
  );
}
