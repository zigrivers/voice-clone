"use client"

/**
 * Sidebar navigation component
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppStore } from "@/stores/app-store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Users,
  PenTool,
  BookOpen,
  Settings,
  X,
  ChevronLeft,
} from "lucide-react"

const navigation = [
  {
    name: "Voice Clones",
    href: "/voice-clones" as const,
    icon: Users,
  },
  {
    name: "Create Content",
    href: "/create" as const,
    icon: PenTool,
  },
  {
    name: "Library",
    href: "/library" as const,
    icon: BookOpen,
  },
  {
    name: "Settings",
    href: "/settings" as const,
    icon: Settings,
  },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useAppStore()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <div className="flex h-16 items-center justify-between border-b px-4 md:hidden">
          <span className="text-lg font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Collapse button (desktop only) */}
        <div className="hidden border-t p-4 md:block">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={toggleSidebar}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Collapse
          </Button>
        </div>
      </aside>
    </>
  )
}
