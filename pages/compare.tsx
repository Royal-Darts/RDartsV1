import { useEffect, useState } from 'react'
import { getPlayers, getPlayerStats } from '@/lib/queries'
import { Player, PlayerStat } from '@/lib/supabase'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Swords, Plus, X, Crown, Medal, Trophy, Star, ChevronDown, Filter } from 'lucide-react'

const PLAYER_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
const PLAYER_GRADIENTS = [
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600', 
  'from-yellow-500 to-yellow-600',
  'from-red-500 to-red-600',
  'from-purple-500 to-purple-600'
]

type ViewMode = 'overview' | 'detailed' | 'performance'

interface PlayerStatData {
  name: string
  tournaments: number
  totalMatches: number
  avgThreeDart: number
  avgOneDart: number
  avgFirst9: number
  avgWinRateSets: number
  avgWinRateLegs: number
  avgKeepRate: number
  avgBreakRate: number
  highFinish: number
  total180s: number
  total100Plus: number
  totalScore: number
  totalDarts: number
  performanceHistory: Array<{
    tournament: string
    threeDartAvg: number
    winRate: number
    first9Avg: number
  }>
}

interface PerformanceDataPoint {
  tournament: string
  [key: string]: string | number | null // This allows dynamic keys like 'PlayerName_avg'
}

interface ComparisonMetric {
  key: keyof PlayerStatData
  label: string
  format: (v: number) => string
}

export default function Compare() {
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([0, 0, 0, 0, 0])
  const [playerStats, setPlayerStats] = useState<PlayerStatData[]>([])
  const [comparisonData, setComparisonData] = useState<any[]>([])
  const [performanceOverTime, setPerformanceOverTime] = useState<PerformanceDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [activeComparisons, setActiveComparisons] = useState<number>(2)
  const [isUpdating, setIsUpdating] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('overview')

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const playersData = await getPlayers()
        setPlayers(playersData)
      } catch (error) {
        console.error('Error fetching players:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  const fetchPlayerStats = async (playerId: number): Promise<PlayerStatData | null> => {
    if (playerId === 0) return null

    try {
      const statsData = await getPlayerStats({ playerId })
      
      if (statsData.length === 0) return null

      const totalMatches = statsData.reduce((sum, stat) => sum + (stat.match_played || 0), 0)
      const totalScore = statsData.reduce((sum, stat) => sum + (stat.total_score || 0), 0)
      const totalDarts = statsData.reduce((sum, stat) => sum + (stat.total_darts || 0), 0)
      
      const avgThreeDart = totalDarts > 0 ? (totalScore / totalDarts) * 3 : 0
      const avgOneDart = statsData.reduce((sum, stat) => sum + (stat.one_dart_avg || 0), 0) / statsData.length
      const avgFirst9 = statsData.reduce((sum, stat) => sum + (stat.first_9_avg || 0), 0) / statsData.length
      const avgWinRateSets = statsData.reduce((sum, stat) => sum + (stat.win_rate_sets || 0), 0) / statsData.length
      const avgWinRateLegs = statsData.reduce((sum, stat) => sum + (stat.win_rate_legs || 0), 0) / statsData.length
      const avgKeepRate = statsData.reduce((sum, stat) => sum + (stat.keep_rate || 0), 0) / statsData.length
      const avgBreakRate = statsData.reduce((sum, stat) => sum + (stat.break_rate || 0), 0) / statsData.length
      
      const highFinish = Math.max(...statsData.map(stat => stat.high_finish || 0))
      const total180s = statsData.reduce((sum, stat) => sum + (stat.scores_180 || 0), 0)
      const total100Plus = statsData.reduce((sum, stat) => sum + (stat.scores_100_plus || 0), 0)

      return {
        name: statsData[0].players?.player_name || 'Unknown',
        tournaments: statsData.length,
        totalMatches,
        avgThreeDart: Math.round(avgThreeDart * 100) / 100,
        avgOneDart: Math.round(avgOneDart * 100) / 100,
        avgFirst9: Math.round(avgFirst9 * 100) / 100,
        avgWinRateSets: Math.round(avgWinRateSets * 1000) / 10,
        avgWinRateLegs: Math.round(avgWinRateLegs * 1000) / 10,
        avgKeepRate: Math.round(avgKeepRate * 1000) / 10,
        avgBreakRate: Math.round(avgBreakRate * 1000) / 10,
        highFinish,
        total180s,
        total100Plus,
        totalScore,
        totalDarts,
        performanceHistory: statsData.map(stat => ({
          tournament: stat.tournaments?.tournament_name || 'Unknown',
          threeDartAvg: stat.three_dart_avg || 0,
          winRate: (stat.win_rate_sets || 0) * 100,
          first9Avg: stat.first_9_avg || 0
        }))
      }
    } catch (error) {
      console.error('Error fetching player stats:', error)
      return null
    }
  }

  const updateComparison = async () => {
    setIsUpdating(true)
    try {
      const activePlayerIds = selectedPlayers.slice(0, activeComparisons).filter(id => id !== 0)
      
      if (activePlayerIds.length < 2) {
        setPlayerStats([])
        setComparisonData([])
        setPerformanceOverTime([])
        return
      }

      const statsPromises = activePlayerIds.map(playerId => fetchPlayerStats(playerId))
      const stats = await Promise.all(statsPromises)
      const validStats = stats.filter(stat => stat !== null) as PlayerStatData[]

      setPlayerStats(validStats)

      if (validStats.length >= 2) {
        // Create radar chart data
        const maxThreeDart = Math.max(...validStats.map(s => s.avgThreeDart), 60)
        const maxFirst9 = Math.max(...validStats.map(s => s.avgFirst9), 60)
        const maxFinish = Math.max(...validStats.map(s => s.highFinish), 180)

        const radarMetrics = [
          {
            metric: '3-Dart Avg',
            ...Object.fromEntries(validStats.map(stat => [
              stat.name, 
              Math.round((stat.avgThreeDart / maxThreeDart) * 100)
            ]))
          },
          {
            metric: 'Set Win Rate',
            ...Object.fromEntries(validStats.map(stat => [stat.name, stat.avgWinRateSets]))
          },
          {
            metric: 'First 9 Avg',
            ...Object.fromEntries(validStats.map(stat => [
              stat.name,
              Math.round((stat.avgFirst9 / maxFirst9) * 100)
            ]))
          },
          {
            metric: 'High Finish',
            ...Object.fromEntries(validStats.map(stat => [
              stat.name,
              Math.round((stat.highFinish / maxFinish) * 100)
            ]))
          },
          {
            metric: 'Keep Rate',
            ...Object.fromEntries(validStats.map(stat => [stat.name, stat.avgKeepRate]))
          },
          {
            metric: 'Break Rate',
            ...Object.fromEntries(validStats.map(stat => [stat.name, stat.avgBreakRate]))
          }
        ]

        setComparisonData(radarMetrics)

        // Create performance over time data with proper typing
        const allTournaments = new Set<string>()
        validStats.forEach(stat => {
          stat.performanceHistory.forEach(perf => allTournaments.add(perf.tournament))
        })

        const performanceData: PerformanceDataPoint[] = Array.from(allTournaments).map(tournament => {
          const dataPoint: PerformanceDataPoint = { tournament }
          validStats.forEach(stat => {
            const perf = stat.performanceHistory.find(p => p.tournament === tournament)
            dataPoint[`${stat.name}_avg`] = perf?.threeDartAvg || null
            dataPoint[`${stat.name}_winRate`] = perf?.winRate || null
          })
          return dataPoint
        })

        setPerformanceOverTime(performanceData)
      }
    } catch (error) {
      console.error('Error updating comparison:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    if (selectedPlayers.some(id => id !== 0)) {
      updateComparison()
    }
  }, [selectedPlayers, activeComparisons])

  const addPlayer = () => {
    if (activeComparisons < 5) {
      setActiveComparisons(activeComparisons + 1)
    }
  }

  const removePlayer = (index: number) => {
    if (activeComparisons > 2) {
      const newSelected = [...selectedPlayers]
      newSelected[index] = 0
      setSelectedPlayers(newSelected)
      
      if (index === activeComparisons - 1) {
        setActiveComparisons(activeComparisons - 1)
      }
    }
  }

  const updateSelectedPlayer = (index: number, playerId: number) => {
    const newSelected = [...selectedPlayers]
    newSelected[index] = playerId
    setSelectedPlayers(newSelected)
  }

  const clearAllSelections = () => {
    setSelectedPlayers([0, 0, 0, 0, 0])
    setActiveComparisons(2)
    setPlayerStats([])
    setComparisonData([])
    setPerformanceOverTime([])
  }

  const getBestPerformer = (metric: keyof PlayerStatData): string | null => {
    if (playerStats.length === 0) return null
    const best = playerStats.reduce((prev, current) => {
      const prevValue = prev[metric] as number
      const currentValue = current[metric] as number
      return currentValue > prevValue ? current : prev
    })
    return best.name
  }

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode as ViewMode)
  }

  // Comprehensive comparison metrics with proper typing
  const comparisonMetrics: ComparisonMetric[] = [
    { key: 'tournaments', label: 'Tournaments Played', format: (val: number) => val.toString() },
    { key: 'totalMatches', label: 'Total Matches', format: (val: number) => val.toString() },
    { key: 'avgThreeDart', label: '3-Dart Average ✓', format: (val: number) => val.toFixed(2) },
    { key: 'avgOneDart', label: '1-Dart Average', format: (val: number) => val.toFixed(2) },
    { key: 'avgFirst9', label: 'First 9 Average', format: (val: number) => val.toFixed(2) },
    { key: 'avgWinRateSets', label: 'Set Win Rate (%)', format: (val: number) => `${val.toFixed(1)}%` },
    { key: 'avgWinRateLegs', label: 'Leg Win Rate (%)', format: (val: number) => `${val.toFixed(1)}%` },
    { key: 'avgKeepRate', label: 'Keep Rate (%)', format: (val: number) => `${val.toFixed(1)}%` },
    { key: 'avgBreakRate', label: 'Break Rate (%)', format: (val: number) => `${val.toFixed(1)}%` },
    { key: 'highFinish', label: 'High Finish', format: (val: number) => val.toString() },
    { key: 'total180s', label: 'Total 180s', format: (val: number) => val.toString() },
    { key: 'total100Plus', label: 'Total 100+ Scores', format: (val: number) => val.toString() },
    { key: 'totalScore', label: 'Total Score', format: (val: number) => val.toLocaleString() },
    { key: 'totalDarts', label: 'Total Darts', format: (val: number) => val.toLocaleString() }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl mb-8 text-white">
        <div className="flex justify-center items-center mb-6">
          <Swords className="h-16 w-16 mr-4" />
          <div>
            <h1 className="text-4xl font-bold">Player Battle Arena</h1>
            <p className="text-xl opacity-90 mt-2">Compare up to 5 players in epic statistical duels</p>
          </div>
        </div>
      </div>

      {/* Player Selection Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Champions</h2>
          <div className="flex space-x-2">
            {activeComparisons < 5 && (
              <button
                onClick={addPlayer}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Fighter
              </button>
            )}
            <button
              onClick={clearAllSelections}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 mr-2" />
              Reset Arena
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {Array.from({ length: activeComparisons }, (_, index) => {
            const selectedPlayer = players.find(p => p.player_id === selectedPlayers[index])
            const playerStat = playerStats.find(p => p.name === selectedPlayer?.player_name)
            
            return (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
                  selectedPlayers[index] ? `border-${PLAYER_COLORS[index]} bg-gradient-to-br ${PLAYER_GRADIENTS[index]} text-white` : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          selectedPlayers[index] ? 'bg-white bg-opacity-20' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index >= 2 && (
                        <button
                          onClick={() => removePlayer(index)}
                          className="ml-2 p-1 rounded-full hover:bg-red-100 text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {selectedPlayers[index] && (
                      <Crown className="h-6 w-6 text-yellow-300" />
                    )}
                  </div>

                  <div className="relative">
                    <select
                      value={selectedPlayers[index]}
                      onChange={(e) => updateSelectedPlayer(index, parseInt(e.target.value))}
                      className={`w-full p-3 rounded-lg border-0 text-center font-medium ${
                        selectedPlayers[index] 
                          ? 'bg-white bg-opacity-20 text-white placeholder-white' 
                          : 'bg-gray-50 text-gray-900'
                      }`}
                    >
                      <option value={0}>Choose Fighter...</option>
                      {players.map(player => (
                        <option key={player.player_id} value={player.player_id} className="text-gray-900">
                          {player.player_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-6 w-6 pointer-events-none" />
                  </div>

                  {playerStat && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm opacity-80">3-Dart Avg</span>
                        <span className="font-bold">{playerStat.avgThreeDart}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm opacity-80">Win Rate</span>
                        <span className="font-bold">{playerStat.avgWinRateSets}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm opacity-80">High Finish</span>
                        <span className="font-bold">{playerStat.highFinish}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {playerStats.length >= 2 && (
        <>
          {/* View Mode Selector */}
          <div className="mb-8">
            <div className="flex bg-white rounded-xl p-1 shadow-lg">
              {[
                { key: 'overview', label: 'Battle Overview', icon: Trophy },
                { key: 'detailed', label: 'Detailed Stats', icon: Filter },
                { key: 'performance', label: 'Performance Timeline', icon: Star }
              ].map(mode => {
                const Icon = mode.icon
                return (
                  <button
                    key={mode.key}
                    onClick={() => handleViewModeChange(mode.key)}
                    className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all ${
                      viewMode === mode.key
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {mode.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Battle Overview */}
          {viewMode === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Radar Chart */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Battle Radar</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={comparisonData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={0} domain={[0, 100]} />
                      {playerStats.map((player, index) => (
                        <Radar
                          key={player.name}
                          name={player.name}
                          dataKey={player.name}
                          stroke={PLAYER_COLORS[index]}
                          fill={PLAYER_COLORS[index]}
                          fillOpacity={0.3}
                          strokeWidth={3}
                        />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Champion Cards */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">Champion Stats</h3>
                {[
                  { metric: 'avgThreeDart' as keyof PlayerStatData, label: '3-Dart Average', icon: '🎯' },
                  { metric: 'avgWinRateSets' as keyof PlayerStatData, label: 'Win Rate', icon: '🏆' },
                  { metric: 'highFinish' as keyof PlayerStatData, label: 'High Finish', icon: '🔥' },
                  { metric: 'total180s' as keyof PlayerStatData, label: 'Total 180s', icon: '⚡' }
                ].map(item => {
                  const bestPlayer = getBestPerformer(item.metric)
                  return (
                    <div key={item.metric} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{item.icon}</span>
                          <div>
                            <h4 className="font-bold text-gray-900">{item.label}</h4>
                            <p className="text-sm text-gray-600">Champion: {bestPlayer}</p>
                          </div>
                        </div>
                        <Crown className="h-8 w-8 text-yellow-500" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Detailed Comparison */}
          {viewMode === 'detailed' && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6">
                <h3 className="text-2xl font-bold text-white">Detailed Battle Statistics</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-gray-900 sticky left-0 bg-gray-50">
                        Statistic
                      </th>
                      {playerStats.map((player, index) => (
                        <th
                          key={player.name}
                          className="px-6 py-4 text-center font-bold"
                          style={{ color: PLAYER_COLORS[index] }}
                        >
                          {player.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {comparisonMetrics.map(metric => (
                      <tr key={metric.key} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white">
                          {metric.label}
                        </td>
                        {playerStats.map((player, index) => {
                          const value = player[metric.key] as number
                          const isBest = playerStats.reduce((prev, current) => {
                            const prevValue = prev[metric.key] as number
                            const currentValue = current[metric.key] as number
                            return currentValue > prevValue ? current : prev
                          }).name === player.name
                          
                          return (
                            <td
                              key={player.name}
                              className={`px-6 py-4 text-center font-semibold ${
                                isBest ? 'bg-yellow-50 text-yellow-800' : 'text-gray-900'
                              }`}
                            >
                              <div className="flex flex-col items-center">
                                <span>{metric.format(value)}</span>
                                {isBest && <Medal className="h-4 w-4 text-yellow-600 mt-1" />}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Performance Timeline */}
          {viewMode === 'performance' && performanceOverTime.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Performance Timeline</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tournament" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {playerStats.map((player, index) => (
                      <Line
                        key={`${player.name}_avg`}
                        type="monotone"
                        dataKey={`${player.name}_avg`}
                        stroke={PLAYER_COLORS[index]}
                        strokeWidth={3}
                        name={`${player.name} - 3-Dart Avg`}
                        connectNulls={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {playerStats.length < 2 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
          <div className="animate-bounce mb-6">
            <Swords className="h-20 w-20 text-gray-300 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready for Battle?</h3>
          <p className="text-xl text-gray-600 mb-2">
            Select at least 2 fighters to start the epic comparison
          </p>
          <p className="text-lg text-gray-500">
            Choose your champions and watch them compete! ⚔️
          </p>
        </div>
      )}
    </div>
  )
}
