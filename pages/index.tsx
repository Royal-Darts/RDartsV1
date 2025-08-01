import { useEffect, useState } from 'react'
import { getTournaments, getTopPerformers, getPlayerStats } from '@/lib/queries'
import { Tournament, PlayerStat } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import { Users, Target, Trophy, TrendingUp, Award, Zap, Activity, BarChart3 } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export default function Dashboard() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [topPerformers, setTopPerformers] = useState<PlayerStat[]>([])
  const [totalStats, setTotalStats] = useState({
    totalPlayers: 0,
    totalMatches: 0,
    totalSets: 0,
    totalLegs: 0,
    avgDartAvg: 0,
    avgFirstNineAvg: 0,
    avgWinRateSets: 0,
    totalTournaments: 0,
    highest180s: 0,
    highestFinish: 0,
    bestAverage: 0,
    totalScore: 0,
    totalDarts: 0
  })
  const [trendData, setTrendData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Players to exclude from leaderboard display
  const excludedPlayers = ['Anjana Rustagi', 'Sai Agarwal']

  useEffect(() => {
    async function fetchData() {
      try {
        const [tournamentsData, topPerformersData, allStats] = await Promise.all([
          getTournaments(),
          getTopPerformers('three_dart_avg', 15), // Get more to account for exclusions
          getPlayerStats()
        ])

        setTournaments(tournamentsData)
        
        // Filter out excluded players from top performers for display
        const filteredTopPerformers = topPerformersData.filter(
          stat => !excludedPlayers.includes(stat.players?.player_name || '')
        ).slice(0, 10) // Get top 10 after filtering
        
        setTopPerformers(filteredTopPerformers)
        
        // Calculate comprehensive statistics (include all for accurate totals)
        const uniquePlayers = new Set(allStats.map(stat => stat.player_id))
        const totalMatches = allStats.reduce((sum, stat) => sum + stat.match_played, 0)
        const totalSets = allStats.reduce((sum, stat) => sum + stat.sets_played, 0)
        const totalLegs = allStats.reduce((sum, stat) => sum + stat.legs_played, 0)
        const totalScore = allStats.reduce((sum, stat) => sum + stat.total_score, 0)
        const totalDarts = allStats.reduce((sum, stat) => sum + stat.total_darts, 0)
        
        const avgDartAvg = allStats.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / allStats.length
        const avgFirstNineAvg = allStats.reduce((sum, stat) => sum + stat.first_9_avg, 0) / allStats.length
        const avgWinRateSets = allStats.reduce((sum, stat) => sum + stat.win_rate_sets, 0) / allStats.length
        
        const highest180s = Math.max(...allStats.map(s => s.scores_180))
        const highestFinish = Math.max(...allStats.map(s => s.high_finish))
        const bestAverage = Math.max(...allStats.map(s => s.three_dart_avg))

        setTotalStats({
          totalPlayers: uniquePlayers.size,
          totalMatches,
          totalSets,
          totalLegs,
          avgDartAvg: Math.round(avgDartAvg * 100) / 100,
          avgFirstNineAvg: Math.round(avgFirstNineAvg * 100) / 100,
          avgWinRateSets: Math.round(avgWinRateSets * 1000) / 10,
          totalTournaments: tournamentsData.length,
          highest180s,
          highestFinish,
          bestAverage: Math.round(bestAverage * 100) / 100,
          totalScore,
          totalDarts
        })

        // Create trend data
        const tournamentTrends = tournamentsData.map(tournament => {
          const tournamentStats = allStats.filter(stat => stat.tournament_id === tournament.tournament_id)
          const avgDartAvg = tournamentStats.length > 0 
            ? tournamentStats.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / tournamentStats.length
            : 0
          
          return {
            name: tournament.tournament_name,
            year: tournament.tournament_year,
            average: Math.round(avgDartAvg * 100) / 100,
            participants: tournamentStats.length
          }
        }).sort((a, b) => a.year - b.year)

        setTrendData(tournamentTrends)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const columns = [
    {
      key: 'rank',
      label: '#',
      render: (_value: any, _row: any, index?: number) => (
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
            (index ?? 0) === 0 ? 'bg-yellow-500' : (index ?? 0) === 1 ? 'bg-gray-400' : (index ?? 0) === 2 ? 'bg-amber-600' : 'bg-purple-500'
          }`}>
            {(index ?? 0) + 1}
          </div>
        </div>
      )
    },
    {
      key: 'player_name',
      label: 'Player',
      render: (_value: any, row: PlayerStat) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.players?.player_name || 'Unknown Player'}
          </div>
          <div className="text-sm text-gray-500">
            {row.teams?.team_name || 'Unknown Team'}
          </div>
        </div>
      )
    },
    {
      key: 'tournament_name',
      label: 'Tournament',
      render: (_value: any, row: PlayerStat) => (
        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
          {row.tournaments?.tournament_name || 'Unknown Tournament'}
        </span>
      )
    },
    {
      key: 'three_dart_avg',
      label: '3-Dart Avg',
      render: (value: number) => (
        <span className={`font-bold ${value >= 50 ? 'text-green-600' : value >= 40 ? 'text-blue-600' : 'text-gray-600'}`}>
          {value.toFixed(2)}
        </span>
      )
    },
    {
      key: 'first_9_avg',
      label: 'First 9 Avg',
      render: (value: number) => (
        <span className="font-semibold text-purple-600">
          {value.toFixed(2)}
        </span>
      )
    },
    {
      key: 'win_rate_sets',
      label: 'Win Rate',
      render: (value: number) => (
        <div className="flex items-center">
          <span className={`font-medium ${value >= 0.7 ? 'text-green-600' : value >= 0.5 ? 'text-blue-600' : 'text-red-600'}`}>
            {(value * 100).toFixed(1)}%
          </span>
          <div className="ml-2 w-12 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${value >= 0.7 ? 'bg-green-500' : value >= 0.5 ? 'bg-blue-500' : 'bg-red-500'}`}
              style={{ width: `${value * 100}%` }}
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
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Royal Darts Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Royal Darts Analytics
          </h1>
          <p className="text-xl text-gray-600">
            Elite Performance Insights & Tournament Statistics
          </p>
        </div>

        {/* Fixed Hero Stats Grid - Responsive Layout */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 mb-8">
          <div className="col-span-1">
            <StatCard
              title="Players"
              value={totalStats.totalPlayers}
              icon={<Users className="h-6 w-6 text-purple-500" />}
              trend={{ value: 12, label: "active", isPositive: true }}
            />
          </div>
          <div className="col-span-1">
            <StatCard
              title="Tournaments"
              value={totalStats.totalTournaments}
              icon={<Trophy className="h-6 w-6 text-yellow-500" />}
            />
          </div>
          <div className="col-span-1">
            <StatCard
              title="Matches"
              value={totalStats.totalMatches.toLocaleString()}
              icon={<Target className="h-6 w-6 text-green-500" />}
            />
          </div>
          <div className="col-span-1">
            <StatCard
              title="Sets"
              value={totalStats.totalSets.toLocaleString()}
              icon={<BarChart3 className="h-6 w-6 text-blue-500" />}
            />
          </div>
          <div className="col-span-1">
            <StatCard
              title="Legs"
              value={totalStats.totalLegs.toLocaleString()}
              icon={<Activity className="h-6 w-6 text-red-500" />}
            />
          </div>
          <div className="col-span-1">
            <StatCard
              title="3-Dart Avg"
              value={totalStats.avgDartAvg}
              subtitle="Overall"
              icon={<TrendingUp className="h-6 w-6 text-indigo-600" />}
            />
          </div>
          <div className="col-span-1">
            <StatCard
              title="First 9 Avg"
              value={totalStats.avgFirstNineAvg}
              subtitle="Opening"
              icon={<Zap className="h-6 w-6 text-orange-500" />}
            />
          </div>
          <div className="col-span-1">
            <StatCard
              title="Win Rate"
              value={`${totalStats.avgWinRateSets}%`}
              subtitle="Sets"
              icon={<Award className="h-6 w-6 text-green-600" />}
            />
          </div>
        </div>

        {/* Performance Trend Chart */}
        {trendData.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-purple-500" />
              Performance Trends Across Tournaments
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [value, 'Average 3-Dart']}
                    labelFormatter={(label) => `Tournament: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="average"
                    stroke="#8b5cf6"
                    fill="#c4b5fd"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Records Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Best Average</p>
                <p className="text-3xl font-bold">{totalStats.bestAverage}</p>
                <p className="text-yellow-100 text-sm">Tournament record</p>
              </div>
              <Award className="h-12 w-12 text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Highest Finish</p>
                <p className="text-3xl font-bold">{totalStats.highestFinish}</p>
                <p className="text-green-100 text-sm">Single checkout</p>
              </div>
              <Zap className="h-12 w-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Most 180s</p>
                <p className="text-3xl font-bold">{totalStats.highest180s}</p>
                <p className="text-purple-100 text-sm">In one tournament</p>
              </div>
              <Target className="h-12 w-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Top Performers Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-blue-600">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Trophy className="h-6 w-6 mr-2" />
              👑 Elite Performers Hall of Fame
            </h3>
            <p className="text-purple-100 mt-1">Top ranked players by 3-dart average performance</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { label: '#', width: 'w-16' },
                    { label: 'Player', width: 'w-48' },
                    { label: 'Tournament', width: 'w-32' },
                    { label: '3-Dart Avg', width: 'w-28' },
                    { label: 'First 9 Avg', width: 'w-28' },
                    { label: 'Win Rate', width: 'w-32' },
                    { label: 'High Finish', width: 'w-28' }
                  ].map((header) => (
                    <th
                      key={header.label}
                      className={`${header.width} px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topPerformers.map((row, index) => (
                  <tr key={row.stat_id || index} className={`hover:bg-gray-50 transition-colors ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''}`}>
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                        {column.render ? column.render(row[column.key as keyof PlayerStat], row, index) : String(row[column.key as keyof PlayerStat] || '')}
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
