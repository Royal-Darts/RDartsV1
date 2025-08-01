import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  Crown, BarChart3, Users, Trophy, TrendingUp, Menu, X, GitCompare, 
  Award, Bell, Settings, Search, ChevronDown, Home, Activity
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const navigation = [
    { 
      name: 'Players', 
      href: '/players', 
      icon: Users,
      description: 'Player statistics and rankings'
    },
    { 
      name: 'Teams', 
      href: '/teams', 
      icon: Trophy,
      description: 'Team performance analysis'
    },
    { 
      name: 'Tournaments', 
      href: '/tournaments', 
      icon: BarChart3,
      description: 'Tournament results and standings'
    },
    { 
      name: 'Compare', 
      href: '/compare', 
      icon: GitCompare,
      description: 'Player and team comparisons'
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: TrendingUp,
      description: 'Advanced performance analytics'
    },
    { 
      name: 'Hall of Fame', 
      href: '/hall-of-fame', 
      icon: Award,
      description: 'Championship history and legends'
    },
  ]

  const isActive = (href: string) => {
    return router.pathname.startsWith(href)
  }

  const getPageTitle = () => {
    const currentPage = navigation.find(item => isActive(item.href))
    return currentPage?.name || 'Royal Darts'
  }

  const getBreadcrumbs = () => {
    const pathArray = router.pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ name: 'Dashboard', href: '/players' }]
    
    pathArray.forEach((path, index) => {
      const href = '/' + pathArray.slice(0, index + 1).join('/')
      const navItem = navigation.find(item => item.href === href)
      if (navItem) {
        breadcrumbs.push({ name: navItem.name, href })
      }
    })
    
    return breadcrumbs
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile sidebar overlay */}
      <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          {/* Mobile Navigation Content */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold text-gray-900">Royal Darts</span>
                <div className="text-xs text-gray-500">Analytics Platform</div>
              </div>
            </div>
            
            <nav className="mt-5 px-2 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  <div>
                    <div>{item.name}</div>
                    <div className={`text-xs ${isActive(item.href) ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl">
            {/* Logo Section */}
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-4">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Royal Darts
                </span>
                <div className="text-xs text-gray-500 font-medium">Elite Analytics Platform</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="px-6 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">156</div>
                    <div className="text-xs text-gray-600">Players</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">8</div>
                    <div className="text-xs text-gray-600">Tournaments</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-5 flex-1 px-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className={`text-xs ${isActive(item.href) ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </nav>

            {/* User Profile Section */}
            <div className="px-6 pt-4 border-t border-gray-200">
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-full flex items-center p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 border border-gray-200 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3 flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-700">Admin User</p>
                    <p className="text-xs text-gray-500">Full Access</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {profileDropdownOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Enhanced Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Page Title & Breadcrumbs */}
            <div className="flex-1 lg:ml-0 ml-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                {getBreadcrumbs().map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center">
                    {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                    <Link href={crumb.href} className="hover:text-blue-600 transition-colors">
                      {crumb.name}
                    </Link>
                  </div>
                ))}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Live Indicator */}
              <div className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700">Live</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">3</span>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Enhanced Footer */}
        <footer className="bg-white border-t border-gray-200 py-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Royal Darts Analytics Platform</p>
                  <p className="text-xs text-gray-500">Professional tournament management system</p>
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-600">
                  Built & Managed by{' '}
                  <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    SUCA ANALYTICS
                  </span>
                </p>
                <p className="text-xs text-gray-500">© 2025 All Rights Reserved</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
