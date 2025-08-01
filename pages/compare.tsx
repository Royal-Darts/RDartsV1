import { useEffect, useState } from 'react'
import { getPlayers, getPlayerStats } from '@/lib/queries'
import { Player, PlayerStat } from '@/lib/supabase'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'
import { Users, Plus, X, Trophy } from 'lucide-react'

const PLAYER_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

type ViewMode = 'overview' | 'detailed'

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
}

interface ComparisonMetric {
  key: keyof PlayerStatData
  label: string
  format: (v: number) => string
}

export default function Compare() {
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([0, 0, 0])
  const [playerStats, setPlayerStats] = useState<PlayerStatData[]>([])
  const [comparisonData, setComparisonData] = useState<any[]>([])
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
        totalDarts
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
    if (activeComparisons < 3) {
      setActiveComparisons(activeComparisons + 1)
    }
  }

  const removePlayer = (index: number) => {
    if (activeComparisons > 2) {
      const newSelected = [...selectedPlayers]
      newSelected[index] = 0
      setSelectedPlayers(newSelected)
      setActiveComparisons(activeComparisons - 1)
    }
  }

  const updateSelectedPlayer = (index: number, playerId: number) => {
    const newSelected = [...selectedPlayers]
    newSelected[index] = playerId
    setSelectedPlayers(newSelected)
  }

  const clearAllSelections = () => {
    setSelectedPlayers([0, 0, 0])
    setActiveComparisons(2)
    setPlayerStats([])
    setComparisonData([])
  }

  // Essential comparison metrics
  const comparisonMetrics: ComparisonMetric[] = [
    { key: 'tournaments', label: 'Tournaments', format: (val: number) => val.toString() },
    { key: 'totalMatches', label: 'Total Matches', format: (val: number) => val.toString() },
    { key: 'avgThreeDart', label: '3-Dart Average', format: (val: number) => val.toFixed(2) },
    { key: 'avgFirst9', label: 'First 9 Average', format: (val: number) => val.toFixed(2) },
    { key: 'avgWinRateSets', label: 'Set Win Rate (%)', format: (val: number) => `${val.toFixed(1)}%` },
    { key: 'avgWinRateLegs', label: 'Leg Win Rate (%)', format: (val: number) => `${val.toFixed(1)}%` },
    { key: 'highFinish', label: 'High Finish', format: (val: number) => val.toString() },
    { key: 'total180s', label: 'Total 180s', format: (val: number) => val.toString() },
    { key: 'total100Plus', label: 'Total 100+ Scores', format: (val: number) => val.toString() }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Simple Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Player Comparison</h1>
        <p className="mt-2 text-gray-600">Compare performance statistics between players</p>
      </div>

      {/* Player Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Select Players</h2>
          <div className="flex space-x-2">
            {activeComparisons < 3 && (
              <button
                onClick={addPlayer}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Player
              </button>
            )}
            <button
              onClick={clearAllSelections}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: activeComparisons }, (_, index) => (
            <div key={index} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player {index + 1}
                {index >= 2 && (
                  <button
                    onClick={() => removePlayer(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4 inline" />
                  </button>
                )}
              </label>
              <select
                value={selectedPlayers[index]}
                onChange={(e) => updateSelectedPlayer(index, parseInt(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value={0}>Select a player...</option>
                {players.map(player => (
                  <option key={player.player_id} value={player.player_id}>
                    {player.player_name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {playerStats.length >= 2 && (
        <>
          {/* View Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow p-1">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'overview'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Trophy className="h-4 w-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'detailed'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Detailed
              </button>
            </div>
          </div>

          {/* Overview Mode */}
          {viewMode === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Radar Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Performance Comparison</h3>
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
                          strokeWidth={2}
                        />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Comparison</h3>
                <div className="space-y-4">
                  {[
                    { key: 'avgThreeDart', label: '3-Dart Average', format: (v: number) => v.toFixed(2) },
                    { key: 'avgWinRateSets', label: 'Set Win Rate', format: (v: number) => `${v.toFixed(1)}%` },
                    { key: 'highFinish', label: 'High Finish', format: (v: number) => v.toString() },
                    { key: 'total180s', label: 'Total 180s', format: (v: number) => v.toString() }
                  ].map(metric => (
                    <div key={metric.key} className="border-b border-gray-200 pb-4">
                      <div className="text-sm font-medium text-gray-500 mb-2">{metric.label}</div>
                      <div className="flex justify-between">
                        {playerStats.map((player, index) => (
                          <div key={player.name} className="text-center">
                            <div className="text-sm text-gray-600">{player.name}</div>
                            <div 
                              className="text-lg font-semibold"
                              style={{ color: PLAYER_COLORS[index] }}
                            >
                              {metric.format(player[metric.key as keyof PlayerStatData] as number)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Mode */}
          {viewMode === 'detailed' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Detailed Comparison</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Statistic
                      </th>
                      {playerStats.map((player, index) => (
                        <th
                          key={player.name}
                          className="px-6 py-3 text-center text-xs font-medium uppercase"
                          style={{ color: PLAYER_COLORS[index] }}
                        >
                          {player.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {comparisonMetrics.map((metric) => (
                      <tr key={metric.key} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
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
                              className={`px-6 py-4 text-sm text-center font-medium ${
                                isBest ? 'bg-green-50 text-green-800' : 'text-gray-900'
                              }`}
                            >
                              {metric.format(value)}
                              {isBest && <span className="ml-1">👑</span>}
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
        </>
      )}

      {playerStats.length < 2 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select Players to Compare</h3>
          <p className="text-gray-600">
            Choose at least 2 players to start comparing their performance
          </p>
        </div>
      )}
    </div>
  )
}
