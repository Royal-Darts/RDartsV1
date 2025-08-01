import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  Crown, BarChart3, Users, Trophy, TrendingUp, Menu, X, GitCompare,
  Award, Home, Target, Brain, Zap, Settings, Search, Bell, Calendar,
  Activity, PieChart, LineChart
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigationSections = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', href: '/', icon: Home, badge: null },
        { name: 'Live Analytics', href: '/live-analytics', icon: Activity, badge: 'New' },
      ]
    },
    {
      title: 'Performance',
      items: [
        { name: 'Players', href: '/players', icon: Users, badge: null },
        { name: 'Teams', href: '/teams', icon: Target, badge: null },
        { name: 'Tournaments', href: '/tournaments', icon: Trophy, badge: null },
        { name: 'Compare Pro', href: '/compare', icon: GitCompare, badge: null },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { name: 'Advanced Analytics', href: '/analytics', icon: TrendingUp, badge: null },
        { name: 'Statistics Lab', href: '/stats-lab', icon: PieChart, badge: 'Pro' },
        { name: 'Performance Insights', href: '/insights', icon: Brain, badge: 'AI' },
        { name: 'Trends & Patterns', href: '/trends', icon: LineChart, badge: null },
      ]
    },
    {
      title: 'Elite',
      items: [
        { name: 'Hall of Fame', href: '/hall-of-fame', icon: Award, badge: null },
        { name: 'Elite Rankings', href: '/rankings', icon: Crown, badge: null },
        { name: 'Tournament Calendar', href: '/calendar', icon: Calendar, badge: null },
      ]
    }
  ]

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/'
    return router.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Enhanced Sidebar */}
      <div className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 w-72`}>
        <div className="flex flex-col w-full">
          <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto bg-white/80 backdrop-blur-xl border-r border-slate-200/50 shadow-xl">
            {/* Royal Darts Brand */}
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-4">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
                  Royal Darts
                </span>
                <div className="text-xs text-slate-500 font-medium">Elite Analytics Platform</div>
              </div>
            </div>

            {/* Enhanced Search */}
            <div className="px-6 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search players, teams, stats..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 px-4 space-y-6">
              {navigationSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActiveItem = isActive(item.href)
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-300 ${
                            isActiveItem
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 transform scale-105'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700 hover:scale-105'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-all duration-300 ${
                            isActiveItem 
                              ? 'bg-white/20' 
                              : 'bg-slate-100 group-hover:bg-blue-100'
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          <div className="ml-3 flex-1 flex items-center justify-between">
                            <span className="font-medium">{item.name}</span>
                            {item.badge && (
                              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                                item.badge === 'New' ? 'bg-emerald-100 text-emerald-800 animate-pulse' :
                                item.badge === 'Pro' ? 'bg-purple-100 text-purple-800' :
                                item.badge === 'AI' ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {item.badge}
                              </div>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* User Profile */}
            <div className="px-6 pt-4 border-t border-slate-200">
              <div className="flex items-center p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-slate-700">Elite Admin</p>
                  <p className="text-xs text-slate-500">Full Access</p>
                </div>
                <Settings className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-slate-600 bg-opacity-75 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white/95 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button onClick={() => setSidebarOpen(false)} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full">
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          {/* Mobile content similar to desktop but condensed */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-amber-500 rounded-xl flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
                  Royal Darts
                </span>
                <div className="text-xs text-slate-500">Elite Platform</div>
              </div>
            </div>
            
            <nav className="px-4 space-y-6">
              {navigationSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">{section.title}</h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActiveItem = isActive(item.href)
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center px-3 py-2 rounded-lg ${
                            isActiveItem ? 'bg-blue-100 text-blue-900' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          <span className="font-medium">{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold text-slate-900">Welcome back, Champion</h2>
              <p className="text-xs text-slate-500">Friday, August 01, 2025</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 px-4 py-2 bg-slate-100 rounded-xl">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Active Players</p>
                  <p className="text-sm font-bold text-blue-600">156</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Live Matches</p>
                  <p className="text-sm font-bold text-emerald-600">8</p>
                </div>
              </div>
              
              <button className="relative p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                <Bell className="h-5 w-5 text-slate-600" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">3</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Enhanced Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-amber-500 rounded flex items-center justify-center">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-600">Royal Darts Elite Analytics Platform</span>
            </div>
            <div className="text-sm text-slate-500">
              Built & Managed by <span className="font-semibold bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">SUCA ANALYTICS</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
