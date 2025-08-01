import { useEffect, useState } from 'react'
import { getPlayerStats, getTournaments } from '@/lib/queries'
import { PlayerStat, Tournament } from '@/lib/supabase'
import { Users, Target, Trophy, TrendingUp, BarChart3 } from 'lucide-react'
import StatCard from '@/components/StatCard'
import Chart from '@/components/Chart'

export default function Analytics() {
  const [data, setData] = useState<any>({
    totalPlayers: 0,
    totalMatches: 0,
    avgPerformance: 0,
    totalTournaments: 0,
    chartData: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [playerStats, tournaments] = await Promise.all([
          getPlayerStats(),
          getTournaments()
        ])

        const uniquePlayers = new Set(playerStats.map(stat => stat.player_id))
        const totalMatches = playerStats.reduce((sum, stat) => sum + stat.match_played, 0)
        const avgPerformance = playerStats.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / playerStats.length

        // Create chart data
        const chartData = tournaments.map(tournament => {
          const tournamentStats = playerStats.filter(stat => stat.tournament_id === tournament.tournament_id)
          const avg = tournamentStats.length > 0 
            ? tournamentStats.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / tournamentStats.length
            : 0
          
          return {
            name: tournament.tournament_name.substring(0, 15),
            performance: Math.round(avg * 100) / 100,
            participants: tournamentStats.length
          }
        })

        setData({
          totalPlayers: uniquePlayers.size,
          totalMatches,
          avgPerformance: Math.round(avgPerformance * 100) / 100,
          totalTournaments: tournaments.length,
          chartData
        })
      } catch (error) {
        console.error('Error fetching analytics data:', error)
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
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">Comprehensive performance analytics and insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Players"
          value={data.totalPlayers}
          icon={<Users className="h-6 w-6 text-blue-500" />}
        />
        <StatCard
          title="Total Matches"
          value={data.totalMatches.toLocaleString()}
          icon={<Target className="h-6 w-6 text-green-500" />}
        />
        <StatCard
          title="Avg Performance"
          value={data.avgPerformance}
          subtitle="3-Dart Average"
          icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
        />
        <StatCard
          title="Tournaments"
          value={data.totalTournaments}
          icon={<Trophy className="h-6 w-6 text-yellow-500" />}
        />
      </div>

      {/* Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tournament Performance</h3>
          <Chart data={data.chartData} type="bar" height={400} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trend</h3>
          <Chart data={data.chartData} type="line" height={400} />
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{data.totalPlayers}</div>
            <div className="text-sm text-gray-600">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">{data.totalMatches.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Matches Played</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{data.avgPerformance}</div>
            <div className="text-sm text-gray-600">Overall Average Performance</div>
          </div>
        </div>
      </div>
    </div>
  )
}
