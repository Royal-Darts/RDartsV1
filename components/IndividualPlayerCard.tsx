import { useState } from 'react'
import { Crown, Target, Trophy, TrendingUp, Award, Zap, Activity, BarChart3, Star, Calendar, X, Eye } from 'lucide-react'

interface IndividualPlayerCardProps {
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
      total_180s: number
      total_140_plus: number
      total_100_plus: number
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
  onClose: () => void
}

export default function IndividualPlayerCard({ player, onClose }: IndividualPlayerCardProps) {
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 p-8 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="absolute top-4 left-4">
              <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                player.position <= 3 ? 'bg-amber-500' : 'bg-white/20'
              }`}>
                Rank #{player.position}
              </div>
            </div>
            
            <div className="flex items-center space-x-6 mt-8">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold">
                  {player.name.charAt(0)}
                </div>
                {player.achievements.length > 0 && (
                  <div className="absolute -top-2 -right-2">
                    <Crown className="h-8 w-8 text-amber-300" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{player.name}</h1>
                <p className="text-blue-100 text-lg mb-4">{player.team}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-4xl font-bold">{player.stats.threeDartAvg.toFixed(2)}</span>
                    <div className="text-sm">
                      <div>3-Dart</div>
                      <div>Average</div>
                    </div>
                  </div>
                  {getTrendIcon(player.trends.performance)}
                  <span className="text-lg">({player.trends.value > 0 ? '+' : ''}{player.trends.value.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'performance', label: 'Detailed Stats', icon: Target },
                { id: 'achievements', label: 'Achievements & Form', icon: Trophy },
                { id: 'tournaments', label: 'Tournament History', icon: Calendar },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
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
          <div className="p-8 max-h-96 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{player.stats.matchesPlayed}</div>
                    <div className="text-sm text-blue-700">Matches Played</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                    <div className="text-3xl font-bold text-emerald-600 mb-1">{player.stats.winRateSets.toFixed(1)}%</div>
                    <div className="text-sm text-emerald-700">Set Win Rate</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{player.stats.highFinish}</div>
                    <div className="text-sm text-purple-700">High Finish</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                    <div className="text-3xl font-bold text-amber-600 mb-1">{player.stats.total_180s}</div>
                    <div className="text-sm text-amber-700">Maximum 180s</div>
                  </div>
                </div>

                {/* Performance Breakdown */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-slate-700">3-Dart Average</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          getPerformanceColor(player.stats.threeDartAvg, { good: 45, average: 35 })
                        }`}>
                          {player.stats.threeDartAvg.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-slate-700">First 9 Average</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          getPerformanceColor(player.stats.firstNineAvg, { good: 55, average: 45 })
                        }`}>
                          {player.stats.firstNineAvg.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-slate-700">Leg Win Rate</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                          {player.stats.winRateLegs.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-slate-700">Tournaments</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                          {player.stats.tournaments}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-slate-700">Total Darts</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
                          {player.stats.totalDarts.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-slate-700">Score per Dart</span>
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">
                          {(player.stats.totalScore / player.stats.totalDarts).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Form */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Form</h3>
                  <div className="flex space-x-3">
                    {player.recentForm.map((result, index) => (
                      <div
                        key={index}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg ${
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
              <div className="space-y-8">
                {/* Detailed Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Scoring Excellence</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                        <span className="font-medium text-red-900">Maximum 180s</span>
                        <span className="text-2xl font-bold text-red-700">{player.stats.total_180s}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                        <span className="font-medium text-purple-900">140+ Scores</span>
                        <span className="text-2xl font-bold text-purple-700">{player.stats.total_140_plus}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <span className="font-medium text-blue-900">100+ Scores</span>
                        <span className="text-2xl font-bold text-blue-700">{player.stats.total_100_plus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Match Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
                        <span className="font-medium text-emerald-900">Sets Played</span>
                        <span className="text-2xl font-bold text-emerald-700">{player.stats.setsPlayed}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg">
                        <span className="font-medium text-amber-900">Legs Played</span>
                        <span className="text-2xl font-bold text-amber-700">{player.stats.legsPlayed}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
                        <span className="font-medium text-slate-900">Best/Worst Leg</span>
                        <span className="text-xl font-bold text-slate-700">{player.stats.bestLeg}/{player.stats.worstLeg}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Elite Performance Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {((player.stats.total_180s / player.stats.matchesPlayed) || 0).toFixed(1)}
                      </div>
                      <div className="text-sm text-slate-600">180s per Match</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-emerald-600 mb-1">
                        {((player.stats.total_100_plus / player.stats.legsPlayed) || 0).toFixed(1)}
                      </div>
                      <div className="text-sm text-slate-600">100+ per Leg</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {(player.stats.totalScore / player.stats.totalDarts || 0).toFixed(1)}
                      </div>
                      <div className="text-sm text-slate-600">Points per Dart</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Achievements & Recognition</h3>
                  {player.achievements.length > 0 ? (
                    <div className="grid gap-3">
                      {player.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg">
                          <Award className="h-6 w-6 text-amber-600 flex-shrink-0" />
                          <span className="font-medium text-amber-800">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-lg">
                      <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No achievements recorded yet</p>
                      <p className="text-sm text-slate-400">Keep playing to earn achievements!</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Match Form</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {player.recentForm.map((result, index) => (
                      <div key={index} className="text-center">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg mb-2 ${
                            result > 0.5 ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        >
                          {result > 0.5 ? 'W' : 'L'}
                        </div>
                        <div className="text-xs text-slate-500">Match {index + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tournaments' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900">Tournament History</h3>
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{player.stats.tournaments}</div>
                      <div className="text-sm text-slate-600">Total Tournaments</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-3xl font-bold text-emerald-600 mb-2">
                        {Math.round((player.stats.winRateSets / 100) * player.stats.tournaments)}
                      </div>
                      <div className="text-sm text-slate-600">Tournaments Won</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {Math.round(player.stats.matchesPlayed / player.stats.tournaments)}
                      </div>
                      <div className="text-sm text-slate-600">Avg Matches per Tournament</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-slate-500 py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>Detailed tournament history coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
