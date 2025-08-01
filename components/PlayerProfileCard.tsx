import { useState } from 'react'
import { Crown, Target, Trophy, TrendingUp, Award, Zap, Activity, BarChart3, Star, Calendar } from 'lucide-react'

interface PlayerProfileCardProps {
  player: {
    id: number
    name: string
    team: string
    position: number
    stats: {
      threeDartAvg: number
      firstNineAvg: number
      winRateSets: number
      winRateLegs: number
      highFinish: number
      total180s: number
      total140Plus: number
      total100Plus: number
      matchesPlayed: number
      setsPlayed: number
      legsPlayed: number
      tournaments: number
      totalScore: number
      totalDarts: number
      bestLeg: number
      worstLeg: number
    }
    trends: {
      performance: 'up' | 'down' | 'stable'
      value: number
    }
    achievements: string[]
    recentForm: number[]
  }
  variant?: 'default' | 'compact' | 'detailed'
}

export default function PlayerProfileCard({ player, variant = 'default' }: PlayerProfileCardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-emerald-500" />
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      default: return <Activity className="h-4 w-4 text-slate-400" />
    }
  }

  const getPerformanceColor = (value: number, threshold: { good: number, average: number }) => {
    if (value >= threshold.good) return 'text-emerald-600 bg-emerald-100'
    if (value >= threshold.average) return 'text-blue-600 bg-blue-100'
    return 'text-slate-600 bg-slate-100'
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {player.name.charAt(0)}
            </div>
            <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              player.position <= 3 ? 'bg-amber-500' : 'bg-blue-500'
            }`}>
              {player.position}
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-slate-900">{player.name}</h3>
            <p className="text-sm text-slate-500">{player.team}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-lg font-bold text-blue-600">{player.stats.threeDartAvg.toFixed(2)}</span>
              {getTrendIcon(player.trends.performance)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            player.position <= 3 ? 'bg-amber-500' : 'bg-white/20'
          }`}>
            #{player.position}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold">
              {player.name.charAt(0)}
            </div>
            {player.achievements.length > 0 && (
              <div className="absolute -top-2 -right-2">
                <Crown className="h-6 w-6 text-amber-300" />
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold">{player.name}</h2>
            <p className="text-blue-100">{player.team}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-3xl font-bold">{player.stats.threeDartAvg.toFixed(2)}</span>
              {getTrendIcon(player.trends.performance)}
              <span className="text-sm">({player.trends.value > 0 ? '+' : ''}{player.trends.value}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'performance', label: 'Performance', icon: Target },
            { id: 'achievements', label: 'Achievements', icon: Trophy },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{player.stats.matchesPlayed}</div>
                <div className="text-xs text-slate-500">Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{player.stats.winRateSets.toFixed(1)}%</div>
                <div className="text-xs text-slate-500">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{player.stats.highFinish}</div>
                <div className="text-xs text-slate-500">High Finish</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{player.stats.total180s}</div>
                <div className="text-xs text-slate-500">180s</div>
              </div>
            </div>

            {/* Performance Radar */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Performance Overview</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">3-Dart Average</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getPerformanceColor(player.stats.threeDartAvg, { good: 45, average: 35 })
                    }`}>
                      {player.stats.threeDartAvg.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">First 9 Average</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getPerformanceColor(player.stats.firstNineAvg, { good: 55, average: 45 })
                    }`}>
                      {player.stats.firstNineAvg.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Tournaments</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                      {player.stats.tournaments}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Scoring Rate</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                      {((player.stats.totalScore / player.stats.totalDarts)).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Form */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Recent Form</h4>
              <div className="flex space-x-2">
                {player.recentForm.map((result, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      result > 0.5 ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  >
                    {result > 0.5 ? 'W' : 'L'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Scoring Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">100+ Scores</span>
                    <span className="text-lg font-bold text-blue-600">{player.stats.total100Plus}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">140+ Scores</span>
                    <span className="text-lg font-bold text-purple-600">{player.stats.total140Plus}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">Maximum 180s</span>
                    <span className="text-lg font-bold text-red-600">{player.stats.total180s}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Match Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">Sets Win Rate</span>
                    <span className="text-lg font-bold text-emerald-600">{player.stats.winRateSets.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">Legs Win Rate</span>
                    <span className="text-lg font-bold text-blue-600">{player.stats.winRateLegs.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">Best/Worst Leg</span>
                    <span className="text-sm font-bold text-slate-700">{player.stats.bestLeg}/{player.stats.worstLeg}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            {player.achievements.length > 0 ? (
              <div className="grid gap-3">
                {player.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <Award className="h-5 w-5 text-amber-600" />
                    <span className="font-medium text-amber-800">{achievement}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No achievements yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
