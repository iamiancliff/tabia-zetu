import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "../context/ThemeContext"

export const ThemeToggle = () => {
  const { theme, toggleTheme, setThemeMode, systemTheme } = useTheme()

  const currentTheme = theme === "system" ? systemTheme : theme

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="w-9 h-9 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105"
        title={`Current theme: ${currentTheme === "dark" ? "Dark" : "Light"}`}
      >
        {currentTheme === "light" ? (
          <Moon className="h-4 w-4 text-white" />
        ) : (
          <Sun className="h-4 w-4 text-white" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
      
      {/* Theme Options Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2 space-y-1">
          <button
            onClick={() => setThemeMode("light")}
            className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
              currentTheme === "light" 
                ? "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Sun className="w-4 h-4 mr-2" />
            Light
          </button>
          <button
            onClick={() => setThemeMode("dark")}
            className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
              currentTheme === "dark" 
                ? "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Moon className="w-4 h-4 mr-2" />
            Dark
          </button>
          <button
            onClick={() => setThemeMode("system")}
            className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
              theme === "system" 
                ? "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Monitor className="w-4 h-4 mr-2" />
            System
          </button>
        </div>
      </div>
    </div>
  )
}

export default ThemeToggle;