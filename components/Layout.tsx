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
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
  submenu?: NavigationItem[]
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Navigation items
  const navigation: NavigationItem[] = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: BarChart3,
      badge: 0
    },
    { 
      name: 'Players', 
      href: '/players', 
      icon: Users,
      submenu: [
        { name: 'All Players', href: '/players', icon: Users },
        { name: 'Top Performers', href: '/players/top', icon: Award },
        { name: 'Player Search', href: '/players/search', icon: Search }
      ]
    },
    { 
      name: 'Teams', 
      href: '/teams', 
      icon: Target,
      submenu: [
        { name: 'All Teams', href: '/teams', icon: Target },
        { name: 'Team Comparison', href: '/teams/compare', icon: GitCompare }
      ]
    },
    { 
      name: 'Tournaments', 
      href: '/tournaments', 
      icon: Trophy,
      badge: 5
    },
    { 
      name: 'Compare', 
      href: '/compare', 
      icon: GitCompare 
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: TrendingUp,
      submenu: [
        { name: 'Performance Trends', href: '/trends', icon: TrendingUp },
        { name: 'Statistical Analysis', href: '/analytics/stats', icon: BarChart3 },
        { name: 'Leaderboards', href: '/leaderboards', icon: Award }
      ]
    }
  ]

  // Close mobile menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false)
      setUserMenuOpen(false)
    }

    router.events.on('routeChangeStart', handleRouteChange)
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [router])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false)
      }
      if (!target.closest('.user-menu') && !target.closest('.user-menu-button')) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActivePath = (href: string) => {
    if (href === '/') {
      return router.pathname === '/'
    }
    return router.pathname.startsWith(href)
  }

  const NavItem = ({ item, isMobile = false }: { item: NavigationItem; isMobile?: boolean }) => {
    const [submenuOpen, setSubmenuOpen] = useState(false)
    const Icon = item.icon
    const isActive = isActivePath(item.href)
    const hasSubmenu = item.submenu && item.submenu.length > 0

    const baseClasses = isMobile
      ? `group flex items-center px-3 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-primary-100 text-primary-700 shadow-sm'
            : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
        }`
      : `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-primary-100 text-primary-700 shadow-sm'
            : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
        }`

    if (!hasSubmenu) {
      return (
        <Link href={item.href} className={baseClasses}>
          <Icon className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'} mr-3 transition-colors`} />
          <span className="flex-1">{item.name}</span>
          {item.badge && item.badge > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-500 text-white">
              {item.badge}
            </span>
          )}
        </Link>
      )
    }

    return (
      <div className="space-y-1">
        <button
          onClick={() => setSubmenuOpen(!submenuOpen)}
          className={baseClasses + ' w-full justify-between'}
        >
          <div className="flex items-center">
            <Icon className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'} mr-3 transition-colors`} />
            <span>{item.name}</span>
          </div>
          <ChevronDown 
            className={`h-4 w-4 transition-transform ${submenuOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {submenuOpen && (
          <div className={`space-y-1 ${isMobile ? 'ml-4' : 'ml-2'}`}>
            {item.submenu?.map((subItem) => {
              const SubIcon = subItem.icon
              const isSubActive = isActivePath(subItem.href)
              
              return (
                <Link
                  key={subItem.name}
                  href={subItem.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isSubActive
                      ? 'bg-primary-50 text-primary-600 border-l-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                  }`}
                >
                  <SubIcon className="h-4 w-4 mr-3" />
                  {subItem.name}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'
      }`}>
        <div className="flex flex-col w-full">
          <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto bg-white border-r border-gray-200 shadow-sm">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-primary-600" />
                {!sidebarCollapsed && (
                  <span className="ml-3 text-xl font-bold text-gray-900">
                    Darts Analytics
                  </span>
                )}
              </div>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="ml-auto p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>

            {/* Bottom section */}
            <div className="flex-shrink-0 px-4 pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">DA</span>
                  </div>
                </div>
                {!sidebarCollapsed && (
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Darts Admin</p>
                    <p className="text-xs text-gray-500">Administrator</p>
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
              className="mobile-menu-button p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
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
              <Target className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Darts Analytics
              </span>
            </div>
          </div>

          {/* Mobile header actions */}
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative">
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
            
            <div className="mobile-menu relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
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
                <nav className="px-4 space-y-3">
                  {navigation.map((item) => (
                    <NavItem key={item.name} item={item} isMobile />
                  ))}
                </nav>
              </div>

              {/* Mobile menu footer */}
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center w-full">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">DA</span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-base font-medium text-gray-700">Darts Admin</p>
                    <p className="text-sm text-gray-500">Administrator</p>
                  </div>
                  <button className="ml-3 p-2 rounded-md text-gray-400 hover:text-gray-600">
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Desktop header */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:px-6 lg:py-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex-1">
            {/* Breadcrumb or page title can go here */}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search players, teams..."
                className="block w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">3</span>
              </span>
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                className="user-menu-button flex items-center p-1 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">DA</span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
              </button>

              {userMenuOpen && (
                <div className="user-menu origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Darts Admin</p>
                    <p className="text-xs text-gray-500">admin@darts-analytics.com</p>
                  </div>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </a>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
