import { useState, useEffect } from 'react'
import { getPlayers, getPlayerStats } from '@/lib/queries'
import { Player, PlayerStat } from '@/lib/supabase'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Search, X, Plus, TrendingUp, Award, Target } from 'lucide-react'

export default function PlayerComparison() {
  const [players, setPlayers] = useState<Player[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [playerStats, setPlayerStats] = useState<{[key: number]: PlayerStat[]}>({})
  const [comparisonData, setComparisonData] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showPlayerList, setShowPlayerList] = useState(false)

  useEffect(() => {
    async function fetchPlayers() {
      try {
        setLoading(true)
        const playersData = await getPlayers()
        setPlayers(playersData)
        setFilteredPlayers(playersData)
      } catch (error) {
        console.error('Error fetching players:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlayers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = players.filter(player =>
        player.player_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPlayers(filtered)
    } else {
      setFilteredPlayers(players)
    }
  }, [searchTerm, players])

  useEffect(() => {
    async function fetchPlayerStats() {
      for (const player of selectedPlayers) {
        if (!playerStats[player.player_id]) {
          try {
            const stats = await getPlayerStats({ playerId: player.player_id })
            setPlayerStats(prev => ({
              ...prev,
              [player.player_id]: stats
            }))
          } catch (error) {
            console.error('Error fetching player stats:', error)
          }
        }
      }
    }
    
    if (selectedPlayers.length > 0) {
      fetchPlayerStats()
    }
  }, [selectedPlayers])

  useEffect(() => {
    if (selectedPlayers.length >= 2 && Object.keys(playerStats).length >= 2) {
      const metrics = [
        { key: 'three_dart_avg', label: 'Three Dart Avg', max: 60 },
        { key: 'first_9_avg', label: 'First 9 Avg', max: 80 }, 
        { key: 'win_rate_sets', label: 'Win Rate Sets (%)', max: 100 },
        { key: 'win_rate_legs', label: 'Win Rate Legs (%)', max: 100 },
        { key: 'high_finish', label: 'High Finish', max: 200 },
        { key: 'scores_100_plus', label: '100+ Scores', max: 20 },
        { key: 'scores_140_plus', label: '140+ Scores', max: 10 },
        { key: 'scores_180', label: '180s', max: 5 }
      ]

      const radarData = metrics.map(metric => {
        const dataPoint: any = { metric: metric.label }
        
        selectedPlayers.forEach(player => {
          const stats = playerStats[player.player_id]
          if (stats && stats.length > 0) {
            const avgStats = stats.reduce((acc, stat) => {
              return {
                three_dart_avg: acc.three_dart_avg + stat.three_dart_avg,
                first_9_avg: acc.first_9_avg + stat.first_9_avg,
                win_rate_sets: acc.win_rate_sets + stat.win_rate_sets,
                win_rate_legs: acc.win_rate_legs + stat.win_rate_legs,
                high_finish: Math.max(acc.high_finish, stat.high_finish),
                scores_100_plus: acc.scores_100_plus + stat.scores_100_plus,
                scores_140_plus: acc.scores_140_plus + stat.scores_140_plus,
                scores_180: acc.scores_180 + stat.scores_180
              }
            }, {
              three_dart_avg: 0, first_9_avg: 0, win_rate_sets: 0, win_rate_legs: 0,
              high_finish: 0, scores_100_plus: 0, scores_140_plus: 0, scores_180: 0
            })

            const numStats = stats.length
            let value = 0
            
            switch (metric.key) {
              case 'three_dart_avg':
                value = avgStats.three_dart_avg / numStats
                break
              case 'first_9_avg':
                value = avgStats.first_9_avg / numStats
                break
              case 'win_rate_sets':
                value = (avgStats.win_rate_sets / numStats) * 100
                break
              case 'win_rate_legs':
                value = (avgStats.win_rate_legs / numStats) * 100
                break
              case 'high_finish':
                value = avgStats.high_finish
                break
              case 'scores_100_plus':
                value = avgStats.scores_100_plus / numStats
                break
              case 'scores_140_plus':
                value = avgStats.scores_140_plus / numStats
                break
              case 'scores_180':
                value = avgStats.scores_180 / numStats
                break
            }
            
            dataPoint[player.player_name] = Math.round(value * 100) / 100
          }
        })
        
        return dataPoint
      })

      // Create bar chart data
      const barData = selectedPlayers.map(player => {
        const stats = playerStats[player.player_id]
        if (stats && stats.length > 0) {
          const avgStats = stats.reduce((acc, stat) => ({
            three_dart_avg: acc.three_dart_avg + stat.three_dart_avg,
            first_9_avg: acc.first_9_avg + stat.first_9_avg,
            win_rate_sets: acc.win_rate_sets + stat.win_rate_sets,
            total_matches: acc.total_matches + stat.match_played
          }), { three_dart_avg: 0, first_9_avg: 0, win_rate_sets: 0, total_matches: 0 })

          const numStats = stats.length
          return {
            name: player.player_name,
            'Three Dart Avg': Math.round((avgStats.three_dart_avg / numStats) * 100) / 100,
            'First 9 Avg': Math.round((avgStats.first_9_avg / numStats) * 100) / 100,
            'Win Rate %': Math.round((avgStats.win_rate_sets / numStats) * 1000) / 10,
            'Total Matches': avgStats.total_matches
          }
        }
        return null
      }).filter(Boolean)

      setComparisonData(radarData)
      setChartData(barData)
    }
  }, [selectedPlayers, playerStats])

  const addPlayer = (player: Player) => {
    if (selectedPlayers.length < 4 && !selectedPlayers.find(p => p.player_id === player.player_id)) {
      setSelectedPlayers(prev => [...prev, player])
      setShowPlayerList(false)
      setSearchTerm('')
    }
  }

  const removePlayer = (playerId: number) => {
    setSelectedPlayers(prev => prev.filter(p => p.player_id !== playerId))
  }

  const playerColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Player Performance Comparison</h2>
        <p className="text-blue-100">Compare up to 4 players across key performance metrics</p>
      </div>

      {/* Player Selection */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Selected Players ({selectedPlayers.length}/4)</h3>
          <button
            onClick={() => setShowPlayerList(true)}
            disabled={selectedPlayers.length >= 4}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Player
          </button>
        </div>

        {/* Selected Players */}
        <div className="flex flex-wrap gap-3 mb-4">
          {selectedPlayers.map((player, index) => (
            <div
              key={player.player_id}
              className="flex items-center px-4 py-2 rounded-full text-white font-medium shadow-lg"
              style={{ backgroundColor: playerColors[index] }}
            >
              <span>{player.player_name}</span>
              <button
                onClick={() => removePlayer(player.player_id)}
                className="ml-2 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {selectedPlayers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Select players to start comparing their performance</p>
          </div>
        )}

        {/* Player Selection Modal */}
        {showPlayerList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Select a Player</h3>
                <button
                  onClick={() => setShowPlayerList(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Player List */}
              <div className="overflow-y-auto max-h-64">
                <div className="grid grid-cols-1 gap-2">
                  {filteredPlayers.map(player => {
                    const isSelected = selectedPlayers.find(p => p.player_id === player.player_id)
                    return (
                      <button
                        key={player.player_id}
                        onClick={() => !isSelected && addPlayer(player)}
                        disabled={!!isSelected || selectedPlayers.length >= 4}
                        className={`text-left p-3 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        <div className="font-medium">{player.player_name}</div>
                        {isSelected && <div className="text-sm text-gray-400">Already selected</div>}
                      </button>
                    )
                  })}
                </div>
                
                {filteredPlayers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No players found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Charts */}
      {selectedPlayers.length >= 2 && comparisonData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Performance Radar
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={comparisonData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={{ fontSize: 10 }} />
                  {selectedPlayers.map((player, index) => (
                    <Radar
                      key={player.player_id}
                      name={player.player_name}
                      dataKey={player.player_name}
                      stroke={playerColors[index]}
                      fill={playerColors[index]}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-green-500" />
              Key Metrics Comparison
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Three Dart Avg" fill="#3b82f6" />
                  <Bar dataKey="First 9 Avg" fill="#10b981" />
                  <Bar dataKey="Win Rate %" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Stats Table */}
      {selectedPlayers.length >= 2 && comparisonData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Detailed Statistics Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  {selectedPlayers.map((player, index) => (
                    <th
                      key={player.player_id}
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: playerColors[index] }}
                    >
                      {player.player_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparisonData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.metric}
                    </td>
                    {selectedPlayers.map((player, playerIndex) => (
                      <td
                        key={player.player_id}
                        className="px-6 py-4 whitespace-nowrap text-sm font-semibold"
                        style={{ color: playerColors[playerIndex] }}
                      >
                        {row[player.player_name] || 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
