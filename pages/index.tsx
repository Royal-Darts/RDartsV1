import { useEffect, useState } from 'react'
import { getTournaments, getTopPerformers, getPlayerStats } from '@/lib/queries'
import { Tournament, PlayerStat } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import { Users, Target, Trophy, TrendingUp, Award, Zap, Activity, BarChart3, Crown } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts'

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
          getTopPerformers('three_dart_avg', 15),
          getPlayerStats()
        ])

        setTournaments(tournamentsData)
        
        const filteredTopPerformers = topPerformersData.filter(
          stat => !excludedPlayers.includes(stat.players?.player_name || '')
        ).slice(0, 10)
        
        setTopPerformers(filteredTopPerformers)
        
        // Calculate comprehensive statistics
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-slate-600 font-medium">Loading Royal Darts Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-amber-500 rounded-2xl shadow-lg">
              <Crown className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-amber-500 bg-clip-text text-transparent mb-4">
            Royal Darts Analytics
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Elite Performance Insights & Tournament Statistics
          </p>
        </div>

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 mb-12">
          <StatCard
            title="Players"
            value={totalStats.totalPlayers}
            icon={<Users className="h-6 w-6 text-blue-500" />}
            trend={{ value: 12, label: "active", isPositive: true }}
            variant="gradient"
          />
          <StatCard
            title="Tournaments"
            value={totalStats.totalTournaments}
            icon={<Trophy className="h-6 w-6 text-amber-500" />}
            variant="minimal"
          />
          <StatCard
            title="Matches"
            value={totalStats.totalMatches.toLocaleString()}
            icon={<Target className="h-6 w-6 text-emerald-500" />}
            variant="default"
          />
          <StatCard
            title="Sets"
            value={totalStats.totalSets.toLocaleString()}
            icon={<BarChart3 className="h-6 w-6 text-blue-500" />}
            variant="gradient"
          />
          <StatCard
            title="Legs"
            value={totalStats.totalLegs.toLocaleString()}
            icon={<Activity className="h-6 w-6 text-rose-500" />}
            variant="minimal"
          />
          <StatCard
            title="3-Dart Avg"
            value={totalStats.avgDartAvg}
            subtitle="Overall"
            icon={<TrendingUp className="h-6 w-6 text-indigo-600" />}
            variant="default"
          />
          <StatCard
            title="First 9 Avg"
            value={totalStats.avgFirstNineAvg}
            subtitle="Opening"
            icon={<Zap className="h-6 w-6 text-orange-500" />}
            variant="gradient"
          />
          <StatCard
            title="Win Rate"
            value={`${totalStats.avgWinRateSets}%`}
            subtitle="Sets"
            icon={<Award className="h-6 w-6 text-emerald-600" />}
            variant="minimal"
          />
        </div>

        {/* Performance Trend Chart */}
        {trendData.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-200/50 mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-500/10 to-amber-500/10 rounded-xl mr-3">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              Performance Evolution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="average"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#colorGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Records Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 p-8 rounded-2xl text-white shadow-xl">
            <div className="absolute -top-4 -right-4 opacity-20">
              <Award className="h-24 w-24" />
            </div>
            <div className="relative">
              <h4 className="text-amber-100 text-sm font-medium mb-2">Tournament Record</h4>
              <p className="text-4xl font-bold mb-2">{totalStats.bestAverage}</p>
              <p className="text-amber-100 text-sm">Best 3-Dart Average</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600 p-8 rounded-2xl text-white shadow-xl">
            <div className="absolute -top-4 -right-4 opacity-20">
              <Zap className="h-24 w-24" />
            </div>
            <div className="relative">
              <h4 className="text-emerald-100 text-sm font-medium mb-2">Elite Finish</h4>
              <p className="text-4xl font-bold mb-2">{totalStats.highestFinish}</p>
              <p className="text-emerald-100 text-sm">Highest Single Checkout</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-rose-400 to-rose-600 p-8 rounded-2xl text-white shadow-xl">
            <div className="absolute -top-4 -right-4 opacity-20">
              <Target className="h-24 w-24" />
            </div>
            <div className="relative">
              <h4 className="text-rose-100 text-sm font-medium mb-2">Perfect Scores</h4>
              <p className="text-4xl font-bold mb-2">{totalStats.highest180s}</p>
              <p className="text-rose-100 text-sm">Most 180s in Tournament</p>
            </div>
          </div>
        </div>

        {/* Top Performers Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200/50">
          <div className="p-8 border-b border-slate-200/50 bg-gradient-to-r from-blue-500 to-amber-500">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <Crown className="h-7 w-7 mr-3" />
              👑 Elite Hall of Fame
            </h3>
            <p className="text-blue-100 mt-2 text-lg">Top performers ranked by elite 3-dart average</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  {[
                    { label: 'Rank', width: 'w-20' },
                    { label: 'Player', width: 'w-64' },
                    { label: 'Tournament', width: 'w-40' },
                    { label: '3-Dart Avg', width: 'w-32' },
                    { label: 'First 9 Avg', width: 'w-32' },
                    { label: 'Win Rate', width: 'w-40' },
                    { label: 'High Finish', width: 'w-32' }
                  ].map((header) => (
                    <th
                      key={header.label}
                      className={`${header.width} px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider`}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {topPerformers.map((row, index) => (
                  <tr 
                    key={row.stat_id || index} 
                    className={`hover:bg-slate-50/50 transition-colors ${
                      index < 3 ? 'bg-gradient-to-r from-amber-50/50 to-transparent' : 'bg-white/50'
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-6 py-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                        index === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 
                        index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-600' : 
                        index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800' : 
                        'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    
                    {/* Player */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg">
                          {(row.players?.player_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{row.players?.player_name || 'Unknown Player'}</div>
                          <div className="text-sm text-slate-500">{row.teams?.team_name || 'Unknown Team'}</div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Tournament */}
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {row.tournaments?.tournament_name || 'Unknown Tournament'}
                      </span>
                    </td>
                    
                    {/* 3-Dart Avg */}
                    <td className="px-6 py-4">
                      <span className={`font-bold text-lg ${
                        row.three_dart_avg >= 50 ? 'text-emerald-600' : 
                        row.three_dart_avg >= 40 ? 'text-blue-600' : 'text-slate-600'
                      }`}>
                        {row.three_dart_avg.toFixed(2)}
                      </span>
                    </td>
                    
                    {/* First 9 Avg */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-amber-600">
                        {row.first_9_avg.toFixed(2)}
                      </span>
                    </td>
                    
                    {/* Win Rate */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <span className={`font-medium ${
                          row.win_rate_sets >= 0.7 ? 'text-emerald-600' : 
                          row.win_rate_sets >= 0.5 ? 'text-blue-600' : 'text-rose-600'
                        }`}>
                          {(row.win_rate_sets * 100).toFixed(1)}%
                        </span>
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              row.win_rate_sets >= 0.7 ? 'bg-emerald-500' : 
                              row.win_rate_sets >= 0.5 ? 'bg-blue-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${row.win_rate_sets * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    
                    {/* High Finish */}
                    <td className="px-6 py-4">
                      <span className={`font-bold px-3 py-1 rounded-full ${
                        row.high_finish >= 100 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {row.high_finish}
                      </span>
                    </td>
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
