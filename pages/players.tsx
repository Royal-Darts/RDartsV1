import { useEffect, useState } from 'react'
import { getPlayers, getPlayerStats } from '@/lib/queries'
import { Player, PlayerStat } from '@/lib/supabase'
import Link from 'next/link'
import { Users, Search, Eye, ExternalLink } from 'lucide-react'

interface PlayerWithStats {
  player_id: number
  player_name: string
  team_name: string
  tournaments: number
  avg_three_dart: number
  avg_first_9: number
  win_rate_sets: number
  total_matches: number
  high_finish: number
  total_180s: number
  total_140_plus: number
  total_100_plus: number
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [playersWithStats, setPlayersWithStats] = useState<PlayerWithStats[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerWithStats[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('avg_three_dart')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)

  // Players to exclude
  const excludedPlayers = ['Anjana Rustagi', 'Sai Agarwal']

  useEffect(() => {
    async function fetchData() {
      try {
        const [playersData, statsData] = await Promise.all([
          getPlayers(),
          getPlayerStats()
        ])

        setPlayers(playersData)
        setPlayerStats(statsData)

        // Process player data
        const processedPlayers: PlayerWithStats[] = []
        
        playersData.forEach(player => {
          // Skip excluded players
          if (excludedPlayers.includes(player.player_name)) {
            return
          }

          const playerStatsArray = statsData.filter(stat => stat.player_id === player.player_id)
          
          if (playerStatsArray.length === 0) return

          const totalMatches = playerStatsArray.reduce((sum, stat) => sum + (stat.match_played || 0), 0)
          const totalSets = playerStatsArray.reduce((sum, stat) => sum + (stat.sets_played || 0), 0)
          const totalSetsWon = playerStatsArray.reduce((sum, stat) => sum + (stat.sets_won || 0), 0)
          
          const avgThreeDart = playerStatsArray.reduce((sum, stat) => sum + (stat.three_dart_avg || 0), 0) / playerStatsArray.length
          const avgFirstNine = playerStatsArray.reduce((sum, stat) => sum + (stat.first_9_avg || 0), 0) / playerStatsArray.length
          const highFinish = Math.max(...playerStatsArray.map(stat => stat.high_finish || 0))
          const total180s = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_180 || 0), 0)
          const total140Plus = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_140_plus || 0), 0)
          const total100Plus = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_100_plus || 0), 0)

          const teamName = playerStatsArray[0]?.teams?.team_name || 'Unknown Team'

          processedPlayers.push({
            player_id: player.player_id,
            player_name: player.player_name,
            team_name: teamName,
            tournaments: playerStatsArray.length,
            avg_three_dart: Math.round(avgThreeDart * 100) / 100,
            avg_first_9: Math.round(avgFirstNine * 100) / 100,
            win_rate_sets: Math.round((totalSetsWon / Math.max(totalSets, 1)) * 1000) / 10,
            total_matches: totalMatches,
            high_finish: highFinish,
            total_180s: total180s,
            total_140_plus: total140Plus,
            total_100_plus: total100Plus
          })
        })

        setPlayersWithStats(processedPlayers)
        setFilteredPlayers(processedPlayers)
      } catch (error) {
        console.error('Error fetching players:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let filtered = playersWithStats

    if (searchTerm) {
      filtered = filtered.filter(player =>
        player.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.team_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = (a as any)[sortBy] || 0
      const bValue = (b as any)[sortBy] || 0
      
      if (sortOrder === 'desc') {
        return Number(bValue) - Number(aValue)
      }
      return Number(aValue) - Number(bValue)
    })

    setFilteredPlayers(filtered)
  }, [playersWithStats, searchTerm, sortBy, sortOrder])

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Players</h1>
              <p className="text-gray-600">Performance statistics for all registered players</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total: {filteredPlayers.length} players
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search players or teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="avg_three_dart">3-Dart Average</option>
            <option value="avg_first_9">First 9 Average</option>
            <option value="win_rate_sets">Win Rate</option>
            <option value="high_finish">High Finish</option>
            <option value="total_matches">Total Matches</option>
            <option value="total_180s">Total 180s</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="desc">Highest First</option>
            <option value="asc">Lowest First</option>
          </select>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                3-Dart Avg
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                First 9 Avg
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Win Rate (%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matches
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tournaments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                High Finish
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                180s
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPlayers.map((player, index) => (
              <tr key={player.player_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index < 3 
                      ? index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                      : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {player.player_name.charAt(0)}
                    </div>
                    <div className="font-medium text-gray-900">{player.player_name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {player.team_name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-bold text-blue-600">{player.avg_three_dart.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-semibold text-green-600">{player.avg_first_9.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">
                      {player.win_rate_sets.toFixed(1)}%
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          player.win_rate_sets >= 70 ? 'bg-green-500' : 
                          player.win_rate_sets >= 50 ? 'bg-blue-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(player.win_rate_sets, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {player.total_matches}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {player.tournaments}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`font-bold px-2 py-1 rounded ${
                    player.high_finish >= 100 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {player.high_finish}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-bold text-red-600">{player.total_180s}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/players/${player.player_id}`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Results */}
      {filteredPlayers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No players found matching your search criteria.</p>
        </div>
      )}
    </div>
  )
}
