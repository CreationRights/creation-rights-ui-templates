"use client"

import { Upload, FolderPlus, ShieldCheck, Image, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const metrics = [
  { 
    label: "Total Assets", 
    value: "24,592", 
    trend: "+12.5%",
    trendUp: true,
    description: "Trending up this month",
    subtext: "342 new assets added"
  },
  { 
    label: "Pending Approvals", 
    value: "12", 
    trend: "-20%",
    trendUp: false,
    urgent: true,
    description: "Down 20% from last week",
    subtext: "3 require urgent attention"
  },
  { 
    label: "Active Licenses", 
    value: "3,401", 
    trend: "+8.2%",
    trendUp: true,
    description: "Strong license retention",
    subtext: "28 new this month"
  },
  { 
    label: "Compliance Score", 
    value: "98%", 
    trend: "+2.1%",
    trendUp: true,
    description: "Steady performance increase",
    subtext: "Exceeds target of 95%"
  },
]

const pendingApprovals = [
  {
    id: 1,
    name: "Hero Banner - Spring Campaign",
    stage: "Legal Review",
    urgency: "high",
    assignee: "Legal Team",
  },
  {
    id: 2,
    name: "Product Shot Series A",
    stage: "Manager Approval",
    urgency: "medium",
    assignee: "David Chen",
  },
  {
    id: 3,
    name: "Social Media Pack Q2",
    stage: "Compliance Check",
    urgency: "low",
    assignee: "Compliance",
  },
  {
    id: 4,
    name: "Video Thumbnail Collection",
    stage: "Final Review",
    urgency: "high",
    assignee: "Sarah Mitchell",
  },
]

const recentActivity = [
  {
    id: 1,
    avatar: "DC",
    text: "David updated license terms for Campaign X",
    time: "2h ago",
  },
  {
    id: 2,
    avatar: "SM",
    text: "Sarah approved 5 assets for Q2 campaign",
    time: "4h ago",
  },
  {
    id: 3,
    avatar: "JW",
    text: "James uploaded 23 new AI-generated images",
    time: "6h ago",
  },
  {
    id: 4,
    avatar: "LK",
    text: "Lisa flagged compliance issue on Asset #4521",
    time: "8h ago",
  },
  {
    id: 5,
    avatar: "MR",
    text: "Mike resolved rights conflict for Brand Assets",
    time: "12h ago",
  },
]

export function OverviewDashboard() {
  return (
    <ScrollArea className="h-full">
      <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 text-foreground">
        {/* Header Area */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Good morning, Sarah.
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {"Here's the status of your creative operations today."}
            </p>
          </div>
          <Button size="sm">
            Quick Create
          </Button>
        </div>

        {/* Metrics Grid - ShadCN style with trend badges */}
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="p-6 border border-border rounded-xl bg-card flex flex-col gap-2"
            >
              {/* Header with label and trend badge */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">{metric.label}</span>
                <span
                  className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                    metric.trendUp
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  {metric.trendUp ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {metric.trend}
                </span>
              </div>
              
              {/* Value */}
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                {metric.value}
              </span>
              
              {/* Description with trend icon */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                {metric.trendUp ? (
                  <TrendingUp className="size-4" />
                ) : (
                  <TrendingDown className="size-4" />
                )}
                {metric.description}
              </div>
              
              {/* Subtext */}
              <span className="text-xs text-muted-foreground">{metric.subtext}</span>
            </div>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Pending Approvals Queue - Spans 2 columns */}
          <div className="col-span-2 border border-border rounded-xl bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-base">Pending Approvals</h3>
              <Button variant="ghost" size="sm" className="h-8 text-sm">
                View All
              </Button>
            </div>
            <div className="divide-y divide-border">
              {pendingApprovals.map((item) => (
                <div
                  key={item.id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="size-12 rounded-lg bg-muted flex items-center justify-center">
                    <Image className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.stage} • {item.assignee}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.urgency === "high"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : item.urgency === "medium"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.urgency === "high" ? "Urgent" : item.urgency === "medium" ? "Medium" : "Low"}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8">
                      Review
                    </Button>
                    <Button size="sm" className="h-8">
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* AI Governance Snapshot */}
            <div className="border border-border rounded-xl bg-card p-6">
              <h3 className="font-semibold text-base mb-4">AI Governance Snapshot</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Models</span>
                  <span className="text-sm font-medium text-foreground">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Prompts Logged (24h)</span>
                  <span className="text-sm font-medium text-foreground">1,204</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Risk Score</span>
                  <span className="text-sm font-medium text-foreground">Low (1.2)</span>
                </div>
                <div className="pt-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[12%] bg-foreground rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="border border-border rounded-xl bg-card flex-1 overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-base">Recent Activity</h3>
              </div>
              <div className="divide-y divide-border">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="px-6 py-4 flex items-start gap-3"
                  >
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                      {activity.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        {activity.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
