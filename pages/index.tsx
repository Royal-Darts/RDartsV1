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
    bestAverage: 0
  })
  const [trendData, setTrendData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [tournamentsData, allStats] = await Promise.all([
          getTournaments(),
          getPlayerStats()
        ])

        setTournaments(tournamentsData)

        // Exclude Ladderboard and Ladies Singles teams from general statistics
        const excludedTeams = ['Ladderboard', 'Ladies Singles']
        const filteredStats = allStats.filter(stat => 
          !excludedTeams.includes(stat.teams?.team_name || '')
        )

        // For leaderboard: Only Jay Vardhan Bansal & Vijay Mittal from Ladderboard
        const highlightPlayers = ['Jay Vardhan Bansal', 'Vijay Mittal']
        const ladderboardStats = allStats.filter(stat => 
          stat.teams?.team_name === 'Ladderboard' && 
          highlightPlayers.includes(stat.players?.player_name || '')
        )

        setTopPerformers(ladderboardStats)
        
        // Calculate comprehensive statistics from filtered data
        const uniquePlayers = new Set(filteredStats.map(stat => stat.player_id))
        const totalMatches = filteredStats.reduce((sum, stat) => sum + stat.match_played, 0)
        const totalSets = filteredStats.reduce((sum, stat) => sum + stat.sets_played, 0)
        const totalLegs = filteredStats.reduce((sum, stat) => sum + stat.legs_played, 0)
        
        const avgDartAvg = filteredStats.length > 0 ? 
          filteredStats.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / filteredStats.length : 0
        const avgFirstNineAvg = filteredStats.length > 0 ? 
          filteredStats.reduce((sum, stat) => sum + stat.first_9_avg, 0) / filteredStats.length : 0
        const avgWinRateSets = filteredStats.length > 0 ? 
          filteredStats.reduce((sum, stat) => sum + stat.win_rate_sets, 0) / filteredStats.length : 0
        
        const highest180s = filteredStats.length > 0 ? Math.max(...filteredStats.map(s => s.scores_180)) : 0
        const highestFinish = filteredStats.length > 0 ? Math.max(...filteredStats.map(s => s.high_finish)) : 0
        const bestAverage = filteredStats.length > 0 ? Math.max(...filteredStats.map(s => s.three_dart_avg)) : 0

        setTotalStats({
          totalPlayers: uniquePlayers.size,
          totalMatches,
          totalSets,
          totalLegs,
          avgDartAvg: Math.round(avgDartAvg * 100) / 100,
          avgFirstNineAvg: Math.round(avgFirstNineAvg * 100) / 100,
          avgWinRateSets: Math.round(avgWinRateSets * 1000) / 10,
          totalTournaments: new Set(filteredStats.map(s => s.tournament_id)).size,
          highest180s,
          highestFinish,
          bestAverage: Math.round(bestAverage * 100) / 100
        })

        // Create trend data
        const tournamentTrends = tournamentsData
          .filter(tournament => !excludedTeams.includes(tournament.tournament_name || ''))
          .map(tournament => {
            const tournamentStats = filteredStats.filter(stat => stat.tournament_id === tournament.tournament_id)
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
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
          (index ?? 0) === 0 ? 'bg-yellow-500' : 'bg-gray-400'
        }`}>
          {(index ?? 0) + 1}
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
          <div className="text-sm text-gray-500">Elite Performer</div>
        </div>
      )
    },
    {
      key: 'three_dart_avg',
      label: '3-Dart Avg',
      render: (value: number) => (
        <span className="font-bold text-green-600">
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
        <span className="font-medium text-blue-600">
          {(value * 100).toFixed(1)}%
        </span>
      )
    },
    {
      key: 'high_finish',
      label: 'High Finish',
      render: (value: number) => (
        <span className="font-bold text-yellow-600">
          {value}
        </span>
      )
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Royal Darts Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="https://i.postimg.cc/vZ6By1rw/temp-Image-ZZJWG4.avif" 
              alt="Royal Darts Logo" 
              className="h-16 w-16 rounded-full shadow-lg mr-4"
            />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Royal Darts Analytics
              </h1>
              <p className="text-sm text-gray-600">Built & Managed by SUCA ANALYTICS</p>
            </div>
          </div>
          <p className="text-xl text-gray-600">
            Elite Performance Dashboard & Tournament Analytics
          </p>
        </div>

        {/* Enhanced Stats Grid - Fixed cropping with better responsive design */}
        <div className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
            <div className="col-span-1">
              <StatCard
                title="Players"
                value={totalStats.totalPlayers}
                icon={<Users className="h-6 w-6 text-blue-500" />}
                className="h-full"
              />
            </div>
            <div className="col-span-1">
              <StatCard
                title="Tournaments"
                value={totalStats.totalTournaments}
                icon={<Trophy className="h-6 w-6 text-yellow-500" />}
                className="h-full"
              />
            </div>
            <div className="col-span-1">
              <StatCard
                title="Matches"
                value={totalStats.totalMatches.toLocaleString()}
                icon={<Target className="h-6 w-6 text-green-500" />}
                className="h-full"
              />
            </div>
            <div className="col-span-1">
              <StatCard
                title="Sets"
                value={totalStats.totalSets.toLocaleString()}
                icon={<BarChart3 className="h-6 w-6 text-purple-500" />}
                className="h-full"
              />
            </div>
            <div className="col-span-1">
              <StatCard
                title="Legs"
                value={totalStats.totalLegs.toLocaleString()}
                icon={<Activity className="h-6 w-6 text-red-500" />}
                className="h-full"
              />
            </div>
            <div className="col-span-1">
              <StatCard
                title="Avg 3-Dart"
                value={totalStats.avgDartAvg}
                subtitle="Overall"
                icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
                className="h-full"
              />
            </div>
            <div className="col-span-1">
              <StatCard
                title="Avg First 9"
                value={totalStats.avgFirstNineAvg}
                subtitle="Opening"
                icon={<Zap className="h-6 w-6 text-orange-500" />}
                className="h-full"
              />
            </div>
            <div className="col-span-1">
              <StatCard
                title="Win Rate"
                value={`${totalStats.avgWinRateSets}%`}
                subtitle="Sets"
                icon={<Award className="h-6 w-6 text-green-600" />}
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* Performance Trend Chart */}
        {trendData.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-500" />
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
                    stroke="#3b82f6"
                    fill="#93c5fd"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Elite Performers Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-400 to-yellow-600">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Trophy className="h-6 w-6 mr-2" />
              🏆 Royal Darts Elite Performers
            </h3>
            <p className="text-yellow-100 mt-1">Jay Vardhan Bansal & Vijay Mittal - Championship Caliber</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { label: '#', width: 'w-16' },
                    { label: 'Player', width: 'w-48' },
                    { label: '3-Dart Avg', width: 'w-28' },
                    { label: 'First 9 Avg', width: 'w-28' },
                    { label: 'Win Rate', width: 'w-28' },
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
                  <tr key={row.stat_id || index} className="hover:bg-yellow-50 transition-colors bg-gradient-to-r from-yellow-50 to-transparent">
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
