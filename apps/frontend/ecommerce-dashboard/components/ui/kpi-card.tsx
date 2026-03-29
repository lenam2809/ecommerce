"use client"

import React from "react"
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

interface KpiCardProps {
  label: string
  value: string | number
  trend: number
  trendLabel: string
  icon: LucideIcon
  iconColor: string      // Expects a hex color or css variable e.g. "var(--color-accent)" or "#6366F1"
  sparklineData: Array<{ value: number }>
  loading?: boolean
}

export function KpiCard({
  label,
  value,
  trend,
  trendLabel,
  icon: Icon,
  iconColor,
  sparklineData,
  loading = false,
}: KpiCardProps) {
  const isPositive = trend >= 0

  if (loading) {
    return (
      <div className="rounded-xl border border-[--color-border] bg-[--color-bg-card] backdrop-blur-xl p-5 shadow-sm transition-all duration-150 relative overflow-hidden flex flex-col justify-between h-[140px]">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-[--color-border] animate-pulse" />
          <div className="h-10 w-10 rounded-lg bg-[--color-border] animate-pulse" />
        </div>
        <div className="h-8 w-32 rounded bg-[--color-border] animate-pulse mt-4" />
        <div className="h-3 w-40 rounded bg-[--color-border] animate-pulse mt-2" />
      </div>
    )
  }

  return (
    <div className="group rounded-xl border border-[--color-border] bg-[--color-bg-card] backdrop-blur-xl p-5 shadow-sm transition-all duration-150 hover:border-[--color-border-hover] relative overflow-hidden flex flex-col justify-between h-[140px]">
      <div className="flex items-start justify-between z-10">
        <div>
          <p className="text-sm font-medium text-[--color-text-2]">{label}</p>
          <div className="mt-2 text-2xl font-semibold tabular-nums text-[--color-text-1]">
            {value}
          </div>
        </div>
        <div
          className="rounded-lg p-2"
          style={{ backgroundColor: `color-mix(in srgb, ${iconColor} 15%, transparent)` }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 z-10">
        <div
          className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isPositive ? "bg-[--color-success]/10 text-[--color-success]" : "bg-[--color-danger]/10 text-[--color-danger]"
            }`}
        >
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(trend)}%</span>
        </div>
        <span className="text-xs text-[--color-text-3] truncate">{trendLabel}</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-300">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${label.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? "var(--color-success)" : "var(--color-danger)"} stopOpacity={0.4} />
                <stop offset="100%" stopColor={isPositive ? "var(--color-success)" : "var(--color-danger)"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? "var(--color-success)" : "var(--color-danger)"}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${label.replace(/\s+/g, '-')})`}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
