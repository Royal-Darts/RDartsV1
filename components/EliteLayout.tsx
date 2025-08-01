import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  Crown, BarChart3, Users, Trophy, TrendingUp, Menu, X, GitCompare,
  Award, Search, Bell, Home, Settings, Zap, Target, Brain, Sparkles,
  ChevronRight, Activity, Layers, Shield, Star
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function EliteLayout({ children }: LayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeModule, setActiveModule] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const navigationModules = [
    {
      title: 'Analytics Hub',
      items: [
        { name: 'Elite Dashboard', href: '/', icon: Crown, premium: true },
        { name: 'Live Analytics', href: '/live-analytics', icon: Activity, new: true },
        { name: 'AI Insights', href: '/ai-insights', icon: Brain, premium: true },
      ]
    },
    {
      title: 'Performance Center',
      items: [
        { name: 'Players', href: '/players', icon: Users },
        { name: 'Teams', href: '/teams', icon: Target },
        { name: 'Tournaments', href: '/tournaments', icon: Trophy },
        { name: 'Compare Pro', href: '/compare', icon: GitCompare, premium: true },
      ]
    },
    {
      title: 'Elite Features',
      items: [
        { name: 'Hall of Fame', href: '/hall-of-fame', icon: Award },
        { name: 'Predictions', href: '/predictions', icon: Sparkles, new: true },
        { name: 'Performance Coach', href: '/coach', icon: Brain, premium: true },
        { name: 'Statistics Lab', href: '/stats-lab', icon: Layers, premium: true },
      ]
    }
  ]

  const isActivePath = (href: string) => {
    if (href === '/') return router.pathname === '/'
    return router.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
      <div className="fixed inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-amber-500/10 animate-pulse"></div>

      {/* Elite Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-500 ease-in-out ${
        sidebarOpen ? 'w-80' : 'w-20'
      }`}>
        <div className="flex h-full flex-col bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-2xl border-r border-white/10">
          
          {/* Royal Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className={`flex items-center transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              {sidebarOpen && (
                <div className="ml-4">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                    Royal Darts
                  </h1>
                  <p className="text-xs text-slate-400">Elite Analytics Platform</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Elite Search */}
          {sidebarOpen && (
            <div className="p-4">
              <div className={`relative transition-all duration-300 ${
                searchFocused ? 'transform scale-105' : ''
              }`}>
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search everything..."
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:bg-white/20 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* Navigation Modules */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {navigationModules.map((module) => (
              <div key={module.title}>
                {sidebarOpen && (
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    {module.title}
                  </h3>
                )}
                
                <div className="space-y-1">
                  {module.items.map((item) => {
                    const Icon = item.icon
                    const isActive = isActivePath(item.href)
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-500/20 to-amber-400/20 border border-amber-400/30 text-amber-400 shadow-lg'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className={`p-2 rounded-lg transition-all duration-300 ${
                          isActive 
                            ? 'bg-amber-400/20' 
                            : 'bg-white/10 group-hover:bg-white/20'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        {sidebarOpen && (
                          <div className="ml-3 flex-1 flex items-center justify-between">
                            <span className="font-medium">{item.name}</span>
                            <div className="flex items-center space-x-1">
                              {item.premium && (
                                <div className="px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full text-xs font-bold text-slate-900">
                                  PRO
                                </div>
                              )}
                              {item.new && (
                                <div className="px-2 py-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full text-xs font-bold text-white animate-pulse">
                                  NEW
                                </div>
                              )}
                              {!isActive && <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>
                          </div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Elite User Profile */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              
              {sidebarOpen && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Elite Admin</p>
                  <p className="text-xs text-slate-400">Full Access</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-500 ${sidebarOpen ? 'ml-80' : 'ml-20'}`}>
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <h2 className="text-lg font-semibold">Welcome back, Champion</h2>
                <p className="text-xs text-slate-400">Friday, August 01, 2025</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6 px-6 py-2 bg-white/10 rounded-xl border border-white/20">
                <div className="text-center">
                  <p className="text-xs text-slate-400">Live Matches</p>
                  <p className="text-sm font-bold text-emerald-400">12</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400">Elite Players</p>
                  <p className="text-sm font-bold text-amber-400">156</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400">Tournaments</p>
                  <p className="text-sm font-bold text-blue-400">8</p>
                </div>
              </div>
              
              {/* Notification Bell */}
              <button className="relative p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                <Bell className="h-5 w-5 text-white" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">3</span>
                </div>
              </button>
              
              {/* Settings */}
              <button className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                <Settings className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-5rem)]">
          {children}
        </main>

        {/* Elite Footer */}
        <footer className="bg-gradient-to-r from-slate-900 to-slate-800 border-t border-white/10 py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Royal Darts Elite Analytics Platform</p>
                  <p className="text-xs text-slate-400">Powered by Advanced AI & Machine Learning</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-slate-400">
                  Built & Managed by{' '}
                  <span className="font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                    SUCA ANALYTICS
                  </span>
                </p>
                <p className="text-xs text-slate-500">© 2025 All Rights Reserved</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
