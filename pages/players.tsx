import { useEffect, useState } from 'react'
import { getPlayers, getPlayerStats } from '@/lib/queries'
import { Player, PlayerStat } from '@/lib/supabase'
import { Users, Search, Filter } from 'lucide-react'

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
  total_180s: number  // Fixed: consistent naming
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
          const total180s = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_180 || 0), 0) // Fixed variable name
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
            total_180s: total180s,  // Fixed: consistent property name
            total_140_plus: total140Plus,
            total_100_plus: total100Plus
          })
        })

        // Sort by 3-dart average by default
        processedPlayers.sort((a, b) => b.avg_three_dart - a.avg_three_dart)
        
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
      return Number(bValue) - Number(aValue)
    })

    setFilteredPlayers(filtered)
  }, [playersWithStats, searchTerm, sortBy])

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
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Players</h1>
            <p className="text-gray-600">Performance statistics for all registered players</p>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
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
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">{filteredPlayers.length}</div>
            <div className="text-sm text-gray-600">Active Players</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">
              {filteredPlayers.reduce((sum, p) => sum + p.total_matches, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Matches</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-purple-600">
              {filteredPlayers.length > 0 ? 
                Math.round(filteredPlayers.reduce((sum, p) => sum + p.avg_three_dart, 0) / filteredPlayers.length * 100) / 100 : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Performance</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-amber-600">
              {filteredPlayers.length > 0 ? Math.max(...filteredPlayers.map(p => p.high_finish)) : 0}
            </div>
            <div className="text-sm text-gray-600">Best Finish</div>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers.map((player, index) => (
          <div
            key={player.player_id}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300"
          >
            {/* Player Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {player.player_name.charAt(0)}
                </div>
                <div className="ml-3">
                  <h3 className="font-bold text-gray-900">{player.player_name}</h3>
                  <p className="text-sm text-gray-600">{player.team_name}</p>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                index < 3 ? 'bg-amber-500' : 'bg-blue-500'
              }`}>
                #{index + 1}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{player.avg_three_dart.toFixed(2)}</div>
                <div className="text-xs text-blue-600">3-Dart Avg</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{player.win_rate_sets.toFixed(1)}%</div>
                <div className="text-xs text-green-600">Win Rate</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">{player.high_finish}</div>
                <div className="text-xs text-purple-600">High Finish</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600">{player.total_180s}</div>
                <div className="text-xs text-red-600">180s</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tournaments:</span>
                <span className="font-medium">{player.tournaments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Matches:</span>
                <span className="font-medium">{player.total_matches}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">First 9 Avg:</span>
                <span className="font-medium">{player.avg_first_9.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">100+ Scores:</span>
                <span className="font-medium">{player.total_100_plus}</span>
              </div>
            </div>
          </div>
        ))}
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
