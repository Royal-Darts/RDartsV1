import { useEffect, useState } from 'react'
import { getPlayers, getPlayerStats } from '@/lib/queries'
import { Player, PlayerStat } from '@/lib/supabase'
import IndividualPlayerCard from '@/components/IndividualPlayerCard'
import Link from 'next/link'
import { Eye, Users, Search, Filter, Award, TrendingUp, Target, Grid, List, SlidersHorizontal, Activity } from 'lucide-react'

interface ProcessedPlayer {
  id: number
  name: string
  team: string
  tournaments: number
  avg_three_dart: number
  avg_first_9: number
  win_rate_sets: number
  win_rate_legs: number
  total_matches: number
  high_finish: number
  total_180s: number
  total_140_plus: number
  total_100_plus: number
  total_score: number
  total_darts: number
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

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<ProcessedPlayer[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<ProcessedPlayer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [minMatches, setMinMatches] = useState(0)
  const [sortBy, setSortBy] = useState('avg_three_dart')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterTeam, setFilterTeam] = useState('')
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
    // Process and filter players with proper null safety
    const processedPlayers: ProcessedPlayer[] = []
    
    players.forEach(player => {
      const playerStatsArray = playerStats.filter(stat => stat.player_id === player.player_id)
      
      if (playerStatsArray.length === 0) {
        return // Skip players with no stats
      }

      const totalMatches = playerStatsArray.reduce((sum, stat) => sum + (stat.match_played || 0), 0)
      const totalSets = playerStatsArray.reduce((sum, stat) => sum + (stat.sets_played || 0), 0)
      const totalSetsWon = playerStatsArray.reduce((sum, stat) => sum + (stat.sets_won || 0), 0)
      const totalLegs = playerStatsArray.reduce((sum, stat) => sum + (stat.legs_played || 0), 0)
      const totalLegsWon = playerStatsArray.reduce((sum, stat) => sum + (stat.legs_won || 0), 0)
      const totalScore = playerStatsArray.reduce((sum, stat) => sum + (stat.total_score || 0), 0)
      const totalDarts = playerStatsArray.reduce((sum, stat) => sum + (stat.total_darts || 0), 0)
      
      const avgThreeDart = playerStatsArray.reduce((sum, stat) => sum + (stat.three_dart_avg || 0), 0) / playerStatsArray.length
      const avgFirstNine = playerStatsArray.reduce((sum, stat) => sum + (stat.first_9_avg || 0), 0) / playerStatsArray.length
      const highFinish = Math.max(...playerStatsArray.map(stat => stat.high_finish || 0))
      const total180s = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_180 || 0), 0)
      const total140Plus = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_140_plus || 0), 0)
      const total100Plus = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_100_plus || 0), 0)

      // Get team name from first stat entry with fallback
      const teamName = playerStatsArray[0]?.teams?.team_name || 'Unknown Team'

      // Create processed player with proper typing and consistent property names
      const processedPlayer: ProcessedPlayer = {
        id: player.player_id,
        name: player.player_name,
        team: teamName,
        tournaments: playerStatsArray.length,
        avg_three_dart: Math.round(avgThreeDart * 100) / 100,
        avg_first_9: Math.round(avgFirstNine * 100) / 100,
        win_rate_sets: Math.round((totalSetsWon / Math.max(totalSets, 1)) * 1000) / 10,
        win_rate_legs: Math.round((totalLegsWon / Math.max(totalLegs, 1)) * 1000) / 10,
        total_matches: totalMatches,
        high_finish: highFinish,
        total_180s: total180s,
        total_140_plus: total140Plus,
        total_100_plus: total100Plus,
        total_score: totalScore,
        total_darts: totalDarts,
        position: 0, // Will be set later
        // Enhanced data for profile cards
        stats: {
          threeDartAvg: avgThreeDart,
          firstNineAvg: avgFirstNine,
          winRateSets: (totalSetsWon / Math.max(totalSets, 1)) * 100,
          winRateLegs: (totalLegsWon / Math.max(totalLegs, 1)) * 100,
          highFinish,
          total_180s: total180s,
          total_140_plus: total140Plus,
          total_100_plus: total100Plus,
          matchesPlayed: totalMatches,
          setsPlayed: totalSets,
          legsPlayed: totalLegs,
          tournaments: playerStatsArray.length,
          totalScore,
          totalDarts,
          bestLeg: Math.min(...playerStatsArray.map(s => s.best_leg).filter(l => l && l > 0)) || 0,
          worstLeg: Math.max(...playerStatsArray.map(s => s.worst_leg).filter(l => l && l > 0)) || 0
        },
        trends: {
          performance: avgThreeDart > 40 ? 'up' : avgThreeDart > 30 ? 'stable' : 'down',
          value: Math.round((Math.random() * 20 - 10) * 100) / 100 // Simulated trend data
        },
        achievements: avgThreeDart >= 50 ? ['Elite Performer'] : avgThreeDart >= 45 ? ['High Performer'] : [],
        recentForm: Array.from({ length: 5 }, () => Math.random()) // Simulated recent form
      }

      processedPlayers.push(processedPlayer)
    })

    // Apply filters
    let filteredData = processedPlayers

    if (minMatches > 0) {
      filteredData = filteredData.filter(player => player.total_matches >= minMatches)
    }

    if (searchTerm) {
      filteredData = filteredData.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.team.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterTeam) {
      filteredData = filteredData.filter(player => player.team === filterTeam)
    }

    // Apply sorting with null safety
    filteredData.sort((a, b) => {
      const aValue = (a as any)[sortBy] || 0
      const bValue = (b as any)[sortBy] || 0
      
      if (sortOrder === 'desc') {
        return Number(bValue) - Number(aValue)
      }
      return Number(aValue) - Number(bValue)
    })

    // Add position/ranking
    const finalData = filteredData.map((player, index) => ({
      ...player,
      position: index + 1
    }))

    setFilteredPlayers(finalData)
  }, [players, playerStats, searchTerm, minMatches, sortBy, sortOrder, filterTeam])

  // Get unique teams using Array.from for proper TypeScript compatibility
  const uniqueTeams = Array.from(new Set(filteredPlayers.map(p => p.team))).sort()

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
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Elite Players</h1>
              <p className="text-slate-600">Comprehensive performance analysis of all players</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center space-x-2 mb-4">
            <SlidersHorizontal className="h-5 w-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Advanced Filters & Search</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search players or teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Minimum Matches */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min Matches</label>
              <input
                type="number"
                placeholder="0"
                value={minMatches || ''}
                onChange={(e) => setMinMatches(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
              />
            </div>

            {/* Team Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Team</label>
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Teams</option>
                {uniqueTeams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="avg_three_dart">3-Dart Average</option>
                <option value="avg_first_9">First 9 Average</option>
                <option value="win_rate_sets">Win Rate</option>
                <option value="high_finish">High Finish</option>
                <option value="total_matches">Total Matches</option>
                <option value="tournaments">Tournaments</option>
                <option value="total_180s">Total 180s</option>
              </select>
            </div>
            
            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="desc">Highest First</option>
                <option value="asc">Lowest First</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{filteredPlayers.length}</div>
              <div className="text-sm text-slate-600">Players Found</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                {filteredPlayers.reduce((sum, p) => sum + p.total_matches, 0).toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">Total Matches</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {filteredPlayers.length > 0 ? 
                  Math.round(filteredPlayers.reduce((sum, p) => sum + p.avg_three_dart, 0) / filteredPlayers.length * 100) / 100 : 0}
              </div>
              <div className="text-sm text-slate-600">Avg Performance</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {filteredPlayers.length > 0 ? Math.max(...filteredPlayers.map(p => p.high_finish)) : 0}
              </div>
              <div className="text-sm text-slate-600">Best Finish</div>
            </div>
          </div>
        </div>
      </div>

      {/* Players Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlayers.slice(0, 12).map((player) => (
            <div key={player.id} className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {player.name.charAt(0)}
                  </div>
                  <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    player.position <= 3 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}>
                    {player.position}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{player.name}</h3>
                  <p className="text-sm text-slate-500">{player.team}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-lg font-bold text-blue-600">{player.avg_three_dart.toFixed(2)}</span>
                    {player.trends.performance === 'up' ? 
                      <TrendingUp className="h-4 w-4 text-emerald-500" /> : 
                      player.trends.performance === 'down' ? 
                      <TrendingUp className="h-4 w-4 text-red-500 rotate-180" /> : 
                      <Activity className="h-4 w-4 text-slate-400" />
                    }
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    <span>Matches: {player.total_matches}</span> • <span>180s: {player.total_180s}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedPlayer(player)}
                  className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4 text-blue-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlayers.slice(0, 20).map((player) => (
            <div key={player.id} className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {player.name.charAt(0)}
                    </div>
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      player.position <= 3 ? 'bg-amber-500' : 'bg-blue-500'
                    }`}>
                      {player.position}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-slate-900">{player.name}</h3>
                    <p className="text-sm text-slate-500">{player.team}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{player.avg_three_dart.toFixed(2)}</div>
                    <div className="text-xs text-slate-500">3-Dart Avg</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">{player.win_rate_sets.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{player.total_180s}</div>
                    <div className="text-xs text-slate-500">180s</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {player.trends.performance === 'up' ? 
                      <TrendingUp className="h-4 w-4 text-emerald-500" /> : 
                      player.trends.performance === 'down' ? 
                      <TrendingUp className="h-4 w-4 text-red-500 rotate-180" /> : 
                      <Activity className="h-4 w-4 text-slate-400" />
                    }
                    <button
                      onClick={() => setSelectedPlayer(player)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredPlayers.length > (viewMode === 'grid' ? 12 : 20) && (
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
            Load More Players
          </button>
        </div>
      )}

      {/* Individual Player Card Modal */}
      {selectedPlayer && (
        <IndividualPlayerCard
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  )
}
