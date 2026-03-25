'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Shield,
  Webhook,
  Cloud,
  Bell,
  Flag,
  Layers,
  AlertTriangle,
  Activity,
  Archive,
  KeyRound,
} from 'lucide-react'

interface PageDef {
  title: string
  description: string
  icon: React.ElementType
  stats: { label: string; value: string }[]
  actions: string[]
}

const pages: Record<string, PageDef> = {
  'tenant-org': {
    title: 'Tenant & Org Management',
    description: 'Manage tenant accounts, organization hierarchies, and provisioning settings.',
    icon: Building2,
    stats: [
      { label: 'Active Tenants', value: '47' },
      { label: 'Organizations', value: '12' },
      { label: 'Pending Invites', value: '5' },
      { label: 'Suspended', value: '2' },
    ],
    actions: ['Create Tenant', 'Import Orgs', 'Export Report'],
  },
  entitlements: {
    title: 'Entitlements',
    description: 'Configure feature access, usage limits, and licensing per tenant.',
    icon: Shield,
    stats: [
      { label: 'Active Plans', value: '6' },
      { label: 'Overages This Month', value: '3' },
      { label: 'Custom Entitlements', value: '18' },
      { label: 'Expiring Soon', value: '4' },
    ],
    actions: ['Add Entitlement', 'Audit Usage', 'Sync Plans'],
  },
  webhooks: {
    title: 'Webhooks',
    description: 'Monitor and manage outbound webhook endpoints across all tenants.',
    icon: Webhook,
    stats: [
      { label: 'Active Endpoints', value: '134' },
      { label: 'Failed (24h)', value: '11' },
      { label: 'Retry Queue', value: '1,240' },
      { label: 'Avg Latency', value: '312ms' },
    ],
    actions: ['Add Endpoint', 'Flush Queue', 'View Logs'],
  },
  'cloud-storage': {
    title: 'Cloud Storage',
    description: 'Manage cloud storage buckets, policies, and per-tenant allocation.',
    icon: Cloud,
    stats: [
      { label: 'Total Used', value: '6.0 TB' },
      { label: 'Total Capacity', value: '9.0 TB' },
      { label: 'Buckets', value: '47' },
      { label: 'Nearing Limit', value: '2' },
    ],
    actions: ['Add Bucket', 'Set Quota', 'View Usage'],
  },
  notifications: {
    title: 'Notifications',
    description: 'Configure notification channels, templates, and delivery rules.',
    icon: Bell,
    stats: [
      { label: 'Channels Active', value: '8' },
      { label: 'Sent (24h)', value: '2,847' },
      { label: 'Delivery Rate', value: '99.1%' },
      { label: 'Suppressed', value: '34' },
    ],
    actions: ['Add Channel', 'Edit Templates', 'View Logs'],
  },
  'feature-flags': {
    title: 'Feature Flags',
    description: 'Control feature rollout and experimental flags across tenants.',
    icon: Flag,
    stats: [
      { label: 'Total Flags', value: '42' },
      { label: 'Enabled', value: '29' },
      { label: 'In Rollout', value: '6' },
      { label: 'Deprecated', value: '7' },
    ],
    actions: ['Create Flag', 'Rollout Manager', 'Audit History'],
  },
  'adobe-connector': {
    title: 'Adobe Connector',
    description: 'Manage Adobe Creative Cloud integration, sync status, and API keys.',
    icon: Layers,
    stats: [
      { label: 'Connected Orgs', value: '19' },
      { label: 'Sync Errors', value: '3' },
      { label: 'Assets Synced (24h)', value: '14,021' },
      { label: 'API Quota Used', value: '61%' },
    ],
    actions: ['Add Connection', 'Re-auth', 'View Sync Log'],
  },
  'incident-watch': {
    title: 'Incident Watch',
    description: 'Track, triage, and resolve platform incidents across all services.',
    icon: AlertTriangle,
    stats: [
      { label: 'Open', value: '3' },
      { label: 'Investigating', value: '2' },
      { label: 'Resolved (7d)', value: '14' },
      { label: 'P1 SLA Breaches', value: '0' },
    ],
    actions: ['Open Incident', 'Runbooks', 'PagerDuty'],
  },
  omniplex: {
    title: 'Omniplex',
    description: 'Real-time event stream and cross-system observability for the platform.',
    icon: Activity,
    stats: [
      { label: 'Events/sec', value: '4,210' },
      { label: 'Active Streams', value: '23' },
      { label: 'Dropped Events (1h)', value: '0' },
      { label: 'Consumers', value: '11' },
    ],
    actions: ['New Stream', 'Configure Filters', 'Export Events'],
  },
  'retention-archive': {
    title: 'Retention & Archive',
    description: 'Set data retention policies, archive schedules, and purge rules.',
    icon: Archive,
    stats: [
      { label: 'Active Policies', value: '9' },
      { label: 'Archived (30d)', value: '2.1 TB' },
      { label: 'Pending Purge', value: '3' },
      { label: 'Compliance Holds', value: '1' },
    ],
    actions: ['Add Policy', 'Schedule Archive', 'Review Holds'],
  },
  secrets: {
    title: 'Secrets',
    description: 'Manage encrypted secrets, API keys, and rotation schedules.',
    icon: KeyRound,
    stats: [
      { label: 'Stored Secrets', value: '88' },
      { label: 'Expiring Soon', value: '5' },
      { label: 'Last Rotated', value: '2d ago' },
      { label: 'Access Violations', value: '0' },
    ],
    actions: ['Add Secret', 'Rotate All', 'View Audit Log'],
  },
}

interface SectionPageProps {
  itemId: string
}

export function SectionPage({ itemId }: SectionPageProps) {
  const page = pages[itemId]

  if (!page) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Page not found: {itemId}</p>
      </div>
    )
  }

  const Icon = page.icon

  return (
    <ScrollArea className="h-full">
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-xl border border-border bg-muted flex items-center justify-center shrink-0">
              <Icon className="size-5 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
                {page.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 text-pretty">{page.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {page.actions.map((action, i) => (
              <Button
                key={action}
                variant={i === page.actions.length - 1 ? 'default' : 'outline'}
                size="sm"
                className="h-8"
              >
                {action}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {page.stats.map((stat) => (
            <div
              key={stat.label}
              className="p-5 border border-border rounded-xl bg-card flex flex-col gap-1.5"
            >
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Placeholder content area */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h3 className="text-base font-semibold text-foreground">Data</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="size-12 rounded-xl border border-border bg-muted flex items-center justify-center">
              <Icon className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No data yet</p>
            <p className="text-xs text-muted-foreground">
              This section is under construction. Check back soon.
            </p>
            <Button variant="outline" size="sm" className="h-8 mt-2">
              {page.actions[0]}
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
