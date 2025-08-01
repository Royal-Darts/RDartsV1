import { useEffect, useState } from 'react'
import { getPlayers, getPlayerStats } from '@/lib/queries'
import { Player, PlayerStat } from '@/lib/supabase'
import PlayerCard from '@/components/PlayerCard'
import PlayerStatsModal from '@/components/PlayerStatsModal'
import { Search, Filter, SortDesc, Grid, List } from 'lucide-react'

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('threeDartAvg')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterTeam, setFilterTeam] = useState('')
  const [filterTournament, setFilterTournament] = useState('')
  const [minAverage, setMinAverage] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [playersData, statsData] = await Promise.all([
          getPlayers(),
          getPlayerStats()
        ])

        setPlayers(playersData)
        setPlayerStats(statsData)
      } catch (error) {
        console.error('Error fetching players:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    // Process and filter players
    const processedPlayers: any[] = []
    
    players.forEach(player => {
      const playerStatsArray = playerStats.filter(stat => stat.player_id === player.player_id)
      
      if (playerStatsArray.length === 0) return

      const avgThreeDart = playerStatsArray.reduce((sum, stat) => sum + (stat.three_dart_avg || 0), 0) / playerStatsArray.length
      const totalMatches = playerStatsArray.reduce((sum, stat) => sum + (stat.match_played || 0), 0)
      const totalSetsWon = playerStatsArray.reduce((sum, stat) => sum + (stat.sets_won || 0), 0)
      const totalSets = playerStatsArray.reduce((sum, stat) => sum + (stat.sets_played || 0), 0)
      const winRate = (totalSetsWon / Math.max(totalSets, 1)) * 100
      const teamName = playerStatsArray[0]?.teams?.team_name || 'Unknown Team'
      const highFinish = Math.max(...playerStatsArray.map(stat => stat.high_finish || 0))
      const total180s = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_180 || 0), 0)

      processedPlayers.push({
        id: player.player_id,
        name: player.player_name,
        team: teamName,
        threeDartAvg: avgThreeDart,
        winRate,
        totalMatches,
        tournaments: playerStatsArray.length,
        highFinish,
        total180s,
        firstNineAvg: playerStatsArray.reduce((sum, stat) => sum + (stat.first_9_avg || 0), 0) / playerStatsArray.length
      })
    })

    // Apply filters
    let filtered = processedPlayers

    if (searchTerm) {
      filtered = filtered.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.team.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterTeam) {
      filtered = filtered.filter(player => player.team === filterTeam)
    }

    if (minAverage) {
      filtered = filtered.filter(player => player.threeDartAvg >= parseFloat(minAverage))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a] || 0
      const bValue = b[sortBy as keyof typeof b] || 0
      
      if (sortOrder === 'desc') {
        return Number(bValue) - Number(aValue)
      }
      return Number(aValue) - Number(bValue)
    })

    // Add positions
    const finalData = filtered.map((player, index) => ({
      ...player,
      position: index + 1
    }))

    setFilteredPlayers(finalData)
  }, [players, playerStats, searchTerm, sortBy, sortOrder, filterTeam, minAverage])

  const uniqueTeams = Array.from(new Set(filteredPlayers.map(p => p.team))).sort()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Clean Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Players</h1>
        <p className="text-gray-600">Comprehensive player statistics and performance analysis</p>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="font-medium text-gray-900">Filters & Search</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Search Players</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Team Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Team</label>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Teams</option>
              {uniqueTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          {/* Min Average */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Min Average</label>
            <input
              type="number"
              placeholder="0"
              value={minAverage}
              onChange={(e) => setMinAverage(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="threeDartAvg">3-Dart Average</option>
              <option value="winRate">Win Rate</option>
              <option value="totalMatches">Total Matches</option>
              <option value="total180s">Total 180s</option>
              <option value="highFinish">High Finish</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="desc">Highest First</option>
              <option value="asc">Lowest First</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span><span className="font-medium text-gray-900">{filteredPlayers.length}</span> players found</span>
            <span>Avg: <span className="font-medium text-gray-900">
              {filteredPlayers.length > 0 ? 
                (filteredPlayers.reduce((sum, p) => sum + p.threeDartAvg, 0) / filteredPlayers.length).toFixed(2) : '0.00'}
            </span></span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onClick={() => setSelectedPlayer(player)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">3-Dart Avg</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Win Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matches</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">180s</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {player.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{player.name}</div>
                        <div className="text-xs text-gray-500">Rank #{player.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{player.team}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-blue-600">{player.threeDartAvg.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{player.winRate.toFixed(1)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{player.totalMatches}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{player.total180s}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedPlayer(player)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Player Stats Modal */}
      {selectedPlayer && (
        <PlayerStatsModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  )
}
