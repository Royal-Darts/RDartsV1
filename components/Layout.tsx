import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  Target, 
  BarChart3, 
  Users, 
  Trophy, 
  TrendingUp, 
  Menu, 
  X, 
  GitCompare,
  Award,
  Search,
  Bell,
  Home
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Players', href: '/players', icon: Users },
    { name: 'Teams', href: '/teams', icon: Target },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy },
    { name: 'Compare', href: '/compare', icon: GitCompare },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  ]

  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false)
    }

    router.events.on('routeChangeStart', handleRouteChange)
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [router])

  const isActivePath = (href: string) => {
    if (href === '/') {
      return router.pathname === '/'
    }
    return router.pathname.startsWith(href)
  }

  // Fixed image error handler with proper TypeScript types
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const currentTarget = e.currentTarget as HTMLImageElement
    const nextSibling = currentTarget.nextElementSibling
    
    // Hide current image
    currentTarget.style.display = 'none'
    
    // Show fallback element if it exists and is an HTMLElement
    if (nextSibling && nextSibling instanceof HTMLElement) {
      nextSibling.style.display = 'flex'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'
      }`}>
        <div className="flex flex-col w-full">
          <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto bg-white border-r border-gray-200 shadow-lg">
            {/* Royal Darts Logo */}
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <div className="flex items-center">
                <div className="relative">
                  <img 
                    src="https://i.postimg.cc/vZ6By1rw/temp-Image-ZZJWG4.avif" 
                    alt="Royal Darts Logo"
                    className="h-12 w-12 rounded-lg object-cover"
                    onError={handleImageError}
                  />
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hidden items-center justify-center">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
                {!sidebarCollapsed && (
                  <div className="ml-3">
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Royal Darts
                    </span>
                    <div className="text-xs text-gray-500">Performance Analytics</div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="ml-auto p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = isActivePath(item.href)
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-700'
                    }`}
                  >
                    <Icon className={`${sidebarCollapsed ? 'h-6 w-6' : 'h-5 w-5'} mr-3 transition-colors ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-purple-600'
                    }`} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Bottom section */}
            <div className="flex-shrink-0 px-4 pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">RD</span>
                  </div>
                </div>
                {!sidebarCollapsed && (
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Royal Darts</p>
                    <p className="text-xs text-gray-500">Analytics Admin</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
            <div className="ml-4 flex items-center">
              <img 
                src="https://i.postimg.cc/vZ6By1rw/temp-Image-ZZJWG4.avif" 
                alt="Royal Darts Logo"
                className="h-8 w-8 rounded-lg object-cover"
                onError={handleImageError}
              />
              <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg hidden items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="ml-2 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Royal Darts
              </span>
            </div>
          </div>

          {/* Mobile header actions */}
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">3</span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" />
            
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4 mb-8">
                  <img 
                    src="https://i.postimg.cc/vZ6By1rw/temp-Image-ZZJWG4.avif" 
                    alt="Royal Darts Logo"
                    className="h-10 w-10 rounded-lg object-cover"
                    onError={handleImageError}
                  />
                  <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg hidden items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Royal Darts
                    </span>
                    <div className="text-xs text-gray-500">Performance Analytics</div>
                  </div>
                </div>

                <nav className="px-4 space-y-3">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = isActivePath(item.href)
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-700'
                        }`}
                      >
                        <Icon className={`h-6 w-6 mr-3 transition-colors ${
                          isActive ? 'text-white' : 'text-gray-500 group-hover:text-purple-600'
                        }`} />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Mobile menu footer */}
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center w-full">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">RD</span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-base font-medium text-gray-700">Royal Darts</p>
                    <p className="text-sm text-gray-500">Analytics Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden lg:ml-0">
        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://i.postimg.cc/vZ6By1rw/temp-Image-ZZJWG4.avif" 
                alt="Royal Darts Logo"
                className="h-6 w-6 rounded object-cover"
                onError={handleImageError}
              />
              <div className="h-6 w-6 bg-gradient-to-r from-purple-500 to-blue-600 rounded hidden items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600">Royal Darts Analytics Platform</span>
            </div>
            <div className="text-sm text-gray-500">
              Built & Managed by <span className="font-semibold text-purple-600">SUCA ANALYTICS</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
