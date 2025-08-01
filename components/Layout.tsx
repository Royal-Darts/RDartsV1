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
  Home,
  Crown,
  Settings
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
    { name: 'Hall of Fame', href: '/hall-of-fame', icon: Award },
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const currentTarget = e.currentTarget as HTMLImageElement
    const nextSibling = currentTarget.nextElementSibling
    
    currentTarget.style.display = 'none'
    
    if (nextSibling && nextSibling instanceof HTMLElement) {
      nextSibling.style.display = 'flex'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Desktop Sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'
      } z-50`}>
        <div className="flex flex-col flex-grow">
          <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto bg-white/80 backdrop-blur-xl border-r border-slate-200/50 shadow-xl">
            {/* Modern Logo */}
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <div className="flex items-center">
                <div className="relative">
                  <img 
                    src="https://i.postimg.cc/vZ6By1rw/temp-Image-ZZJWG4.avif" 
                    alt="Royal Darts Logo"
                    className="h-12 w-12 rounded-xl object-cover shadow-lg ring-2 ring-blue-500/20"
                    onError={handleImageError}
                  />
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-amber-500 rounded-xl hidden items-center justify-center shadow-lg">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                </div>
                {!sidebarCollapsed && (
                  <div className="ml-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
                      Royal Darts
                    </span>
                    <div className="text-xs text-slate-500 font-medium">Elite Analytics Platform</div>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="ml-auto p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Modern Navigation */}
            <nav className="flex-1 px-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = isActivePath(item.href)
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 transform scale-105'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700 hover:scale-105'
                    }`}
                  >
                    <Icon className={`${sidebarCollapsed ? 'h-6 w-6' : 'h-5 w-5'} mr-3 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'
                    }`} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Modern Bottom Section */}
            <div className="flex-shrink-0 px-4 pt-4 border-t border-slate-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">RD</span>
                  </div>
                </div>
                {!sidebarCollapsed && (
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-slate-700">Royal Darts</p>
                    <p className="text-xs text-slate-500">Analytics Platform</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
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
                className="h-8 w-8 rounded-lg object-cover shadow-lg"
                onError={handleImageError}
              />
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-amber-500 rounded-lg hidden items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <span className="ml-2 text-lg font-bold bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
                Royal Darts
              </span>
            </div>
          </div>

          {/* Mobile header actions */}
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 relative transition-all duration-200">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">3</span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-slate-600 bg-opacity-75 backdrop-blur-sm" aria-hidden="true" />
            
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white/95 backdrop-blur-xl shadow-2xl">
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
                    className="h-10 w-10 rounded-xl object-cover shadow-lg"
                    onError={handleImageError}
                  />
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-amber-500 rounded-xl hidden items-center justify-center">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
                      Royal Darts
                    </span>
                    <div className="text-xs text-slate-500">Elite Analytics Platform</div>
                  </div>
                </div>

                <nav className="px-4 space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = isActivePath(item.href)
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                        }`}
                      >
                        <Icon className={`h-6 w-6 mr-3 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'
                        }`} />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Mobile menu footer */}
              <div className="flex-shrink-0 flex border-t border-slate-200 p-4">
                <div className="flex items-center w-full">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">RD</span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-base font-medium text-slate-700">Royal Darts</p>
                    <p className="text-sm text-slate-500">Analytics Platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content area with proper spacing for sidebar */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
        
        {/* Modern Footer */}
        <footer className="bg-white/80 backdrop-blur-xl border-t border-slate-200/50 py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://i.postimg.cc/vZ6By1rw/temp-Image-ZZJWG4.avif" 
                alt="Royal Darts Logo"
                className="h-6 w-6 rounded object-cover"
                onError={handleImageError}
              />
              <div className="h-6 w-6 bg-gradient-to-r from-blue-500 to-amber-500 rounded hidden items-center justify-center">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-600">Royal Darts Analytics Platform</span>
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
