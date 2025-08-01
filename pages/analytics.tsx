import { useEffect, useState } from 'react'
import { getPlayerStats, getTournaments, getTeams } from '@/lib/queries'
import { PlayerStat, Tournament, Team } from '@/lib/supabase'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

export default function Analytics() {
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, tournamentsData, teamsData] = await Promise.all([
          getPlayerStats(),
          getTournaments(),
          getTeams()
        ])

        setPlayerStats(statsData || [])
        setTournaments(tournamentsData || [])
        setTeams(teamsData || [])
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Tournament participation trends
  const tournamentTrends = tournaments.map(tournament => {
    const tournamentStats = playerStats.filter(stat => stat.tournament_id === tournament.tournament_id)
    
    const validThreeDartAvgs = tournamentStats
      .map(stat => stat.three_dart_avg)
      .filter(avg => avg !== null && avg !== undefined && !isNaN(avg))
    
    const validFirst9Avgs = tournamentStats
      .map(stat => stat.first_9_avg)
      .filter(avg => avg !== null && avg !== undefined && !isNaN(avg))

    const avgThreeDart = validThreeDartAvgs.length > 0 
      ? validThreeDartAvgs.reduce((sum, avg) => sum + avg, 0) / validThreeDartAvgs.length
      : 0
    
    const avgFirst9 = validFirst9Avgs.length > 0 
      ? validFirst9Avgs.reduce((sum, avg) => sum + avg, 0) / validFirst9Avgs.length
      : 0

    return {
      name: tournament.tournament_name || 'Unknown Tournament',
      year: tournament.tournament_year || 0,
      avg_three_dart: Math.round(avgThreeDart * 100) / 100,
      avg_first_9: Math.round(avgFirst9 * 100) / 100,
      participants: tournamentStats.length
    }
  }).sort((a, b) => (a.year || 0) - (b.year || 0))

  // 3-Dart Average Distribution
  const threeDartRanges = [
    { range: '60+', min: 60, max: 100, count: 0 },
    { range: '50-59', min: 50, max: 59.99, count: 0 },
    { range: '40-49', min: 40, max: 49.99, count: 0 },
    { range: '30-39', min: 30, max: 39.99, count: 0 },
    { range: '20-29', min: 20, max: 29.99, count: 0 },
    { range: '<20', min: 0, max: 19.99, count: 0 }
  ]

  playerStats.forEach(stat => {
    const threeDartAvg = stat.three_dart_avg
    if (threeDartAvg !== null && threeDartAvg !== undefined && !isNaN(threeDartAvg)) {
      const range = threeDartRanges.find(r => threeDartAvg >= r.min && threeDartAvg <= r.max)
      if (range) range.count++
    }
  })

  // First 9 Average Distribution
  const first9Ranges = [
    { range: '70+', min: 70, max: 100, count: 0 },
    { range: '60-69', min: 60, max: 69.99, count: 0 },
    { range: '50-59', min: 50, max: 59.99, count: 0 },
    { range: '40-49', min: 40, max: 49.99, count: 0 },
    { range: '30-39', min: 30, max: 39.99, count: 0 },
    { range: '<30', min: 0, max: 29.99, count: 0 }
  ]

  playerStats.forEach(stat => {
    const first9Avg = stat.first_9_avg
    if (first9Avg !== null && first9Avg !== undefined && !isNaN(first9Avg)) {
      const range = first9Ranges.find(r => first9Avg >= r.min && first9Avg <= r.max)
      if (range) range.count++
    }
  })

  // Top Win Rates (Min 4 matches played)
  const topWinRates = playerStats
    .filter(stat => 
      stat.win_rate_sets && 
      stat.win_rate_sets > 0 && 
      stat.match_played && 
      stat.match_played >= 4
    )
    .sort((a, b) => (b.win_rate_sets || 0) - (a.win_rate_sets || 0))
    .slice(0, 10)
    .map(stat => ({
      player_name: stat.players?.player_name || 'Unknown',
      team_name: stat.teams?.team_name || 'Unknown',
      tournament: stat.tournaments?.tournament_name || 'Unknown',
      matches: stat.match_played || 0,
      value: Math.round((stat.win_rate_sets || 0) * 1000) / 10
    }))

  // Calculate statistics with null safety
  const validThreeDartAvgs = playerStats
    .map(s => s.three_dart_avg)
    .filter(avg => avg !== null && avg !== undefined && !isNaN(avg))
  
  const validHighFinishes = playerStats
    .map(s => s.high_finish)
    .filter(finish => finish !== null && finish !== undefined && !isNaN(finish))
  
  const valid180s = playerStats
    .map(s => s.scores_180)
    .filter(scores => scores !== null && scores !== undefined && !isNaN(scores))
  
  const validMatches = playerStats
    .map(s => s.match_played)
    .filter(matches => matches !== null && matches !== undefined && !isNaN(matches))

  const highestThreeDart = validThreeDartAvgs.length > 0 ? Math.max(...validThreeDartAvgs) : 0
  const highestFinish = validHighFinishes.length > 0 ? Math.max(...validHighFinishes) : 0
  const total180s = valid180s.reduce((sum, scores) => sum + scores, 0)
  const totalMatches = validMatches.reduce((sum, matches) => sum + matches, 0)

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
          <h1 className="text-2xl font-semibold text-gray-900">Advanced Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            Comprehensive statistical analysis with detailed insights
          </p>
        </div>
      </div>

      {/* Key Insights Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Highest 3-Dart Avg</h3>
          <p className="text-3xl font-bold">
            {highestThreeDart.toFixed(2)}
          </p>
          <p className="text-sm opacity-90">Across all tournaments</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Total 180s Hit</h3>
          <p className="text-3xl font-bold">
            {total180s}
          </p>
          <p className="text-sm opacity-90">Across all matches</p>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Highest Finish</h3>
          <p className="text-3xl font-bold">
            {highestFinish}
          </p>
          <p className="text-sm opacity-90">Best checkout recorded</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Total Matches</h3>
          <p className="text-3xl font-bold">
            {totalMatches}
          </p>
          <p className="text-sm opacity-90">Across all tournaments</p>
        </div>
      </div>

      {/* Top Win Rates Table (Min 4 Matches) */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🏆 Top 10 Win Rates (Min 4 Matches)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Matches</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topWinRates.map((player, index) => (
                <tr key={index}>
                  <td className="px-3 py-2 text-sm">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' : 
                      index === 1 ? 'bg-gray-400 text-white' : 
                      index === 2 ? 'bg-amber-600 text-white' : 
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <div className="font-medium text-gray-900">{player.player_name}</div>
                    <div className="text-gray-500 text-xs">{player.team_name}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {player.matches}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm font-semibold text-green-600">
                    {player.value.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tournament Trends Chart */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">📈 Tournament Performance Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tournamentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="avg_three_dart" stroke="#3b82f6" strokeWidth={3} name="Avg 3-Dart" />
              <Line dataKey="avg_first_9" stroke="#10b981" strokeWidth={2} name="Avg First 9" />
              <Line dataKey="participants" stroke="#f59e0b" strokeWidth={2} name="Participants" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3-Dart Average Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📊 3-Dart Average Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={threeDartRanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* First 9 Average Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🎯 First 9 Average Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={first9Ranges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tournament Participation Table */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Tournament Participation Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tournament</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg 3-Dart</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg First 9</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tournamentTrends.map((tournament, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{tournament.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{tournament.year}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{tournament.participants}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-primary-600">{tournament.avg_three_dart}</td>
                  <td className="px-6 py-4 text-sm text-green-600">{tournament.avg_first_9}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
