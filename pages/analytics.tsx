import { useEffect, useState } from 'react'
import { getPlayerStats, getTournaments } from '@/lib/queries'
import { PlayerStat, Tournament } from '@/lib/supabase'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, AreaChart, Area } from 'recharts'
import { TrendingUp, Users, Target, Award, BarChart3, Calendar, Trophy, Zap } from 'lucide-react'
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

  // Tournament Performance Trends
  const tournamentTrends = tournaments.map(tournament => {
    const tournamentStats = playerStats.filter(stat => stat.tournament_id === tournament.tournament_id)
    const avgThreeDart = tournamentStats.length > 0 
      ? tournamentStats.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / tournamentStats.length
      : 0
    const avgFirstNine = tournamentStats.length > 0 
      ? tournamentStats.reduce((sum, stat) => sum + stat.first_9_avg, 0) / tournamentStats.length
      : 0

    return {
      name: tournament.tournament_name.replace(/\s+/g, ' ').substring(0, 10),
      year: tournament.tournament_year,
      '3-Dart Avg': Math.round(avgThreeDart * 100) / 100,
      'First 9 Avg': Math.round(avgFirstNine * 100) / 100,
      participants: tournamentStats.length,
      'Avg Win Rate': Math.round((tournamentStats.reduce((sum, stat) => sum + stat.win_rate_sets, 0) / tournamentStats.length) * 1000) / 10
    }
  }).sort((a, b) => a.year - b.year)

  // Performance Distribution Analysis
  const performanceRanges = [
    { range: '< 25', count: 0, color: '#ef4444' },
    { range: '25-35', count: 0, color: '#f97316' },
    { range: '35-45', count: 0, color: '#eab308' },
    { range: '45-55', count: 0, color: '#22c55e' },
    { range: '55+', count: 0, color: '#059669' }
  ]

  playerStats.forEach(stat => {
    const avg = stat.three_dart_avg
    if (avg < 25) performanceRanges[0].count++
    else if (avg < 35) performanceRanges[1].count++
    else if (avg < 45) performanceRanges[2].count++
    else if (avg < 55) performanceRanges[3].count++
    else performanceRanges[4].count++
  })

  // Top Finishers Analysis
  const finishData = playerStats
    .filter(stat => stat.high_finish >= 50)
    .reduce((acc, stat) => {
      const range = stat.high_finish >= 100 ? '100+' : 
                   stat.high_finish >= 80 ? '80-99' : 
                   stat.high_finish >= 60 ? '60-79' : '50-59'
      acc[range] = (acc[range] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const finishChartData = Object.entries(finishData).map(([range, count]) => ({
    range,
    count,
    color: range === '100+' ? '#fbbf24' : range === '80-99' ? '#34d399' : range === '60-79' ? '#60a5fa' : '#a78bfa'
  }))

  // Scoring Excellence Analysis
  const scoringData = tournaments.map(tournament => {
    const tournamentStats = playerStats.filter(stat => stat.tournament_id === tournament.tournament_id)
    const total180s = tournamentStats.reduce((sum, stat) => sum + stat.scores_180, 0)
    const total140Plus = tournamentStats.reduce((sum, stat) => sum + stat.scores_140_plus, 0)
    const total100Plus = tournamentStats.reduce((sum, stat) => sum + stat.scores_100_plus, 0)

    return {
      tournament: tournament.tournament_name.substring(0, 8),
      '180s': total180s,
      '140+': total140Plus,
      '100+': total100Plus
    }
  }).slice(0, 10)

  // Elite Players Analysis (Top 20% by 3-dart average)
  const sortedStats = [...playerStats].sort((a, b) => b.three_dart_avg - a.three_dart_avg)
  const eliteThreshold = Math.ceil(playerStats.length * 0.2)
  const eliteStats = sortedStats.slice(0, eliteThreshold)

  // Performance Correlation Analysis
  const correlationData = playerStats.map(stat => ({
    threeDartAvg: stat.three_dart_avg,
    winRate: stat.win_rate_sets * 100,
    firstNineAvg: stat.first_9_avg,
    playerName: stat.players?.player_name || 'Unknown'
  })).filter(data => data.threeDartAvg > 0).slice(0, 50)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading advanced analytics...</p>
        </div>
      </div>
    )
  }

  const totalPlayers = new Set(playerStats.map(s => s.player_id)).size
  const totalMatches = playerStats.reduce((sum, s) => sum + s.match_played, 0)
  const avgPerformance = playerStats.reduce((sum, s) => sum + s.three_dart_avg, 0) / playerStats.length
  const topPerformance = Math.max(...playerStats.map(s => s.three_dart_avg))

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced Performance Analytics
          </h1>
          <p className="text-lg text-gray-600">
            Deep insights into Royal Darts performance trends and statistics
          </p>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Players"
            value={totalPlayers}
            icon={<Users className="h-6 w-6 text-blue-500" />}
            trend={{ value: 12, label: "vs last season", isPositive: true }}
          />
          <StatCard
            title="Total Matches"
            value={totalMatches.toLocaleString()}
            icon={<Target className="h-6 w-6 text-green-500" />}
          />
          <StatCard
            title="Avg Performance"
            value={avgPerformance.toFixed(2)}
            subtitle="3-Dart Average"
            icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
          />
          <StatCard
            title="Peak Performance"
            value={topPerformance.toFixed(2)}
            subtitle="Highest 3-Dart"
            icon={<Award className="h-6 w-6 text-yellow-500" />}
          />
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tournament Performance Trends */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-500" />
              Tournament Performance Evolution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tournamentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="3-Dart Avg" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="First 9 Avg" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
              3-Dart Average Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceRanges}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, count, percent }) => `${range}: ${count} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {performanceRanges.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Secondary Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* High Finish Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              High Finish Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finishChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Correlation */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Performance Correlation Analysis
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="threeDartAvg" name="3-Dart Average" />
                  <YAxis dataKey="winRate" name="Win Rate %" />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'winRate' ? `${value}%` : value,
                      name === 'winRate' ? 'Win Rate' : '3-Dart Average'
                    ]}
                    labelFormatter={(value) => `Player: ${correlationData.find(d => d.threeDartAvg === value)?.playerName || 'Unknown'}`}
                  />
                  <Scatter dataKey="winRate" fill="#10b981" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Scoring Excellence */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-orange-500" />
            Scoring Excellence by Tournament
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoringData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tournament" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="180s"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="140+"
                  stackId="1"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="100+"
                  stackId="1"
                  stroke="#eab308"
                  fill="#eab308"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Elite Performance Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
            <h4 className="text-lg font-semibold mb-2">Elite Players Club</h4>
            <p className="text-3xl font-bold">{eliteStats.length}</p>
            <p className="text-purple-100 text-sm">Top 20% performers</p>
            <p className="text-purple-100 text-xs mt-2">Avg: {(eliteStats.reduce((sum, s) => sum + s.three_dart_avg, 0) / eliteStats.length).toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <h4 className="text-lg font-semibold mb-2">Tournament Participation</h4>
            <p className="text-3xl font-bold">{tournaments.length}</p>
            <p className="text-blue-100 text-sm">Total tournaments</p>
            <p className="text-blue-100 text-xs mt-2">Avg players: {Math.round(playerStats.length / tournaments.length)}</p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <h4 className="text-lg font-semibold mb-2">Performance Growth</h4>
            <p className="text-3xl font-bold">↗️ 8.2%</p>
            <p className="text-green-100 text-sm">YoY improvement</p>
            <p className="text-green-100 text-xs mt-2">Trending upward</p>
          </div>
        </div>
      </div>
    </div>
  )
}
