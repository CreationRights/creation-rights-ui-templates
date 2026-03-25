'use client'

import { useState, useEffect } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderPlus,
  Info,
  Shield,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// --- Types ---
interface MetricCard {
  label: string
  value: string
  description: string
  subtext: string
  trend: string
  trendUp: boolean
}

interface Incident {
  id: string
  title: string
  service: string
  severity: 'critical' | 'warning' | 'info'
  status: 'open' | 'investigating' | 'resolved'
  time: string
}

interface TenantStorage {
  name: string
  used: string
  usedGb: number
  maxGb: number
}

interface ServiceStatus {
  name: string
  status: 'operational' | 'degraded' | 'down'
}

interface ActivityItem {
  id: string
  action: string
  actor: string
  time: string
  type: 'create' | 'modify' | 'resolve' | 'warn'
}

// --- Data ---
const metrics: MetricCard[] = [
  {
    label: 'Active Tenants',
    value: '47',
    description: '+3 new this month',
    subtext: 'Last updated just now',
    trend: '+6.8%',
    trendUp: true,
  },
  {
    label: 'System Health',
    value: '99.8%',
    description: 'All services operational',
    subtext: 'Past 30 days uptime',
    trend: '+0.1%',
    trendUp: true,
  },
  {
    label: 'Open Incidents',
    value: '3',
    description: '1 critical requires action',
    subtext: 'SLA breach risk on 1',
    trend: '+2',
    trendUp: false,
  },
  {
    label: 'Pending Access Requests',
    value: '8',
    description: '2 urgent, awaiting review',
    subtext: 'Oldest: 3 days ago',
    trend: '+3',
    trendUp: false,
  },
]

const incidents: Incident[] = [
  {
    id: 'INC-041',
    title: 'Rights engine timeout spikes',
    service: 'IP Rights Engine',
    severity: 'critical',
    status: 'investigating',
    time: '14m ago',
  },
  {
    id: 'INC-040',
    title: 'Adobe Connector latency elevated',
    service: 'Adobe Connector',
    severity: 'warning',
    status: 'open',
    time: '1h ago',
  },
  {
    id: 'INC-039',
    title: 'Webhook retry queue backlog',
    service: 'Webhooks',
    severity: 'warning',
    status: 'investigating',
    time: '3h ago',
  },
  {
    id: 'INC-038',
    title: 'Audit log export delay',
    service: 'Data Governance',
    severity: 'info',
    status: 'open',
    time: '6h ago',
  },
  {
    id: 'INC-037',
    title: 'Notification delivery drop',
    service: 'Notifications',
    severity: 'info',
    status: 'resolved',
    time: '1d ago',
  },
]

const tenantStorage: TenantStorage[] = [
  { name: 'Acme Creative', used: '2.4 TB', usedGb: 2400, maxGb: 3000 },
  { name: 'Nike Marketing', used: '1.8 TB', usedGb: 1800, maxGb: 2000 },
  { name: 'State Farm', used: '890 GB', usedGb: 890, maxGb: 2000 },
  { name: 'Ogilvy Group', used: '640 GB', usedGb: 640, maxGb: 1000 },
  { name: 'Publicis Media', used: '310 GB', usedGb: 310, maxGb: 1000 },
]

const services: ServiceStatus[] = [
  { name: 'IP Rights Engine', status: 'degraded' },
  { name: 'Content Ingest', status: 'operational' },
  { name: 'Audit Trail', status: 'operational' },
  { name: 'Adobe Connector', status: 'degraded' },
  { name: 'Webhooks', status: 'operational' },
  { name: 'Notifications', status: 'operational' },
  { name: 'Data Governance', status: 'operational' },
  { name: 'Auth & IAM', status: 'operational' },
]

const activity: ActivityItem[] = [
  {
    id: '1',
    action: 'Tenant "Ogilvy Group" onboarded',
    actor: 'Admin',
    time: '2h ago',
    type: 'create',
  },
  {
    id: '2',
    action: 'Entitlements updated for Nike Marketing',
    actor: 'Admin',
    time: '4h ago',
    type: 'modify',
  },
  {
    id: '3',
    action: 'Incident INC-037 resolved',
    actor: 'System',
    time: '5h ago',
    type: 'resolve',
  },
  {
    id: '4',
    action: 'Feature flag "ai_tagging_v2" enabled',
    actor: 'Admin',
    time: '8h ago',
    type: 'modify',
  },
  {
    id: '5',
    action: 'Access request denied: Acme intern',
    actor: 'Admin',
    time: '1d ago',
    type: 'warn',
  },
  {
    id: '6',
    action: 'Tenant "State Farm" provisioned',
    actor: 'Admin',
    time: '2d ago',
    type: 'create',
  },
]

// --- Sub-components ---
function SeverityBadge({ severity }: { severity: Incident['severity'] }) {
  if (severity === 'critical') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
        <AlertCircle className="size-3" />
        Critical
      </span>
    )
  }
  if (severity === 'warning') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <AlertTriangle className="size-3" />
        Warning
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
      <Info className="size-3" />
      Info
    </span>
  )
}

function StatusBadge({ status }: { status: Incident['status'] }) {
  const map = {
    open: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    investigating: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    resolved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  }
  const labels = { open: 'Open', investigating: 'Investigating', resolved: 'Resolved' }
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', map[status])}>
      {labels[status]}
    </span>
  )
}

function StorageBar({ usedGb, maxGb }: { usedGb: number; maxGb: number }) {
  const pct = Math.min((usedGb / maxGb) * 100, 100)
  const isHigh = pct >= 80
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-all',
          isHigh ? 'bg-amber-500' : 'bg-foreground/30'
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  const base = 'size-6 rounded-full flex items-center justify-center shrink-0'
  if (type === 'create')
    return (
      <div className={cn(base, 'bg-emerald-500/10')}>
        <UserPlus className="size-3 text-emerald-600 dark:text-emerald-400" />
      </div>
    )
  if (type === 'resolve')
    return (
      <div className={cn(base, 'bg-emerald-500/10')}>
        <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
      </div>
    )
  if (type === 'warn')
    return (
      <div className={cn(base, 'bg-amber-500/10')}>
        <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
      </div>
    )
  return (
    <div className={cn(base, 'bg-muted')}>
      <Shield className="size-3 text-muted-foreground" />
    </div>
  )
}

// --- Main ---
export function OverviewDashboard() {
  const [greeting, setGreeting] = useState<string | null>(null)

  useEffect(() => {
    const hour = new Date().getHours()
    setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening')
  }, [])

  return (
    <ScrollArea className="h-full">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance" suppressHydrationWarning>
              {greeting ? `${greeting}, Admin.` : '\u00A0'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Platform operations at a glance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <AlertCircle className="size-4" />
              View Incidents
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <Users className="size-4" />
              Manage Permissions
            </Button>
            <Button size="sm" className="h-8 gap-2">
              <FolderPlus className="size-4" />
              Create Tenant
            </Button>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="p-5 border border-border rounded-xl bg-card flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{m.label}</span>
                <span
                  className={cn(
                    'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium',
                    m.trendUp
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  )}
                >
                  {m.trendUp ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {m.trend}
                </span>
              </div>
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                {m.value}
              </span>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                {m.trendUp ? (
                  <TrendingUp className="size-3.5 shrink-0" />
                ) : (
                  <TrendingDown className="size-3.5 shrink-0" />
                )}
                {m.description}
              </div>
              <span className="text-xs text-muted-foreground">{m.subtext}</span>
            </div>
          ))}
        </div>

        {/* Bottom grid: 3-col */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Recent Incidents — spans 2 cols */}
          <div className="col-span-2 border border-border rounded-xl bg-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Recent Incidents</h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                View all
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs text-muted-foreground font-medium px-5 py-2.5">
                      Incident
                    </th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-2.5">
                      Service
                    </th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-2.5">
                      Severity
                    </th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-3 py-2.5">
                      Status
                    </th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-5 py-2.5">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {incidents.map((inc) => (
                    <tr
                      key={inc.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-mono text-muted-foreground">
                            {inc.id}
                          </span>
                          <span className="text-sm text-foreground">{inc.title}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {inc.service}
                      </td>
                      <td className="px-3 py-3">
                        <SeverityBadge severity={inc.severity} />
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={inc.status} />
                      </td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                          <Clock className="size-3 shrink-0" />
                          {inc.time}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Health */}
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">System Health</h3>
              <span className="text-xs text-muted-foreground">33 services</span>
            </div>
            <div className="divide-y divide-border">
              {services.map((svc) => (
                <div
                  key={svc.name}
                  className="px-5 py-2.5 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm text-foreground">{svc.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'size-2 rounded-full shrink-0',
                        svc.status === 'operational'
                          ? 'bg-emerald-500'
                          : svc.status === 'degraded'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs font-medium',
                        svc.status === 'operational'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : svc.status === 'degraded'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {svc.status === 'operational'
                        ? 'OK'
                        : svc.status === 'degraded'
                        ? 'Degraded'
                        : 'Down'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row: Storage + Activity */}
        <div className="grid grid-cols-3 gap-6">
          {/* Storage Usage — 2 cols */}
          <div className="col-span-2 border border-border rounded-xl bg-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Storage Usage</h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                Manage
              </Button>
            </div>
            <div className="divide-y divide-border">
              {tenantStorage.map((t) => {
                const pct = Math.round((t.usedGb / t.maxGb) * 100)
                return (
                  <div key={t.name} className="px-5 py-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{t.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{t.used}</span>
                        <span
                          className={cn(
                            'text-xs font-medium tabular-nums',
                            pct >= 80
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-muted-foreground'
                          )}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <StorageBar usedGb={t.usedGb} maxGb={t.maxGb} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                View log
              </Button>
            </div>
            <div className="flex flex-col">
              {activity.map((item, i) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-start gap-3 px-5 py-3 hover:bg-muted/50 transition-colors',
                    i !== activity.length - 1 && 'border-b border-border'
                  )}
                >
                  <ActivityIcon type={item.type} />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm text-foreground leading-snug">{item.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.actor} · {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
