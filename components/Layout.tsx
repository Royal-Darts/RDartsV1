import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Target, BarChart3, Users, Trophy, TrendingUp, Swords, Award } from 'lucide-react'
import Image from 'next/image'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Players', href: '/players', icon: Users },
    { name: 'Teams', href: '/teams', icon: Target },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Compare', href: '/compare', icon: Swords },
    { name: 'Hall of Fame', href: '/hall-of-fame', icon: Award },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Image
                  src="https://i.postimg.cc/vZ6By1rw/temp-Image-ZZJWG4.avif"
                  alt="Royal Darts Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <span className="ml-3 text-xl font-bold text-gray-900">
                  Royal Darts
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        router.pathname === item.href
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-300">
              Powered by <span className="font-semibold text-primary-400">SUCA ANALYTICS</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              © 2025 Royal Darts. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
