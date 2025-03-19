"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LightbulbIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function NavigationMenu() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <LightbulbIcon className="h-6 w-6" />
            <span className="font-bold">IdeaForge</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/projects"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith("/projects") ? "text-foreground" : "text-foreground/60"
              )}
            >
              Projects
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="outline" asChild>
              <Link href="/login">
                Login
              </Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Get Started
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}