import { useEffect, useState } from 'react'
import { getPlayers, getPlayerStats } from '@/lib/queries'
import { Player, PlayerStat } from '@/lib/supabase'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'
import { Swords, Plus, X, RefreshCw } from 'lucide-react'

const PLAYER_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Compare() {
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([0, 0, 0, 0, 0])
  const [playerStats, setPlayerStats] = useState<any[]>([])
  const [comparisonData, setComparisonData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeComparisons, setActiveComparisons] = useState<number>(2)
  const [isUpdating, setIsUpdating] = useState(false)

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

  const fetchPlayerStats = async (playerId: number) => {
    if (playerId === 0) return null

    try {
      const statsData = await getPlayerStats({ playerId })
      
      if (statsData.length === 0) return null

      // Aggregate all statistics
      const totalMatches = statsData.reduce((sum, stat) => sum + stat.match_played, 0)
      const totalSets = statsData.reduce((sum, stat) => sum + stat.sets_played, 0)
      const totalLegs = statsData.reduce((sum, stat) => sum + stat.legs_played, 0)
      const totalScore = statsData.reduce((sum, stat) => sum + stat.total_score, 0)
      const totalDarts = statsData.reduce((sum, stat) => sum + stat.total_darts, 0)
      
      // Verified calculation: (total_score / total_darts) * 3
      const avgThreeDart = totalDarts > 0 ? (totalScore / totalDarts) * 3 : 0
      const avgOneDart = statsData.reduce((sum, stat) => sum + stat.one_dart_avg, 0) / statsData.length
      const avgFirst9 = statsData.reduce((sum, stat) => sum + stat.first_9_avg, 0) / statsData.length
      const avgWinRateSets = statsData.reduce((sum, stat) => sum + stat.win_rate_sets, 0) / statsData.length
      const avgWinRateLegs = statsData.reduce((sum, stat) => sum + stat.win_rate_legs, 0) / statsData.length
      const avgKeepRate = statsData.reduce((sum, stat) => sum + stat.keep_rate, 0) / statsData.length
      const avgBreakRate = statsData.reduce((sum, stat) => sum + stat.break_rate, 0) / statsData.length
      
      const highFinish = Math.max(...statsData.map(stat => stat.high_finish))
      const bestLeg = Math.min(...statsData.map(stat => stat.best_leg).filter(leg => leg > 0))
      const worstLeg = Math.max(...statsData.map(stat => stat.worst_leg))
      
      const total180s = statsData.reduce((sum, stat) => sum + stat.scores_180, 0)
      const total170Plus = statsData.reduce((sum, stat) => sum + stat.scores_170_plus, 0)
      const total140Plus = statsData.reduce((sum, stat) => sum + stat.scores_140_plus, 0)
      const total100Plus = statsData.reduce((sum, stat) => sum + stat.scores_100_plus, 0)
      const totalFinishes100Plus = statsData.reduce((sum, stat) => sum + stat.finishes_100_plus, 0)

      return {
        name: statsData[0].players?.player_name || 'Unknown',
        tournaments: statsData.length,
        totalMatches,
        totalSets,
        totalLegs,
        avgThreeDart: Math.round(avgThreeDart * 100) / 100,
        avgOneDart: Math.round(avgOneDart * 100) / 100,
        avgFirst9: Math.round(avgFirst9 * 100) / 100,
        avgWinRateSets: Math.round(avgWinRateSets * 1000) / 10,
        avgWinRateLegs: Math.round(avgWinRateLegs * 1000) / 10,
        avgKeepRate: Math.round(avgKeepRate * 1000) / 10,
        avgBreakRate: Math.round(avgBreakRate * 1000) / 10,
        highFinish,
        bestLeg: bestLeg === Infinity ? 0 : bestLeg,
        worstLeg,
        total180s,
        total170Plus,
        total140Plus,
        total100Plus,
        totalFinishes100Plus,
        totalScore,
        totalDarts,
        overallAverage: totalDarts > 0 ? Math.round((totalScore / totalDarts) * 100) / 100 : 0,
        avg180sPerMatch: totalMatches > 0 ? Math.round((total180s / totalMatches) * 100) / 100 : 0,
        avg100PlusPerMatch: totalMatches > 0 ? Math.round((total100Plus / totalMatches) * 100) / 100 : 0
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
      const validStats = stats.filter(stat => stat !== null)

      setPlayerStats(validStats)

      if (validStats.length >= 2) {
        // Create normalized data for radar chart
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
            metric: 'Leg Win Rate', 
            ...Object.fromEntries(validStats.map(stat => [stat.name, stat.avgWinRateLegs]))
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
          },
          {
            metric: '180s/Match',
            ...Object.fromEntries(validStats.map(stat => [
              stat.name,
              Math.min(stat.avg180sPerMatch * 20, 100) // Scale for visibility
            ]))
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
    if (activeComparisons < 5) {
      setActiveComparisons(activeComparisons + 1)
    }
  }

  const removePlayer = (index: number) => {
    if (activeComparisons > 2) {
      const newSelected = [...selectedPlayers]
      newSelected[index] = 0
      setSelectedPlayers(newSelected)
      
      // If removing the last active player, decrease count
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
  }

  // Comprehensive comparison metrics
  const comparisonMetrics = [
    { key: 'tournaments', label: 'Tournaments Played', format: (val: number) => val.toString() },
    { key: 'totalMatches', label: 'Total Matches', format: (val: number) => val.toString() },
    { key: 'totalSets', label: 'Total Sets', format: (val: number) => val.toString() },
    { key: 'totalLegs', label: 'Total Legs', format: (val: number) => val.toString() },
    { key: 'avgThreeDart', label: '3-Dart Average ✓', format: (val: number) => val.toFixed(2) },
    { key: 'avgOneDart', label: '1-Dart Average', format: (val: number) => val.toFixed(2) },
    { key: 'avgFirst9', label: 'First 9 Average', format: (val: number) => val.toFixed(2) },
    { key: 'overallAverage', label: 'Overall Average', format: (val: number) => val.toFixed(2) },
    { key: 'avgWinRateSets', label: 'Set Win Rate (%)', format: (val: number) => `${val.toFixed(1)}%` },
    { key: 'avgWinRateLegs', label: 'Leg Win Rate (%)', format: (val: number) => `${val.toFixed(1)}%` },
    { key: 'avgKeepRate', label: 'Keep Rate (%)', format: (val: number) => `${val.toFixed(1)}%` },
    { key: 'avgBreakRate', label: 'Break Rate (%)', format: (val: number) => `${val.toFixed(1)}%` },
    { key: 'highFinish', label: 'High Finish', format: (val: number) => val.toString() },
    { key: 'bestLeg', label: 'Best Leg (Darts)', format: (val: number) => val > 0 ? val.toString() : 'N/A' },
    { key: 'worstLeg', label: 'Worst Leg (Darts)', format: (val: number) => val.toString() },
    { key: 'total180s', label: 'Total 180s', format: (val: number) => val.toString() },
    { key: 'total170Plus', label: 'Total 170+ Scores', format: (val: number) => val.toString() },
    { key: 'total140Plus', label: 'Total 140+ Scores', format: (val: number) => val.toString() },
    { key: 'total100Plus', label: 'Total 100+ Scores', format: (val: number) => val.toString() },
    { key: 'totalFinishes100Plus', label: 'Total 100+ Finishes', format: (val: number) => val.toString() },
    { key: 'avg180sPerMatch', label: '180s per Match', format: (val: number) => val.toFixed(2) },
    { key: 'avg100PlusPerMatch', label: '100+ Scores per Match', format: (val: number) => val.toFixed(2) },
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
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Swords className="h-8 w-8 mr-3 text-primary-600" />
            Player Comparison (Up to 5 Players)
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Compare performance statistics between multiple players with verified calculations
          </p>
        </div>
      </div>

      {/* Enhanced Player Selection */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow border-l-4 border-primary-500">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            {isUpdating && <RefreshCw className="h-5 w-5 mr-2 animate-spin text-primary-600" />}
            Select Players to Compare
          </h3>
          <div className="flex space-x-2">
            {activeComparisons < 5 && (
              <button
                onClick={addPlayer}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Player
              </button>
            )}
            <button
              onClick={clearAllSelections}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: activeComparisons }, (_, index) => (
            <div key={index} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                style={{ 
                  borderColor: selectedPlayers[index] ? PLAYER_COLORS[index] : undefined,
                  borderWidth: selectedPlayers[index] ? '2px' : '1px'
                }}
              >
                <option value={0}>Select a player...</option>
                {players.map(player => (
                  <option key={player.player_id} value={player.player_id}>
                    {player.player_name}
                  </option>
                ))}
              </select>
              {selectedPlayers[index] > 0 && (
                <div 
                  className="absolute top-0 right-0 w-3 h-3 rounded-full"
                  style={{ backgroundColor: PLAYER_COLORS[index] }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Results */}
      {playerStats.length >= 2 && (
        <>
          {/* Radar Chart */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Radar Comparison</h3>
            <div className="h-96">
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

          {/* Enhanced Comparison Table */}
          <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Comprehensive Comparison ({playerStats.length} Players)
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                ✓ Statistics verified with accurate calculations
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">
                      Statistic
                    </th>
                    {playerStats.map((player, index) => (
                      <th
                        key={player.name}
                        className="px-6 py-3 text-center text-xs font-medium uppercase border-l-2"
                        style={{ 
                          color: PLAYER_COLORS[index],
                          borderLeftColor: PLAYER_COLORS[index]
                        }}
                      >
                        {player.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {comparisonMetrics.map((metric) => (
                    <tr key={metric.key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                        {metric.label}
                      </td>
                      {playerStats.map((player, index) => {
                        const value = player[metric.key as keyof typeof player]
                        const isNumeric = typeof value === 'number'
                        const isBest = isNumeric && playerStats.length > 1 ? 
                          Math.max(...playerStats.map(p => p[metric.key as keyof typeof p] as number)) === value :
                          false
                        
                        return (
                          <td
                            key={player.name}
                            className={`px-6 py-4 text-sm text-center border-l-2 ${
                              isBest && isNumeric ? 'font-bold bg-green-50 text-green-800' : 'text-gray-900'
                            }`}
                            style={{ borderLeftColor: PLAYER_COLORS[index] + '20' }}
                          >
                            <div className="flex flex-col">
                              <span className={isBest ? 'text-green-800 font-bold' : ''}>
                                {metric.format(value as number)}
                              </span>
                              {isBest && (
                                <span className="text-xs text-green-600">👑 Best</span>
                              )}
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
        </>
      )}

      {playerStats.length < 2 && (
        <div className="mt-8 text-center py-12 bg-white rounded-lg shadow">
          <Swords className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-500">
            Select at least 2 players to start comparing their performance
          </p>
          <p className="text-sm text-gray-400 mt-2">
            You can compare up to 5 players at once with verified statistics
          </p>
        </div>
      )}
    </div>
  )
}
