import { useEffect, useState } from 'react'
import { getPlayers, getPlayerStats } from '@/lib/queries'
import { Player, PlayerStat } from '@/lib/supabase'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'
import { Swords } from 'lucide-react'

export default function Compare() {
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayer1, setSelectedPlayer1] = useState<number>(0)
  const [selectedPlayer2, setSelectedPlayer2] = useState<number>(0)
  const [player1Stats, setPlayer1Stats] = useState<any>(null)
  const [player2Stats, setPlayer2Stats] = useState<any>(null)
  const [comparisonData, setComparisonData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

      // Aggregate stats
      const avgThreeDart = statsData.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / statsData.length
      const avgWinRateSets = statsData.reduce((sum, stat) => sum + stat.win_rate_sets, 0) / statsData.length
      const avgFirst9 = statsData.reduce((sum, stat) => sum + stat.first_9_avg, 0) / statsData.length
      const highFinish = Math.max(...statsData.map(stat => stat.high_finish))
      const totalMatches = statsData.reduce((sum, stat) => sum + stat.match_played, 0)
      const total180s = statsData.reduce((sum, stat) => sum + stat.scores_180, 0)

      return {
        name: statsData[0].players?.player_name || 'Unknown',
        avgThreeDart: Math.round(avgThreeDart * 100) / 100,
        avgWinRateSets: Math.round(avgWinRateSets * 1000) / 10,
        avgFirst9: Math.round(avgFirst9 * 100) / 100,
        highFinish,
        totalMatches,
        total180s,
        tournaments: statsData.length
      }
    } catch (error) {
      console.error('Error fetching player stats:', error)
      return null
    }
  }

  useEffect(() => {
    async function updateComparison() {
      const [stats1, stats2] = await Promise.all([
        fetchPlayerStats(selectedPlayer1),
        fetchPlayerStats(selectedPlayer2)
      ])

      setPlayer1Stats(stats1)
      setPlayer2Stats(stats2)

      if (stats1 && stats2) {
        // Normalize data for radar chart (0-100 scale)
        const maxThreeDart = Math.max(stats1.avgThreeDart, stats2.avgThreeDart, 60) // baseline 60
        const maxFinish = Math.max(stats1.highFinish, stats2.highFinish, 180) // max possible 180
        const maxFirst9 = Math.max(stats1.avgFirst9, stats2.avgFirst9, 60) // baseline 60

        const data = [
          {
            metric: '3-Dart Avg',
            [stats1.name]: Math.round((stats1.avgThreeDart / maxThreeDart) * 100),
            [stats2.name]: Math.round((stats2.avgThreeDart / maxThreeDart) * 100)
          },
          {
            metric: 'Win Rate %',
            [stats1.name]: stats1.avgWinRateSets,
            [stats2.name]: stats2.avgWinRateSets
          },
          {
            metric: 'First 9 Avg',
            [stats1.name]: Math.round((stats1.avgFirst9 / maxFirst9) * 100),
            [stats2.name]: Math.round((stats2.avgFirst9 / maxFirst9) * 100)
          },
          {
            metric: 'High Finish',
            [stats1.name]: Math.round((stats1.highFinish / maxFinish) * 100),
            [stats2.name]: Math.round((stats2.highFinish / maxFinish) * 100)
          },
          {
            metric: '180s per Match',
            [stats1.name]: stats1.totalMatches > 0 ? Math.round((stats1.total180s / stats1.totalMatches) * 10) : 0,
            [stats2.name]: stats2.totalMatches > 0 ? Math.round((stats2.total180s / stats2.totalMatches) * 10) : 0
          }
        ]

        setComparisonData(data)
      }
    }

    if (selectedPlayer1 && selectedPlayer2) {
      updateComparison()
    }
  }, [selectedPlayer1, selectedPlayer2])

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
            Player Comparison
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Compare performance statistics between two players
          </p>
        </div>
      </div>

      {/* Player Selection */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player 1
            </label>
            <select
              value={selectedPlayer1}
              onChange={(e) => setSelectedPlayer1(parseInt(e.target.value))}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player 2
            </label>
            <select
              value={selectedPlayer2}
              onChange={(e) => setSelectedPlayer2(parseInt(e.target.value))}
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
        </div>
      </div>

      {/* Comparison Results */}
      {player1Stats && player2Stats && (
        <>
          {/* Radar Chart */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Radar</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={comparisonData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={0} domain={[0, 100]} />
                  <Radar
                    name={player1Stats.name}
                    dataKey={player1Stats.name}
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name={player2Stats.name}
                    dataKey={player2Stats.name}
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Statistic
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {player1Stats.name}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {player2Stats.name}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Difference
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">3-Dart Average</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">{player1Stats.avgThreeDart}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">{player2Stats.avgThreeDart}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className={`font-medium ${
                        player1Stats.avgThreeDart > player2Stats.avgThreeDart ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {Math.abs(player1Stats.avgThreeDart - player2Stats.avgThreeDart).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Set Win Rate (%)</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">{player1Stats.avgWinRateSets}%</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">{player2Stats.avgWinRateSets}%</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className={`font-medium ${
                        player1Stats.avgWinRateSets > player2Stats.avgWinRateSets ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {Math.abs(player1Stats.avgWinRateSets - player2Stats.avgWinRateSets).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">First 9 Average</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">{player1Stats.avgFirst9}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">{player2Stats.avgFirst9}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className={`font-medium ${
                        player1Stats.avgFirst9 > player2Stats.avgFirst9 ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {Math.abs(player1Stats.avgFirst9 - player2Stats.avgFirst9).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">High Finish</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">{player1Stats.highFinish}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">{player2Stats.highFinish}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className={`font-medium ${
                        player1Stats.highFinish > player2Stats.highFinish ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {Math.abs(player1Stats.highFinish - player2Stats.highFinish)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Total 180s</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">{player1Stats.total180s}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">{player2Stats.total180s}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className={`font-medium ${
                        player1Stats.total180s > player2Stats.total180s ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {Math.abs(player1Stats.total180s - player2Stats.total180s)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Tournaments Played</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">{player1Stats.tournaments}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">{player2Stats.tournaments}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className={`font-medium ${
                        player1Stats.tournaments > player2Stats.tournaments ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {Math.abs(player1Stats.tournaments - player2Stats.tournaments)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {(!selectedPlayer1 || !selectedPlayer2) && (
        <div className="mt-8 text-center py-12 bg-white rounded-lg shadow">
          <Swords className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-500">Select two players to start comparing their performance</p>
        </div>
      )}
    </div>
  )
}
