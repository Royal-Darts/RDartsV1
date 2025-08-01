import { useEffect, useState } from 'react'
import { getTournaments, getTopPerformers, getPlayerStats } from '@/lib/queries'
import { Tournament, PlayerStat } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import Chart from '@/components/Chart'
import { Users, Target, Trophy, TrendingUp, Award } from 'lucide-react'

export default function Dashboard() {
  const [data, setData] = useState<any>({
    totalPlayers: 0,
    totalMatches: 0,
    avgPerformance: 0,
    topPerformers: [],
    trendData: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [tournaments, topPerformers, allStats] = await Promise.all([
          getTournaments(),
          getTopPerformers('three_dart_avg', 10),
          getPlayerStats()
        ])

        // Filter out excluded players
        const excludedPlayers = ['Anjana Rustagi', 'Sai Agarwal']
        const filteredPerformers = topPerformers.filter(
          stat => !excludedPlayers.includes(stat.players?.player_name || '')
        )

        const uniquePlayers = new Set(allStats.map(stat => stat.player_id))
        const totalMatches = allStats.reduce((sum, stat) => sum + stat.match_played, 0)
        const avgPerformance = allStats.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / allStats.length

        // Trend data
        const trendData = tournaments.map(tournament => {
          const tournamentStats = allStats.filter(stat => stat.tournament_id === tournament.tournament_id)
          const avg = tournamentStats.length > 0 
            ? tournamentStats.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / tournamentStats.length
            : 0
          
          return {
            name: tournament.tournament_name.substring(0, 10),
            performance: Math.round(avg * 100) / 100
          }
        })

        setData({
          totalPlayers: uniquePlayers.size,
          totalMatches,
          avgPerformance: Math.round(avgPerformance * 100) / 100,
          topPerformers: filteredPerformers,
          trendData
        })
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Royal Darts Dashboard</h1>
        <p className="mt-2 text-gray-600">Tournament performance analytics and insights</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Players"
          value={data.totalPlayers}
          icon={<Users className="h-6 w-6 text-blue-600" />}
        />
        <StatCard
          title="Total Matches"
          value={data.totalMatches.toLocaleString()}
          icon={<Target className="h-6 w-6 text-green-600" />}
        />
        <StatCard
          title="Avg Performance"
          value={data.avgPerformance}
          subtitle="3-Dart Average"
          icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
        />
        <StatCard
          title="Tournaments"
          value="8"
          icon={<Trophy className="h-6 w-6 text-yellow-600" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trend</h3>
          <Chart data={data.trendData} type="line" height={300} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {data.topPerformers.slice(0, 5).map((player: PlayerStat, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium text-gray-900">{player.players?.player_name}</p>
                  <p className="text-sm text-gray-500">{player.teams?.team_name}</p>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {player.three_dart_avg.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Elite Leaderboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">3-Dart Avg</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Win Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topPerformers.map((player: PlayerStat, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{player.players?.player_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">{player.teams?.team_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-green-600">
                      {player.three_dart_avg.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(player.win_rate_sets * 100).toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
