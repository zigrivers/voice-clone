"use client"

/**
 * Header component with navigation and user menu
 */

import Link from "next/link"
import { useAppStore } from "@/stores/app-store"
import { UserMenu } from "@/components/auth/user-menu"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function Header() {
  const { toggleSidebar } = useAppStore()

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">Voice Clone</span>
        </Link>
      </div>
      <UserMenu />
    </header>
  )
}
