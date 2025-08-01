import { useEffect, useState } from 'react'
import { getPlayers, getPlayerStats } from '@/lib/queries'
import { Player, PlayerStat } from '@/lib/supabase'
import DataTable from '@/components/DataTable'
import Link from 'next/link'
import { Eye, Filter, X, AlertCircle } from 'lucide-react'

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

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null)
        setLoading(true)
        
        console.log('Starting to fetch players and stats...')
        
        const [playersData, statsData] = await Promise.all([
          getPlayers(),
          getPlayerStats()
        ])

        console.log('Players fetched:', playersData?.length || 0)
        console.log('Stats fetched:', statsData?.length || 0)

        if (!playersData || playersData.length === 0) {
          throw new Error('No players found in database')
        }

        if (!statsData || statsData.length === 0) {
          throw new Error('No player statistics found in database')
        }

        setPlayers(playersData)
        setPlayerStats(statsData)
        
        // Process the data immediately
        const processedData = processPlayerData(playersData, statsData)
        setFilteredStats(processedData)
        
      } catch (error: any) {
        console.error('Error in fetchData:', error)
        setError(error.message || 'Failed to load player data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const processPlayerData = (playersData: Player[], statsData: PlayerStat[]) => {
    try {
      console.log('Processing data for', playersData.length, 'players')
      
      const aggregatedStats = playersData.map(player => {
        const playerStatsArray = statsData.filter(stat => stat.player_id === player.player_id)
        
        if (playerStatsArray.length === 0) {
          return {
            player_id: player.player_id,
            player_name: player.player_name,
            tournaments: 0,
            avg_three_dart: 0,
            avg_first_9: 0,
            avg_win_rate_sets: 0,
            total_matches: 0,
            high_finish: 0,
            total_180s: 0,
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
        const avgWinRateSets = playerStatsArray.reduce((sum, stat) => sum + (stat.win_rate_sets || 0), 0) / playerStatsArray.length
        const highFinish = Math.max(...playerStatsArray.map(stat => stat.high_finish || 0))
        const total180s = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_180 || 0), 0)

        return {
          player_id: player.player_id,
          player_name: player.player_name,
          tournaments: playerStatsArray.length,
          avg_three_dart: Math.round(avgThreeDart * 100) / 100,
          avg_first_9: Math.round(avgFirstNine * 100) / 100,
          avg_win_rate_sets: Math.round(avgWinRateSets * 1000) / 10,
          total_matches: totalMatches,
          high_finish: highFinish === -Infinity ? 0 : highFinish,
          total_180s: total180s,
          totalScore,
          totalDarts
        }
      })

      console.log('Processed', aggregatedStats.length, 'player records')
      
      // Apply initial filtering and sorting
      return aggregatedStats
        .filter(player => player.total_matches >= minMatches)
        .sort((a, b) => b.avg_three_dart - a.avg_three_dart)
        
    } catch (error) {
      console.error('Error in processPlayerData:', error)
      throw new Error('Error processing player statistics')
    }
  }

  // Apply filters whenever filter values change
  useEffect(() => {
    if (players.length > 0 && playerStats.length > 0) {
      try {
        const processed = processPlayerData(players, playerStats)
        
        const filtered = processed.filter(player => {
          return (
            player.total_matches >= minMatches &&
            player.tournaments >= minTournaments &&
            player.avg_three_dart >= minAvgDarts &&
            player.avg_three_dart <= maxAvgDarts &&
            player.player_name.toLowerCase().includes(searchName.toLowerCase())
          )
        })
        
        setFilteredStats(filtered)
      } catch (error) {
        console.error('Error applying filters:', error)
      }
    }
  }, [minMatches, minTournaments, minAvgDarts, maxAvgDarts, searchName, players, playerStats])

  const clearFilters = () => {
    setMinMatches(0)
    setMinTournaments(0)
    setMinAvgDarts(0)
    setMaxAvgDarts(100)
    setSearchName('')
  }

  const columns: Column[] = [
    {
      key: 'player_name',
      label: 'Player Name',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">
            {row.total_darts > 0 ? `${row.total_score}/${row.total_darts}` : 'No data'}
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
      label: '3-Dart Avg',
      render: (value: number) => (
        <span className="font-semibold text-primary-600">{value.toFixed(2)}</span>
      )
    },
    {
      key: 'avg_first_9',
      label: 'First 9 Avg',
      render: (value: number) => value.toFixed(2)
    },
    {
      key: 'avg_win_rate_sets',
      label: 'Set Win Rate (%)',
      render: (value: number) => `${value.toFixed(1)}%`
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
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-600">Loading players...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-red-900">Error Loading Players</h2>
          <p className="text-red-600 mt-2 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  if (filteredStats.length === 0 && players.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-900">No Players Found</h2>
          <p className="text-gray-600 mt-2">There are no players in the database yet.</p>
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

      {/* Filter Section */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            </select>
          </div>

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
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              3-Dart Range
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
          <div className="text-sm text-gray-600">
            Showing {filteredStats.length} of {players.length} players
          </div>
        </div>
      </div>

      <div className="mt-8">
        <DataTable
          data={filteredStats}
          columns={columns}
          title="All Players"
        />
      </div>
    </div>
  )
}
