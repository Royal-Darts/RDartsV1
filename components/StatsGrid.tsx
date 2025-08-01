import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: ReactNode
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
}

interface StatsGridProps {
  stats: StatCardProps[]
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const getColorClasses = (color: string = 'blue') => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 text-blue-600',
      green: 'from-green-500 to-green-600 text-green-600',
      purple: 'from-purple-500 to-purple-600 text-purple-600',
      yellow: 'from-yellow-500 to-yellow-600 text-yellow-600',
      red: 'from-red-500 to-red-600 text-red-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getTrendIcon = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const colorClasses = getColorClasses(stat.color)
        
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
                
                {stat.change !== undefined && (
                  <div className="flex items-center mt-2">
                    {getTrendIcon(stat.changeType)}
                    <span className={`ml-1 text-sm font-medium ${getTrendColor(stat.changeType)}`}>
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </span>
                    <span className="text-xs text-gray-500 ml-1">vs last period</span>
                  </div>
                )}
              </div>
              
              {stat.icon && (
                <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]}`}>
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
