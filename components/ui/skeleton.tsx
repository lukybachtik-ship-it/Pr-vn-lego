import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

// Specialized skeleton components for common patterns

function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4 bg-card border border-border rounded-md space-y-3", className)} {...props}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  )
}

function SkeletonMetricCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative p-4 bg-card border border-border rounded-md overflow-hidden", className)} {...props}>
      <div className="absolute top-0 left-0 w-0.5 h-full bg-muted-foreground/20" />
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-7 w-28 mb-1" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

function SkeletonListItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between p-3.5 bg-card border border-border rounded-md", className)} {...props}>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="flex gap-2 ml-4">
        <Skeleton className="h-7 w-7 rounded" />
        <Skeleton className="h-7 w-16 rounded" />
      </div>
    </div>
  )
}

function SkeletonTable({ rows = 5, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { rows?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {/* Header */}
      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-md">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28 ml-auto" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 bg-card border border-border rounded-md">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      ))}
    </div>
  )
}

function SkeletonAvatar({ className, size = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    default: "w-10 h-10",
    lg: "w-14 h-14",
  }

  return (
    <Skeleton
      className={cn("rounded-full", sizeClasses[size], className)}
      {...props}
    />
  )
}

function SkeletonButton({ className, size = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-7 w-20",
    default: "h-9 w-24",
    lg: "h-11 w-32",
  }

  return (
    <Skeleton
      className={cn("rounded-md", sizeClasses[size], className)}
      {...props}
    />
  )
}

// Page-specific skeleton layouts

function SkeletonDashboard() {
  return (
    <div className="p-5 lg:p-6 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-card border border-border rounded-md stagger-item">
            <Skeleton className="w-10 h-10 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SkeletonMetricCard className="stagger-item" />
        <SkeletonMetricCard className="stagger-item" />
        <SkeletonMetricCard className="stagger-item" />
      </div>

      {/* Contracts */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="stagger-item" />
          ))}
        </div>
      </div>
    </div>
  )
}

function SkeletonClients() {
  return (
    <div className="p-5 lg:p-6 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-7 w-24 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <SkeletonButton size="sm" />
      </div>

      {/* Search */}
      <Skeleton className="h-9 w-full rounded-md" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SkeletonMetricCard className="stagger-item" />
        <SkeletonMetricCard className="stagger-item" />
        <SkeletonMetricCard className="stagger-item" />
      </div>

      {/* List */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="stagger-item" />
          ))}
        </div>
      </div>
    </div>
  )
}

function SkeletonCashFlow() {
  return (
    <div className="p-5 lg:p-6 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-7 w-20 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <SkeletonButton size="sm" />
          <SkeletonButton size="sm" />
          <SkeletonButton size="sm" />
        </div>
      </div>

      {/* VAT Indicator */}
      <Skeleton className="h-16 w-full rounded-md" />

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SkeletonMetricCard className="stagger-item" />
        <SkeletonMetricCard className="stagger-item" />
        <SkeletonMetricCard className="stagger-item" />
      </div>

      {/* Invoices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <Skeleton className="h-8 w-32 rounded" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonListItem key={i} className="stagger-item" />
          ))}
        </div>
      </div>
    </div>
  )
}

function SkeletonTimeTracking() {
  return (
    <div className="p-5 lg:p-6 max-w-[1200px] mx-auto flex gap-6">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0">
        <div className="sticky top-6 p-3 bg-card border border-border rounded-md">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full rounded" />
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <SkeletonButton size="sm" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SkeletonMetricCard className="stagger-item" />
          <SkeletonMetricCard className="stagger-item" />
          <SkeletonMetricCard className="stagger-item" />
        </div>

        {/* Timer */}
        <div className="p-4 bg-card border border-border rounded-md">
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-9 w-full col-span-2 rounded" />
            <Skeleton className="h-9 w-full rounded" />
            <Skeleton className="h-9 w-full rounded" />
            <Skeleton className="h-9 w-full col-span-2 rounded" />
          </div>
          <Skeleton className="h-9 w-full mt-4 rounded" />
        </div>

        {/* List */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonListItem key={i} className="stagger-item" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonQuickOrders() {
  return (
    <div className="p-5 lg:p-6 max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-7 w-36 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <SkeletonButton size="sm" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
            <div className="absolute top-0 left-0 w-0.5 h-full bg-muted-foreground/20" />
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-7 w-8 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* List */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3.5 bg-card border border-border rounded-md stagger-item">
              <div className="flex items-start gap-3">
                <Skeleton className="w-4 h-4 rounded mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="flex gap-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <Skeleton className="h-7 w-20 rounded" />
                    <Skeleton className="h-7 w-28 rounded" />
                    <Skeleton className="h-7 w-7 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonMetricCard,
  SkeletonListItem,
  SkeletonTable,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonDashboard,
  SkeletonClients,
  SkeletonCashFlow,
  SkeletonTimeTracking,
  SkeletonQuickOrders,
}
