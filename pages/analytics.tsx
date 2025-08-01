import { useEffect, useState } from 'react'
import { getPlayerStats, getTournaments } from '@/lib/queries'
import { PlayerStat, Tournament } from '@/lib/supabase'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Target, Award } from 'lucide-react'
import StatCard from '@/components/StatCard'

export default function Analytics() {
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, tournamentsData] = await Promise.all([
          getPlayerStats(),
          getTournaments()
        ])

        setPlayerStats(statsData)
        setTournaments(tournamentsData)
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Prepare data for charts
  const tournamentAverages = tournaments.map(tournament => {
    const tournamentStats = playerStats.filter(stat => stat.tournament_id === tournament.tournament_id)
    const avgThreeDart = tournamentStats.length > 0 
      ? tournamentStats.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / tournamentStats.length
      : 0

    return {
      name: tournament.tournament_name,
      year: tournament.tournament_year,
      avg_three_dart: Math.round(avgThreeDart * 100) / 100,
      participants: tournamentStats.length
    }
  }).sort((a, b) => a.year - b.year)

  // Performance distribution data
  const performanceDistribution = playerStats.map(stat => ({
    three_dart_avg: stat.three_dart_avg,
    win_rate: stat.win_rate_sets * 100,
    player_name: stat.players?.player_name || 'Unknown'
  })).slice(0, 50)

  // Win rate distribution
  const winRateRanges = [
    { range: '0-20%', count: 0, color: '#ef4444' },
    { range: '21-40%', count: 0, color: '#f97316' },
    { range: '41-60%', count: 0, color: '#eab308' },
    { range: '61-80%', count: 0, color: '#22c55e' },
    { range: '81-100%', count: 0, color: '#059669' }
  ]

  playerStats.forEach(stat => {
    const winRate = stat.win_rate_sets * 100
    if (winRate <= 20) winRateRanges[0].count++
    else if (winRate <= 40) winRateRanges[1].count++
    else if (winRate <= 60) winRateRanges[2].count++
    else if (winRate <= 80) winRateRanges[3].count++
    else winRateRanges[4].count++
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Advanced Analytics & Insights
          </h1>
          <p className="text-xl text-gray-600">
            Deep dive into performance trends and statistical analysis
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Highest 3-Dart Average"
            value={Math.max(...playerStats.map(s => s.three_dart_avg)).toFixed(2)}
            icon={<TrendingUp className="h-8 w-8 text-green-500" />}
          />
          <StatCard
            title="Highest Finish"
            value={Math.max(...playerStats.map(s => s.high_finish))}
            icon={<Target className="h-8 w-8 text-yellow-500" />}
          />
          <StatCard
            title="Most 180s"
            value={Math.max(...playerStats.map(s => s.scores_180))}
            icon={<Award className="h-8 w-8 text-red-500" />}
          />
          <StatCard
            title="Total Unique Players"
            value={new Set(playerStats.map(s => s.player_id)).size}
            icon={<Users className="h-8 w-8 text-blue-500" />}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tournament Averages Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tournament Averages Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tournamentAverages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avg_three_dart" fill="#3b82f6" name="Average 3-Dart" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Win Rate Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Win Rate Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winRateRanges}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, count }) => `${range}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {winRateRanges.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Performance Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Distribution (3-Dart Avg vs Win Rate)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={performanceDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="three_dart_avg" name="3-Dart Average" />
                <YAxis dataKey="win_rate" name="Win Rate %" />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'win_rate' ? `${value}%` : value,
                    name === 'win_rate' ? 'Win Rate' : '3-Dart Average'
                  ]}
                  labelFormatter={(value) => `Player: ${performanceDistribution.find(d => d.three_dart_avg === value)?.player_name || 'Unknown'}`}
                />
                <Scatter dataKey="win_rate" fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average 3-Dart Avg:</span>
                <span className="font-bold text-blue-600">
                  {(playerStats.reduce((sum, s) => sum + s.three_dart_avg, 0) / playerStats.length).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Win Rate:</span>
                <span className="font-bold text-green-600">
                  {((playerStats.reduce((sum, s) => sum + s.win_rate_sets, 0) / playerStats.length) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total 180s:</span>
                <span className="font-bold text-red-600">
                  {playerStats.reduce((sum, s) => sum + s.scores_180, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Matches:</span>
                <span className="font-bold text-purple-600">
                  {playerStats.reduce((sum, s) => sum + s.match_played, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tournament Insights</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Tournaments:</span>
                <span className="font-bold text-blue-600">{tournaments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Players per Tournament:</span>
                <span className="font-bold text-green-600">
                  {Math.round(playerStats.length / tournaments.length)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Best Tournament Average:</span>
                <span className="font-bold text-yellow-600">
                  {Math.max(...tournamentAverages.map(t => t.avg_three_dart)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Most Participants:</span>
                <span className="font-bold text-purple-600">
                  {Math.max(...tournamentAverages.map(t => t.participants))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
