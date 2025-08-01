import { useEffect, useState } from 'react'
import { getPlayerStats, getTournaments, getTeams } from '@/lib/queries'
import { PlayerStat, Tournament, Team } from '@/lib/supabase'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

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

  // Tournament participation trends with null safety
  const tournamentTrends = tournaments.map(tournament => {
    const tournamentStats = playerStats.filter(stat => stat.tournament_id === tournament.tournament_id)
    
    // Filter out null/undefined values for calculations
    const validThreeDartAvgs = tournamentStats
      .map(stat => stat.three_dart_avg)
      .filter(avg => avg !== null && avg !== undefined && !isNaN(avg))
    
    const validFirst9Avgs = tournamentStats
      .map(stat => stat.first_9_avg)
      .filter(avg => avg !== null && avg !== undefined && !isNaN(avg))
    
    const validWinRates = tournamentStats
      .map(stat => stat.win_rate_sets)
      .filter(rate => rate !== null && rate !== undefined && !isNaN(rate))

    const avgThreeDart = validThreeDartAvgs.length > 0 
      ? validThreeDartAvgs.reduce((sum, avg) => sum + avg, 0) / validThreeDartAvgs.length
      : 0
    
    const avgFirst9 = validFirst9Avgs.length > 0 
      ? validFirst9Avgs.reduce((sum, avg) => sum + avg, 0) / validFirst9Avgs.length
      : 0
    
    const total180s = tournamentStats.reduce((sum, stat) => sum + (stat.scores_180 || 0), 0)
    
    const avgWinRate = validWinRates.length > 0 
      ? validWinRates.reduce((sum, rate) => sum + rate, 0) / validWinRates.length * 100
      : 0

    return {
      name: tournament.tournament_name || 'Unknown Tournament',
      year: tournament.tournament_year || 0,
      avg_three_dart: Math.round(avgThreeDart * 100) / 100,
      avg_first_9: Math.round(avgFirst9 * 100) / 100,
      participants: tournamentStats.length,
      total_180s: total180s,
      avg_win_rate: Math.round(avgWinRate * 10) / 10
    }
  }).sort((a, b) => (a.year || 0) - (b.year || 0))

  // Performance distribution by 3-dart average ranges with null safety
  const performanceRanges = [
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
      const range = performanceRanges.find(r => threeDartAvg >= r.min && threeDartAvg <= r.max)
      if (range) range.count++
    }
  })

  // Team performance comparison with null safety
  const teamPerformance = teams.slice(0, 8).map(team => {
    const teamStats = playerStats.filter(stat => stat.team_id === team.team_id)
    if (teamStats.length === 0) return null

    // Filter out null/undefined values
    const validThreeDartAvgs = teamStats
      .map(stat => stat.three_dart_avg)
      .filter(avg => avg !== null && avg !== undefined && !isNaN(avg))
    
    const validWinRates = teamStats
      .map(stat => stat.win_rate_sets)
      .filter(rate => rate !== null && rate !== undefined && !isNaN(rate))

    const avgThreeDart = validThreeDartAvgs.length > 0
      ? validThreeDartAvgs.reduce((sum, avg) => sum + avg, 0) / validThreeDartAvgs.length
      : 0
    
    const avgWinRate = validWinRates.length > 0
      ? validWinRates.reduce((sum, rate) => sum + rate, 0) / validWinRates.length * 100
      : 0
    
    const total180s = teamStats.reduce((sum, stat) => sum + (stat.scores_180 || 0), 0)
    const playerCount = new Set(teamStats.map(stat => stat.player_id)).size

    return {
      team_name: team.team_name || 'Unknown Team',
      avg_three_dart: Math.round(avgThreeDart * 100) / 100,
      avg_win_rate: Math.round(avgWinRate * 10) / 10,
      total180s,
      player_count: playerCount
    }
  }).filter(team => team !== null).sort((a, b) => (b?.avg_three_dart || 0) - (a?.avg_three_dart || 0))

  // High finish analysis with null safety
  const finishRanges = [
    { range: '150+', min: 150, max: 180, count: 0 },
    { range: '120-149', min: 120, max: 149, count: 0 },
    { range: '100-119', min: 100, max: 119, count: 0 },
    { range: '80-99', min: 80, max: 99, count: 0 },
    { range: '<80', min: 0, max: 79, count: 0 }
  ]

  playerStats.forEach(stat => {
    const highFinish = stat.high_finish
    if (highFinish !== null && highFinish !== undefined && !isNaN(highFinish) && highFinish > 0) {
      const range = finishRanges.find(r => highFinish >= r.min && highFinish <= r.max)
      if (range) range.count++
    }
  })

  // Player efficiency analysis with null safety
  const efficiencyData = playerStats
    .filter(stat => 
      stat.match_played && 
      stat.match_played > 0 && 
      stat.three_dart_avg !== null && 
      stat.three_dart_avg !== undefined && 
      !isNaN(stat.three_dart_avg) &&
      stat.scores_180 !== null &&
      stat.scores_180 !== undefined
    )
    .map(stat => ({
      player_name: stat.players?.player_name || 'Unknown',
      three_dart_avg: stat.three_dart_avg || 0,
      efficiency: stat.match_played > 0 ? (stat.scores_180 || 0) / stat.match_played : 0,
      total_matches: stat.match_played || 0
    }))
    .filter(data => data.total_matches >= 3) // Only players with 3+ matches
    .sort((a, b) => (b?.efficiency || 0) - (a?.efficiency || 0))
    .slice(0, 20)

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
            Comprehensive statistical analysis and performance insights
          </p>
        </div>
      </div>

      {/* Tournament Trends */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tournament Performance Trends</h3>
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

      {/* Performance Distribution */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">3-Dart Average Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceRanges}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count, percent }) => `${range}: ${count} (${((percent || 0) * 100).toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {performanceRanges.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">High Finish Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finishRanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Comparison */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Team Performance Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teamPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="team_name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg_three_dart" fill="#3b82f6" name="Avg 3-Dart" />
              <Bar dataKey="avg_win_rate" fill="#10b981" name="Avg Win Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Player Efficiency Analysis */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Player Efficiency: 180s per Match vs 3-Dart Average</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={efficiencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="three_dart_avg" name="3-Dart Average" />
              <YAxis dataKey="efficiency" name="180s per Match" />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  typeof value === 'number' ? value.toFixed(2) : value,
                  name === 'efficiency' ? '180s per Match' : '3-Dart Average'
                ]}
                labelFormatter={(value) => `Player: ${efficiencyData.find(d => d.three_dart_avg === value)?.player_name || 'Unknown'}`}
              />
              <Scatter dataKey="efficiency" fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
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
    </div>
  )
}
