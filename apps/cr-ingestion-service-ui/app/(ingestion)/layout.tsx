import { Suspense } from "react"
import { RoleProvider } from "@/components/ingestion/role-context"
import { AppShell } from "@/components/ingestion/shell"

export default function IngestionLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <Suspense>
        <AppShell>{children}</AppShell>
      </Suspense>
    </RoleProvider>
  )
}
