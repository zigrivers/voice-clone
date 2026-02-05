/**
 * Dashboard layout with sidebar and header
 */

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"

// Force dynamic rendering since this layout uses client hooks
export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
