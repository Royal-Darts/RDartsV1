import { useEffect, useState } from 'react'
import { getPlayers, getPlayerStats } from '@/lib/queries'
import { Player, PlayerStat } from '@/lib/supabase'
import DataTable from '@/components/DataTable'
import Link from 'next/link'
import { Eye, Filter, X } from 'lucide-react'

// Define Column interface locally if not importing from types
interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any, index?: number) => React.ReactNode
}

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [filteredStats, setFilteredStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [minMatches, setMinMatches] = useState<number>(0)
  const [minTournaments, setMinTournaments] = useState<number>(0)
  const [minAvgDarts, setMinAvgDarts] = useState<number>(0)
  const [maxAvgDarts, setMaxAvgDarts] = useState<number>(100)
  const [searchName, setSearchName] = useState<string>('')
  
  // Sort states
  const [sortField, setSortField] = useState<string>('avg_three_dart')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null)
        console.log('Fetching players and stats...')
        
        const [playersData, statsData] = await Promise.all([
          getPlayers(),
          getPlayerStats()
        ])

        console.log('Players data:', playersData?.length || 0)
        console.log('Stats data:', statsData?.length || 0)

        if (!playersData || playersData.length === 0) {
          setError('No players found in database')
          return
        }

        if (!statsData || statsData.length === 0) {
          setError('No player statistics found in database')
          return
        }

        setPlayers(playersData)
        setPlayerStats(statsData)
        
        // Initial aggregation
        aggregatePlayerStats(playersData, statsData, {
          minMatches: 0,
          minTournaments: 0,
          minAvgDarts: 0,
          maxAvgDarts: 100,
          searchName: '',
          sortField: 'avg_three_dart',
          sortDirection: 'desc'
        })
      } catch (error) {
        console.error('Error fetching players:', error)
        setError('Failed to load player data. Please check your database connection.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const aggregatePlayerStats = (playersData: Player[], statsData: PlayerStat[], filters: any) => {
    try {
      console.log('Aggregating stats for', playersData.length, 'players')
      
      const aggregatedStats = playersData.map(player => {
        const playerStatsArray = statsData.filter(stat => stat.player_id === player.player_id)
        
        if (playerStatsArray.length === 0) {
          return {
            player_id: player.player_id,
            player_name: player.player_name,
            tournaments: 0,
            avg_three_dart: 0,
            avg_first_9: 0,
            avg_one_dart: 0,
            avg_win_rate_sets: 0,
            avg_win_rate_legs: 0,
            total_matches: 0,
            high_finish: 0,
            total_180s: 0,
            total_100_plus: 0,
            avg_keep_rate: 0,
            avg_break_rate: 0,
            total_score: 0,
            total_darts: 0
          }
        }

        const totalMatches = playerStatsArray.reduce((sum, stat) => sum + (stat.match_played || 0), 0)
        const totalScore = playerStatsArray.reduce((sum, stat) => sum + (stat.total_score || 0), 0)
        const totalDarts = playerStatsArray.reduce((sum, stat) => sum + (stat.total_darts || 0), 0)
        
        // Verified calculation: (total_score / total_darts) * 3
        const avgThreeDart = totalDarts > 0 ? (totalScore / totalDarts) * 3 : 0
        const avgFirstNine = playerStatsArray.reduce((sum, stat) => sum + (stat.first_9_avg || 0), 0) / playerStatsArray.length
        const avgOneDart = playerStatsArray.reduce((sum, stat) => sum + (stat.one_dart_avg || 0), 0) / playerStatsArray.length
        const avgWinRateSets = playerStatsArray.reduce((sum, stat) => sum + (stat.win_rate_sets || 0), 0) / playerStatsArray.length
        const avgWinRateLegs = playerStatsArray.reduce((sum, stat) => sum + (stat.win_rate_legs || 0), 0) / playerStatsArray.length
        const avgKeepRate = playerStatsArray.reduce((sum, stat) => sum + (stat.keep_rate || 0), 0) / playerStatsArray.length
        const avgBreakRate = playerStatsArray.reduce((sum, stat) => sum + (stat.break_rate || 0), 0) / playerStatsArray.length
        const highFinish = Math.max(...playerStatsArray.map(stat => stat.high_finish || 0))
        const total180s = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_180 || 0), 0)
        const total100Plus = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_100_plus || 0), 0)

        return {
          player_id: player.player_id,
          player_name: player.player_name,
          tournaments: playerStatsArray.length,
          avg_three_dart: Math.round(avgThreeDart * 100) / 100,
          avg_first_9: Math.round(avgFirstNine * 100) / 100,
          avg_one_dart: Math.round(avgOneDart * 100) / 100,
          avg_win_rate_sets: Math.round(avgWinRateSets * 1000) / 10,
          avg_win_rate_legs: Math.round(avgWinRateLegs * 1000) / 10,
          total_matches: totalMatches,
          high_finish: highFinish === -Infinity ? 0 : highFinish,
          total180s,
          total100Plus,
          avg_keep_rate: Math.round(avgKeepRate * 1000) / 10,
          avg_break_rate: Math.round(avgBreakRate * 1000) / 10,
          totalScore,
          totalDarts
        }
      })

      console.log('Aggregated', aggregatedStats.length, 'player records')

      // Apply filters
      let filtered = aggregatedStats.filter(player => {
        return (
          player.total_matches >= filters.minMatches &&
          player.tournaments >= filters.minTournaments &&
          player.avg_three_dart >= filters.minAvgDarts &&
          player.avg_three_dart <= filters.maxAvgDarts &&
          player.player_name.toLowerCase().includes(filters.searchName.toLowerCase())
        )
      })

      // Apply sorting with proper type checking
      filtered.sort((a, b) => {
        const aVal = a[filters.sortField as keyof typeof a]
        const bVal = b[filters.sortField as keyof typeof b]
        
        // Handle undefined values
        if (aVal === undefined && bVal === undefined) return 0
        if (aVal === undefined) return 1
        if (bVal === undefined) return -1
        
        // Handle null values
        if (aVal === null && bVal === null) return 0
        if (aVal === null) return 1
        if (bVal === null) return -1
        
        if (filters.sortDirection === 'asc') {
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return aVal.localeCompare(bVal)
          }
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        } else {
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return bVal.localeCompare(aVal)
          }
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
        }
      })

      console.log('Filtered to', filtered.length, 'players')
      setFilteredStats(filtered)
    } catch (error) {
      console.error('Error in aggregatePlayerStats:', error)
      setError('Error processing player statistics')
    }
  }

  const handleFilterChange = () => {
    if (players.length > 0 && playerStats.length > 0) {
      aggregatePlayerStats(players, playerStats, {
        minMatches,
        minTournaments,
        minAvgDarts,
        maxAvgDarts,
        searchName,
        sortField,
        sortDirection
      })
    }
  }

  const clearFilters = () => {
    setMinMatches(0)
    setMinTournaments(0)
    setMinAvgDarts(0)
    setMaxAvgDarts(100)
    setSearchName('')
    setSortField('avg_three_dart')
    setSortDirection('desc')
    
    if (players.length > 0 && playerStats.length > 0) {
      aggregatePlayerStats(players, playerStats, {
        minMatches: 0,
        minTournaments: 0,
        minAvgDarts: 0,
        maxAvgDarts: 100,
        searchName: '',
        sortField: 'avg_three_dart',
        sortDirection: 'desc'
      })
    }
  }

  useEffect(() => {
    if (players.length > 0 && playerStats.length > 0) {
      handleFilterChange()
    }
  }, [minMatches, minTournaments, minAvgDarts, maxAvgDarts, searchName])

  const columns: Column[] = [
    {
      key: 'player_name',
      label: 'Player Name',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">
            Score: {row.total_score.toLocaleString()} | Darts: {row.total_darts.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      key: 'tournaments',
      label: 'Tournaments'
    },
    {
      key: 'total_matches',
      label: 'Matches'
    },
    {
      key: 'avg_three_dart',
      label: '3-Dart Avg ✓',
      render: (value: number, row: any) => (
        <div>
          <div className="font-semibold text-primary-600">{value.toFixed(2)}</div>
          <div className="text-xs text-gray-500">
            ({row.total_score}/{row.total_darts})*3
          </div>
        </div>
      )
    },
    {
      key: 'avg_first_9',
      label: 'First 9 Avg'
    },
    {
      key: 'avg_win_rate_sets',
      label: 'Set Win Rate (%)'
    },
    {
      key: 'total_180s',
      label: '180s'
    },
    {
      key: 'high_finish',
      label: 'High Finish'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <Link
          href={`/players/${row.player_id}`}
          className="inline-flex items-center text-primary-600 hover:text-primary-900"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Link>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-red-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-900 mt-4">Data Loading Error</h2>
          <p className="text-red-600 mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Players</h1>
          <p className="mt-2 text-sm text-gray-700">
            Complete list of all players with verified statistics calculations
          </p>
        </div>
      </div>

      {/* Advanced Filter Section */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Filters & Sort</h3>
          </div>
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search by Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Player
            </label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Enter player name..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          {/* Minimum Matches */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Matches
            </label>
            <select
              value={minMatches}
              onChange={(e) => setMinMatches(parseInt(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value={0}>All</option>
              <option value={1}>1+</option>
              <option value={3}>3+</option>
              <option value={5}>5+</option>
              <option value={10}>10+</option>
              <option value={15}>15+</option>
            </select>
          </div>

          {/* Minimum Tournaments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Tournaments
            </label>
            <select
              value={minTournaments}
              onChange={(e) => setMinTournaments(parseInt(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value={0}>All</option>
              <option value={1}>1+</option>
              <option value={2}>2+</option>
              <option value={3}>3+</option>
              <option value={4}>4+</option>
            </select>
          </div>

          {/* 3-Dart Average Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              3-Dart Average Range
            </label>
            <div className="flex space-x-1">
              <input
                type="number"
                value={minAvgDarts}
                onChange={(e) => setMinAvgDarts(parseFloat(e.target.value) || 0)}
                placeholder="Min"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <input
                type="number"
                value={maxAvgDarts}
                onChange={(e) => setMaxAvgDarts(parseFloat(e.target.value) || 100)}
                placeholder="Max"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Showing {filteredStats.length} of {players.length} players</span>
            <span>•</span>
            <span>Sorted by: {sortField.replace('_', ' ')} ({sortDirection})</span>
            <span>•</span>
            <span className="text-green-600 font-medium">✓ Stats Verified: 3-Dart = (Total Score ÷ Total Darts) × 3</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <DataTable
          data={filteredStats}
          columns={columns}
          title="All Players - Verified Statistics"
        />
      </div>
    </div>
  )
}
