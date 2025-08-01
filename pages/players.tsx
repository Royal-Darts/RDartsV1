import { useEffect, useState } from 'react'
import { getPlayers, getPlayerStats } from '@/lib/queries'
import { Player, PlayerStat } from '@/lib/supabase'
import DataTable from '@/components/DataTable'
import Link from 'next/link'
import { Eye, Users, Search, Filter, Award, TrendingUp } from 'lucide-react'

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('avg_three_dart')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
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
    // Aggregate player statistics
    let aggregatedStats = players.map(player => {
      const playerStatsArray = playerStats.filter(stat => stat.player_id === player.player_id)
      
      if (playerStatsArray.length === 0) {
        return {
          player_id: player.player_id,
          player_name: player.player_name,
          tournaments: 0,
          avg_three_dart: 0,
          avg_first_9: 0,
          avg_win_rate: 0,
          total_matches: 0,
          high_finish: 0,
          total_180s: 0
        }
      }

      const totalMatches = playerStatsArray.reduce((sum, stat) => sum + stat.match_played, 0)
      const avgThreeDart = playerStatsArray.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / playerStatsArray.length
      const avgFirstNine = playerStatsArray.reduce((sum, stat) => sum + stat.first_9_avg, 0) / playerStatsArray.length
      const avgWinRate = playerStatsArray.reduce((sum, stat) => sum + stat.win_rate_sets, 0) / playerStatsArray.length
      const highFinish = Math.max(...playerStatsArray.map(stat => stat.high_finish))
      const total180s = playerStatsArray.reduce((sum, stat) => sum + stat.scores_180, 0)

      return {
        player_id: player.player_id,
        player_name: player.player_name,
        tournaments: playerStatsArray.length,
        avg_three_dart: Math.round(avgThreeDart * 100) / 100,
        avg_first_9: Math.round(avgFirstNine * 100) / 100,
        avg_win_rate: Math.round(avgWinRate * 1000) / 10,
        total_matches: totalMatches,
        high_finish: highFinish,
        total180s
      }
    })

    // Apply search filter
    if (searchTerm) {
      aggregatedStats = aggregatedStats.filter(player =>
        player.player_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    aggregatedStats.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a] || 0
      const bValue = b[sortBy as keyof typeof b] || 0
      
      if (sortOrder === 'desc') {
        return Number(bValue) - Number(aValue)
      }
      return Number(aValue) - Number(bValue)
    })

    setFilteredPlayers(aggregatedStats)
  }, [players, playerStats, searchTerm, sortBy, sortOrder])

  const columns = [
    {
      key: 'rank',
      label: '#',
      render: (value: any, row: any, index: number) => (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
          index < 3 ? (index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600') : 'bg-blue-500'
        }`}>
          {index + 1}
        </div>
      )
    },
    {
      key: 'player_name',
      label: 'Player Name',
      render: (value: string, row: any) => (
        <div className="font-medium text-gray-900 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
            {value.charAt(0).toUpperCase()}
          </div>
          {value}
        </div>
      )
    },
    {
      key: 'tournaments',
      label: 'Tournaments',
      render: (value: number) => (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          {value}
        </span>
      )
    },
    {
      key: 'total_matches',
      label: 'Matches',
      render: (value: number) => value.toLocaleString()
    },
    {
      key: 'avg_three_dart',
      label: '3-Dart Avg',
      render: (value: number) => (
        <span className={`font-bold ${value >= 50 ? 'text-green-600' : value >= 40 ? 'text-blue-600' : 'text-gray-600'}`}>
          {value.toFixed(2)}
        </span>
      )
    },
    {
      key: 'avg_first_9',
      label: 'First 9 Avg',
      render: (value: number) => (
        <span className="font-semibold text-purple-600">{value.toFixed(2)}</span>
      )
    },
    {
      key: 'avg_win_rate',
      label: 'Win Rate (%)',
      render: (value: number) => (
        <div className="flex items-center">
          <span className={`font-medium ${value >= 70 ? 'text-green-600' : value >= 50 ? 'text-blue-600' : 'text-red-600'}`}>
            {value}%
          </span>
          <div className="ml-2 w-12 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${value >= 70 ? 'bg-green-500' : value >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(value, 100)}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'high_finish',
      label: 'High Finish',
      render: (value: number) => (
        <span className={`font-bold px-2 py-1 rounded ${value >= 100 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>
          {value}
        </span>
      )
    },
    {
      key: 'total_180s',
      label: '180s',
      render: (value: number) => (
        <span className="font-bold text-red-600">{value}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <Link
          href={`/players/${row.player_id}`}
          className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-sm"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Link>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Player Rankings & Statistics
          </h1>
          <p className="text-xl text-gray-600">
            Complete performance analysis of all {players.length} players
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="avg_three_dart">3-Dart Average</option>
                <option value="avg_first_9">First 9 Average</option>
                <option value="avg_win_rate">Win Rate</option>
                <option value="high_finish">High Finish</option>
                <option value="total_matches">Total Matches</option>
                <option value="tournaments">Tournaments</option>
                <option value="total_180s">Total 180s</option>
              </select>
            </div>
            
            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="desc">Highest First</option>
                <option value="asc">Lowest First</option>
              </select>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{filteredPlayers.length}</div>
              <div className="text-sm text-blue-600">Players Found</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredPlayers.reduce((sum, p) => sum + p.total_matches, 0).toLocaleString()}
              </div>
              <div className="text-sm text-green-600">Total Matches</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(filteredPlayers.reduce((sum, p) => sum + p.avg_three_dart, 0) / filteredPlayers.length * 100) / 100}
              </div>
              <div className="text-sm text-purple-600">Avg 3-Dart</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.max(...filteredPlayers.map(p => p.high_finish))}
              </div>
              <div className="text-sm text-yellow-600">Best Finish</div>
            </div>
          </div>
        </div>

        {/* Players Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Award className="h-6 w-6 mr-2" />
              Player Rankings & Statistics
            </h3>
            <p className="text-blue-100 mt-1">
              {filteredPlayers.length} players • Sorted by {sortBy.replace('_', ' ')} ({sortOrder === 'desc' ? 'highest first' : 'lowest first'})
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlayers.map((row, index) => (
                  <tr key={row.player_id} className={`hover:bg-gray-50 transition-colors ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''}`}>
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                        {column.render ? column.render(row[column.key], row, index) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
