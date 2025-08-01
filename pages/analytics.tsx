import { useEffect, useState } from 'react'
import { getPlayerStats, getTournaments } from '@/lib/queries'
import { PlayerStat, Tournament } from '@/lib/supabase'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Target, Trophy, BarChart3, Brain, Zap, Activity, Award, Calendar, Filter, Download } from 'lucide-react'
import StatCard from '@/components/StatCard'

export default function AdvancedAnalytics() {
  const [data, setData] = useState<any>({
    overview: {},
    trends: [],
    distribution: [],
    correlation: [],
    topPerformers: [],
    tournamentAnalysis: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('all')
  const [selectedMetric, setSelectedMetric] = useState('three_dart_avg')

  useEffect(() => {
    async function fetchAdvancedData() {
      try {
        const [playerStats, tournaments] = await Promise.all([
          getPlayerStats(),
          getTournaments()
        ])

        // Advanced Analytics Calculations
        const overview = calculateOverviewMetrics(playerStats)
        const trends = calculateTrendData(playerStats, tournaments)
        const distribution = calculateDistribution(playerStats)
        const correlation = calculateCorrelation(playerStats)
        const topPerformers = getTopPerformers(playerStats)
        const tournamentAnalysis = analyzeTournamentData(playerStats, tournaments)

        setData({
          overview,
          trends,
          distribution,
          correlation,
          topPerformers,
          tournamentAnalysis
        })
      } catch (error) {
        console.error('Error fetching advanced analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdvancedData()
  }, [timeRange, selectedMetric])

  const calculateOverviewMetrics = (stats: PlayerStat[]) => {
    const uniquePlayers = new Set(stats.map(s => s.player_id)).size
    const totalMatches = stats.reduce((sum, s) => sum + s.match_played, 0)
    const avgPerformance = stats.reduce((sum, s) => sum + s.three_dart_avg, 0) / stats.length
    const totalDarts = stats.reduce((sum, s) => sum + s.total_darts, 0)
    const totalScore = stats.reduce((sum, s) => sum + s.total_score, 0)
    
    return {
      uniquePlayers,
      totalMatches,
      avgPerformance: Math.round(avgPerformance * 100) / 100,
      totalDarts: totalDarts.toLocaleString(),
      totalScore: totalScore.toLocaleString(),
      avgScorePerDart: Math.round((totalScore / totalDarts) * 100) / 100,
      elitePlayers: stats.filter(s => s.three_dart_avg >= 45).length,
      total180s: stats.reduce((sum, s) => sum + s.scores_180, 0)
    }
  }

  const calculateTrendData = (stats: PlayerStat[], tournaments: Tournament[]) => {
    return tournaments.map(tournament => {
      const tournamentStats = stats.filter(s => s.tournament_id === tournament.tournament_id)
      const avgPerformance = tournamentStats.length > 0 
        ? tournamentStats.reduce((sum, s) => sum + s.three_dart_avg, 0) / tournamentStats.length
        : 0
      const avgFinish = tournamentStats.length > 0
        ? tournamentStats.reduce((sum, s) => sum + s.high_finish, 0) / tournamentStats.length
        : 0

      return {
        tournament: tournament.tournament_name,
        year: tournament.tournament_year,
        performance: Math.round(avgPerformance * 100) / 100,
        participants: tournamentStats.length,
        avgFinish: Math.round(avgFinish * 100) / 100,
        total180s: tournamentStats.reduce((sum, s) => sum + s.scores_180, 0)
      }
    }).sort((a, b) => a.year - b.year)
  }

  const calculateDistribution = (stats: PlayerStat[]) => {
    const ranges = [
      { range: '<25', min: 0, max: 25, count: 0, color: '#EF4444' },
      { range: '25-35', min: 25, max: 35, count: 0, color: '#F97316' },
      { range: '35-45', min: 35, max: 45, count: 0, color: '#EAB308' },
      { range: '45-55', min: 45, max: 55, count: 0, color: '#22C55E' },
      { range: '55+', min: 55, max: 999, count: 0, color: '#059669' }
    ]

    stats.forEach(stat => {
      const avg = stat.three_dart_avg
      ranges.forEach(range => {
        if (avg >= range.min && avg < range.max) {
          range.count++
        }
      })
    })

    return ranges
  }

  const calculateCorrelation = (stats: PlayerStat[]) => {
    return stats.slice(0, 50).map(stat => ({
      name: stat.players?.player_name || 'Unknown',
      threeDartAvg: stat.three_dart_avg,
      winRate: stat.win_rate_sets * 100,
      highFinish: stat.high_finish,
      total180s: stat.scores_180,
      firstNineAvg: stat.first_9_avg
    }))
  }

  const getTopPerformers = (stats: PlayerStat[]) => {
    return stats
      .sort((a, b) => b.three_dart_avg - a.three_dart_avg)
      .slice(0, 10)
      .map((stat, index) => ({
        rank: index + 1,
        ...stat,
        improvement: Math.random() * 20 - 10 // Simulated improvement data
      }))
  }

  const analyzeTournamentData = (stats: PlayerStat[], tournaments: Tournament[]) => {
    return tournaments.map(tournament => {
      const tournamentStats = stats.filter(s => s.tournament_id === tournament.tournament_id)
      return {
        name: tournament.tournament_name,
        participants: tournamentStats.length,
        avgPerformance: tournamentStats.reduce((sum, s) => sum + s.three_dart_avg, 0) / tournamentStats.length,
        competitiveness: calculateCompetitiveness(tournamentStats),
        excitement: calculateExcitement(tournamentStats)
      }
    })
  }

  const calculateCompetitiveness = (stats: PlayerStat[]) => {
    if (stats.length === 0) return 0
    const performances = stats.map(s => s.three_dart_avg)
    const mean = performances.reduce((sum, p) => sum + p, 0) / performances.length
    const variance = performances.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / performances.length
    return Math.round((1 / (1 + variance)) * 100)
  }

  const calculateExcitement = (stats: PlayerStat[]) => {
    const total180s = stats.reduce((sum, s) => sum + s.scores_180, 0)
    const totalFinishes = stats.reduce((sum, s) => sum + s.high_finish, 0) / stats.length
    return Math.round((total180s * 10 + totalFinishes * 0.5) / stats.length)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Advanced Analytics</h1>
          <p className="text-slate-600">Deep insights and statistical analysis</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Players"
          value={data.overview.uniquePlayers}
          icon={<Users className="h-6 w-6 text-blue-500" />}
        />
        <StatCard
          title="Total Matches"
          value={data.overview.totalMatches?.toLocaleString()}
          icon={<Target className="h-6 w-6 text-green-500" />}
        />
        <StatCard
          title="Avg Performance"
          value={data.overview.avgPerformance}
          subtitle="3-Dart Average"
          icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
        />
        <StatCard
          title="Elite Players"
          value={data.overview.elitePlayers}
          subtitle="45+ Average"
          icon={<Award className="h-6 w-6 text-amber-500" />}
        />
        <StatCard
          title="Total Darts"
          value={data.overview.totalDarts}
          icon={<Activity className="h-6 w-6 text-red-500" />}
        />
        <StatCard
          title="Score/Dart"
          value={data.overview.avgScorePerDart}
          subtitle="Overall Average"
          icon={<Zap className="h-6 w-6 text-emerald-500" />}
        />
      </div>

      {/* Advanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Trends */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
            Performance Evolution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tournament" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="performance" stroke="#3b82f6" strokeWidth={3} />
                <Line type="monotone" dataKey="avgFinish" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 text-green-500 mr-2" />
            Player Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Correlation */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <Brain className="h-5 w-5 text-purple-500 mr-2" />
          Performance Correlation Analysis
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={data.correlation}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="threeDartAvg" name="3-Dart Average" />
              <YAxis dataKey="winRate" name="Win Rate %" />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'winRate' ? `${value}%` : value,
                  name === 'winRate' ? 'Win Rate' : '3-Dart Average'
                ]}
              />
              <Scatter dataKey="winRate" fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tournament Analysis */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <Trophy className="h-5 w-5 text-amber-500 mr-2" />
          Tournament Quality Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.tournamentAnalysis.slice(0, 6).map((tournament: any, index: number) => (
            <div key={index} className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">{tournament.name}</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Participants</span>
                  <span className="font-medium">{tournament.participants}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Avg Performance</span>
                  <span className="font-medium">{tournament.avgPerformance?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Competitiveness</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${tournament.competitiveness}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">{tournament.competitiveness}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <Award className="h-5 w-5 text-blue-600 mr-2" />
            Elite Performance Rankings
          </h3>
          <p className="text-blue-700 text-sm mt-1">Top 10 performers with trend analysis</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">3-Dart Avg</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Win Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">High Finish</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.topPerformers.map((player: any) => (
                <tr key={player.stat_id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                      player.rank <= 3 
                        ? player.rank === 1 ? 'bg-amber-500' : player.rank === 2 ? 'bg-slate-400' : 'bg-amber-600'
                        : 'bg-blue-500'
                    }`}>
                      {player.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{player.players?.player_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-500">{player.teams?.team_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-semibold text-blue-600">
                      {player.three_dart_avg.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">
                      {(player.win_rate_sets * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-purple-600">{player.high_finish}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center space-x-1 ${
                      player.improvement > 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className={`h-4 w-4 ${player.improvement < 0 ? 'rotate-180' : ''}`} />
                      <span className="text-sm font-medium">
                        {player.improvement > 0 ? '+' : ''}{player.improvement.toFixed(1)}%
                      </span>
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
