import { useEffect, useState } from 'react'
import { getPlayers, getPlayerStats } from '@/lib/queries'
import { Player, PlayerStat } from '@/lib/supabase'
import DataTable from '@/components/DataTable'
import Link from 'next/link'
import { Eye } from 'lucide-react'

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
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

  // Aggregate player statistics
  const aggregatedStats = players.map(player => {
    const playerStatsArray = playerStats.filter(stat => stat.player_id === player.player_id)
    
    if (playerStatsArray.length === 0) {
      return {
        player_id: player.player_id,
        player_name: player.player_name,
        tournaments: 0,
        avg_three_dart: 0,
        avg_win_rate: 0,
        total_matches: 0,
        high_finish: 0
      }
    }

    const totalMatches = playerStatsArray.reduce((sum, stat) => sum + stat.match_played, 0)
    const avgThreeDart = playerStatsArray.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / playerStatsArray.length
    const avgWinRate = playerStatsArray.reduce((sum, stat) => sum + stat.win_rate_sets, 0) / playerStatsArray.length
    const highFinish = Math.max(...playerStatsArray.map(stat => stat.high_finish))

    return {
      player_id: player.player_id,
      player_name: player.player_name,
      tournaments: playerStatsArray.length,
      avg_three_dart: Math.round(avgThreeDart * 100) / 100,
      avg_win_rate: Math.round(avgWinRate * 1000) / 10,
      total_matches: totalMatches,
      high_finish: highFinish
    }
  })

  const columns = [
    {
    key: 'player_name',
    label: 'Player Name',
    render: (value: string, row: any) => (
      <div className="font-medium text-gray-900">{value}</div>
    )
    },
    {
      key: 'tournaments',
      label: 'Tournaments'
    },
    {
      key: 'total_matches',
      label: 'Total Matches'
    },
    {
      key: 'avg_three_dart',
      label: 'Avg 3-Dart'
    },
    {
      key: 'avg_win_rate',
      label: 'Avg Win Rate (%)'
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

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Players</h1>
          <p className="mt-2 text-sm text-gray-700">
            Complete list of all players and their aggregated statistics
          </p>
        </div>
      </div>

      <div className="mt-8">
        <DataTable
          data={aggregatedStats.sort((a, b) => b.avg_three_dart - a.avg_three_dart)}
          columns={columns}
          title={`All Players (${players.length} total)`}
        />
      </div>
    </div>
  )
}
