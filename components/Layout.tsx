import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  Crown, BarChart3, Users, Trophy, TrendingUp, Menu, X, GitCompare,
  Award, Home, Target, Settings, Search, Bell, Filter
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Players', href: '/players', icon: Users },
    { name: 'Teams', href: '/teams', icon: Target },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy },
    { name: 'Compare', href: '/compare', icon: GitCompare },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Hall of Fame', href: '/hall-of-fame', icon: Award },
  ]

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/'
    return router.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Minimalistic Sidebar */}
      <div className={`hidden lg:flex lg:flex-shrink-0 w-64`}>
        <div className="flex flex-col w-full bg-white border-r border-gray-100 shadow-sm">
          {/* Clean Brand Header */}
          <div className="flex items-center px-6 py-6 border-b border-gray-100">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <span className="text-lg font-semibold text-gray-900">Royal Darts</span>
              <div className="text-xs text-gray-500">Elite Platform</div>
            </div>
          </div>

          {/* Clean Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActiveItem = isActive(item.href)
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActiveItem
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 -ml-4 pl-7'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Clean Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center">
              Built by <span className="font-medium text-blue-600">SUCA Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button onClick={() => setSidebarOpen(false)} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full">
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <span className="text-lg font-semibold text-gray-900">Royal Darts</span>
              </div>
            </div>
            
            <nav className="px-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActiveItem = isActive(item.href)
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                      isActiveItem ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Clean Top Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-gray-900">Royal Darts Analytics</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">3</span>
                </div>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
