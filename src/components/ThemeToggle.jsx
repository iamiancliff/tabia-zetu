"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export const ThemeToggle = () => {
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm"
    >
      {theme === "light" ? <Moon className="h-4 w-4 text-white" /> : <Sun className="h-4 w-4 text-white" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export default ThemeToggle;