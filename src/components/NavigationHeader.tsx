import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Upload, List, BarChart3, Settings } from "lucide-react"

interface NavigationHeaderProps {
  title?: string
  showBack?: boolean
  showHome?: boolean
  showUpload?: boolean
  showLists?: boolean
  showStats?: boolean
  showSettings?: boolean
}

export default function NavigationHeader({
  title,
  showBack = false,
  showHome = true,
  showUpload = true,
  showLists = true,
  showStats = true,
  showSettings = true
}: NavigationHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {showBack && (
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        {title && (
          <h1 className="text-3xl font-bold text-gta-blue">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showHome && (
          <Button
            variant={isActive("/dashboard") || isActive("/") ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        )}
        {showLists && (
          <Button
            variant={isActive("/active-lists") ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/active-lists")}
          >
            <List className="w-4 h-4 mr-2" />
            Lists
          </Button>
        )}
        {showUpload && (
          <Button
            variant={isActive("/upload") ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/upload")}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        )}
        {showStats && (
          <Button
            variant={isActive("/mission-briefing") ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/mission-briefing")}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Stats
          </Button>
        )}
        {showSettings && (
          <Button
            variant={isActive("/settings") ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        )}
      </div>
    </div>
  )
}
