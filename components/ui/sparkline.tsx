"use client"

import { cn } from "@/lib/utils"

interface SparklineProps extends React.HTMLAttributes<HTMLDivElement> {
  data: number[]
  color?: "primary" | "success" | "warning" | "destructive"
  height?: number
  showArea?: boolean
  animated?: boolean
}

export function Sparkline({
  data,
  color = "primary",
  height = 32,
  showArea = true,
  animated = true,
  className,
  ...props
}: SparklineProps) {
  if (!data || data.length < 2) {
    return null
  }

  const width = 100
  const padding = 2

  // Calculate min, max and normalize data
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  // Generate points
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return { x, y }
  })

  // Generate SVG path for the line
  const linePath = points.map((point, index) => {
    return `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
  }).join(" ")

  // Generate SVG path for the area
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${height - padding} L ${points[0].x.toFixed(2)} ${height - padding} Z`

  const colorClasses = {
    primary: {
      stroke: "stroke-primary",
      fill: "fill-primary/10",
    },
    success: {
      stroke: "stroke-success",
      fill: "fill-success/10",
    },
    warning: {
      stroke: "stroke-warning",
      fill: "fill-warning/10",
    },
    destructive: {
      stroke: "stroke-destructive",
      fill: "fill-destructive/10",
    },
  }

  return (
    <div className={cn("relative", className)} {...props}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ height }}
      >
        {showArea && (
          <path
            d={areaPath}
            className={cn(
              colorClasses[color].fill,
              animated && "animate-in fade-in duration-500"
            )}
          />
        )}
        <path
          d={linePath}
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            colorClasses[color].stroke,
            animated && "animate-in fade-in duration-500"
          )}
          style={{
            strokeDasharray: animated ? 1000 : undefined,
            strokeDashoffset: animated ? 1000 : undefined,
            animation: animated ? "sparkline-draw 1s ease-out forwards" : undefined,
          }}
        />
        {/* End point dot */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="2"
          className={cn(
            colorClasses[color].stroke.replace("stroke-", "fill-"),
            animated && "animate-in zoom-in duration-300 delay-500"
          )}
        />
      </svg>
    </div>
  )
}

// Inline sparkline for use in text
interface SparklineInlineProps {
  data: number[]
  color?: "primary" | "success" | "warning" | "destructive"
  trend?: "up" | "down" | "neutral"
}

export function SparklineInline({ data, color, trend }: SparklineInlineProps) {
  // Auto-detect trend from data if not provided
  const autoTrend = trend ?? (data[data.length - 1] >= data[0] ? "up" : "down")
  const autoColor = color ?? (autoTrend === "up" ? "success" : autoTrend === "down" ? "destructive" : "primary")

  return (
    <Sparkline
      data={data}
      color={autoColor}
      height={20}
      showArea={false}
      className="w-16 inline-block align-middle"
    />
  )
}

// Metric card with sparkline
interface MetricSparklineProps {
  label: string
  value: string | number
  data: number[]
  color?: "primary" | "success" | "warning" | "destructive"
  change?: {
    value: number
    type: "increase" | "decrease"
  }
  className?: string
}

export function MetricSparkline({
  label,
  value,
  data,
  color = "primary",
  change,
  className,
}: MetricSparklineProps) {
  const colorClasses = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  }

  return (
    <div className={cn("relative p-4 bg-card border border-border rounded-md overflow-hidden", className)}>
      <div className={cn("absolute top-0 left-0 w-0.5 h-full", colorClasses[color])} />

      <div className="flex items-start justify-between mb-2">
        <div className="space-y-1 flex-1">
          <p className="metric-label">{label}</p>
          <p className="metric-value text-foreground">{value}</p>
          {change && (
            <p className={cn(
              "text-xs font-medium",
              change.type === "increase" ? "text-success" : "text-destructive"
            )}>
              {change.type === "increase" ? "+" : "-"}{Math.abs(change.value)}%
            </p>
          )}
        </div>
        <div className="w-20 h-10">
          <Sparkline data={data} color={color} height={40} />
        </div>
      </div>
    </div>
  )
}

// Bar sparkline variant
interface SparklineBarsProps extends React.HTMLAttributes<HTMLDivElement> {
  data: number[]
  color?: "primary" | "success" | "warning" | "destructive"
  height?: number
  barWidth?: number
  gap?: number
}

export function SparklineBars({
  data,
  color = "primary",
  height = 32,
  barWidth = 4,
  gap = 2,
  className,
  ...props
}: SparklineBarsProps) {
  if (!data || data.length === 0) {
    return null
  }

  const max = Math.max(...data)

  const colorClasses = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  }

  return (
    <div
      className={cn("flex items-end", className)}
      style={{ height, gap }}
      {...props}
    >
      {data.map((value, index) => {
        const barHeight = (value / max) * height
        return (
          <div
            key={index}
            className={cn(
              "rounded-t-sm transition-all duration-300",
              colorClasses[color],
              "opacity-60 hover:opacity-100"
            )}
            style={{
              width: barWidth,
              height: barHeight,
              animationDelay: `${index * 50}ms`,
            }}
          />
        )
      })}
    </div>
  )
}
