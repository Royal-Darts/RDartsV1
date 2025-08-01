import { useEffect, useState } from 'react'
import { getPlayers, getPlayerStats } from '@/lib/queries'
import { Player, PlayerStat } from '@/lib/supabase'
import Link from 'next/link'
import { Users, Search, Eye, Trophy, Target, TrendingUp, Download, Plus, Filter } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import StatsGrid from '@/components/StatsGrid'

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

  // Enhanced stats data for StatsGrid component
  const statsData = [
    {
      title: 'Total Players',
      value: filteredPlayers.length,
      change: 12,
      changeType: 'increase' as const,
      icon: <Users className="h-6 w-6" />,
      color: 'blue' as const
    },
    {
      title: 'Total Matches',
      value: filteredPlayers.reduce((sum, p) => sum + p.total_matches, 0).toLocaleString(),
      change: 8,
      changeType: 'increase' as const,
      icon: <Target className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'Avg Performance',
      value: filteredPlayers.length > 0 ? 
        Math.round(filteredPlayers.reduce((sum, p) => sum + p.avg_three_dart, 0) / filteredPlayers.length * 100) / 100 : 0,
      change: 5,
      changeType: 'increase' as const,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'purple' as const
    },
    {
      title: 'Elite Players',
      value: filteredPlayers.filter(p => p.avg_three_dart >= 45).length,
      change: 15,
      changeType: 'increase' as const,
      icon: <Trophy className="h-6 w-6" />,
      color: 'yellow' as const
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading players data...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Enhanced Page Header */}
      <PageHeader
        title="Players"
        subtitle={`Performance statistics for ${filteredPlayers.length} registered players`}
        icon={<Users className="h-6 w-6 text-blue-600" />}
        breadcrumbs={[
          { name: 'Dashboard', href: '/players' },
          { name: 'Players' }
        ]}
        actions={
          <div className="flex items-center space-x-3">
            <button className="btn-secondary flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Player</span>
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Enhanced Stats Grid */}
        <StatsGrid stats={statsData} />

        {/* Enhanced Search and Filter Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Search & Filter Players</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Enhanced Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search players or teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-enhanced pl-10"
              />
            </div>
            
            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-enhanced"
            >
              <option value="avg_three_dart">3-Dart Average</option>
              <option value="avg_first_9">First 9 Average</option>
              <option value="win_rate_sets">Win Rate</option>
              <option value="high_finish">High Finish</option>
              <option value="total_matches">Total Matches</option>
              <option value="total_180s">Total 180s</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="input-enhanced"
            >
              <option value="desc">Highest First</option>
              <option value="asc">Lowest First</option>
            </select>
          </div>

          {/* Active Search Indicator */}
          {searchTerm && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-700">
                  <strong>Search Active:</strong> "{searchTerm}" - {filteredPlayers.length} players found
                </div>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Players Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Trophy className="h-5 w-5 text-blue-600 mr-2" />
                  Player Performance Rankings
                </h3>
                <p className="text-blue-700 text-sm mt-1">
                  {filteredPlayers.length} players sorted by {sortBy.replace('_', ' ')} ({sortOrder === 'desc' ? 'highest to lowest' : 'lowest to highest'})
                </p>
              </div>
              <div className="text-sm text-blue-600 bg-blue-200 px-3 py-1 rounded-full">
                Live Data
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
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
                  <tr key={player.player_id} className="hover:bg-gray-50 transition-colors animate-fade-in">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all hover:scale-110 ${
                        index < 3 
                          ? index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' : 
                            'bg-gradient-to-r from-amber-400 to-amber-600'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3 transition-all hover:scale-110">
                          {player.player_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{player.player_name}</div>
                          <div className="text-xs text-gray-500">ID: {player.player_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-blue">
                        {player.team_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-blue-600">{player.avg_three_dart.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">3-Dart</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-green-600">{player.avg_first_9.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">First 9</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {player.win_rate_sets.toFixed(1)}%
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              player.win_rate_sets >= 70 ? 'bg-green-500' : 
                              player.win_rate_sets >= 50 ? 'bg-blue-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(player.win_rate_sets, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {player.total_matches}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-green">
                        {player.tournaments}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-bold px-2 py-1 rounded transition-all hover:scale-105 ${
                        player.high_finish >= 100 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {player.high_finish}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-red-600 text-lg">{player.total_180s}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/players/${player.player_id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 transition-all duration-200 hover:scale-105"
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
        </div>

        {/* No Results State */}
        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-fade-in">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Players Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? `No players found matching "${searchTerm}"` : 'No players found matching your criteria.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn-primary"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{filteredPlayers.length}</div>
              <div className="text-sm text-blue-700">Players Displayed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredPlayers.reduce((sum, p) => sum + p.total_matches, 0).toLocaleString()}
              </div>
              <div className="text-sm text-green-700">Total Matches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {filteredPlayers.length > 0 ? 
                  Math.round(filteredPlayers.reduce((sum, p) => sum + p.avg_three_dart, 0) / filteredPlayers.length * 100) / 100 : 0}
              </div>
              <div className="text-sm text-purple-700">Average Performance</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {filteredPlayers.length > 0 ? Math.max(...filteredPlayers.map(p => p.high_finish)) : 0}
              </div>
              <div className="text-sm text-amber-700">Best Finish</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
