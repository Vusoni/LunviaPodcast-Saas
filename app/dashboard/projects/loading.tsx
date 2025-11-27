import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingDashboard() {
  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      {/* Page Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Project Cards Skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 @md:p-5">
              <div className="flex items-start gap-3 @md:gap-4">
                {/* Icon Skeleton */}
                <Skeleton className="h-16 w-16 @md:h-20 @md:w-20 rounded-2xl shrink-0" />

                {/* Content Skeleton */}
                <div className="flex-1 space-y-3">
                  {/* Title + Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>

                  {/* Metadata Badges */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-14" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default LoadingDashboard;
