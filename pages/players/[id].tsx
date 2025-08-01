import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getPlayerStats } from '@/lib/queries'
import { PlayerStat } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'
import Link from 'next/link'
import { ArrowLeft, Target, Trophy, TrendingUp, Award, Zap, Activity, BarChart3, Users } from 'lucide-react'

export default function PlayerDetail() {
  const router = useRouter()
  const { id } = router.query
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [playerInfo, setPlayerInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function fetchData() {
      try {
        const playerId = parseInt(id as string)
        const statsData = await getPlayerStats({ playerId })

        setPlayerStats(statsData)
        
        // Prepare performance timeline data
        const performanceTimeline = statsData.map(stat => ({
          tournament: stat.tournaments?.tournament_name || 'Unknown',
          threeDartAvg: stat.three_dart_avg,
          firstNineAvg: stat.first_9_avg,
          winRateSets: stat.win_rate_sets * 100,
          winRateLegs: stat.win_rate_legs * 100,
          highFinish: stat.high_finish,
          scores180: stat.scores_180
        }))

        setPerformanceData(performanceTimeline)

        if (statsData.length > 0) {
          // Calculate comprehensive player statistics
          const totalMatches = statsData.reduce((sum, stat) => sum + stat.match_played, 0)
          const totalSets = statsData.reduce((sum, stat) => sum + stat.sets_played, 0)
          const totalLegs = statsData.reduce((sum, stat) => sum + stat.legs_played, 0)
          const setsWon = statsData.reduce((sum, stat) => sum + stat.sets_won, 0)
          const legsWon = statsData.reduce((sum, stat) => sum + stat.legs_won, 0)
          const totalScore = statsData.reduce((sum, stat) => sum + stat.total_score, 0)
          const totalDarts = statsData.reduce((sum, stat) => sum + stat.total_darts, 0)
          const total100Plus = statsData.reduce((sum, stat) => sum + stat.scores_100_plus, 0)
          const total140Plus = statsData.reduce((sum, stat) => sum + stat.scores_140_plus, 0)
          const total170Plus = statsData.reduce((sum, stat) => sum + stat.scores_170_plus, 0)
          const total180s = statsData.reduce((sum, stat) => sum + stat.scores_180, 0)
          const totalFinishes100Plus = statsData.reduce((sum, stat) => sum + stat.finishes_100_plus, 0)

          const avgThreeDart = statsData.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / statsData.length
          const avgFirstNine = statsData.reduce((sum, stat) => sum + stat.first_9_avg, 0) / statsData.length
          const avgOneDart = statsData.reduce((sum, stat) => sum + stat.one_dart_avg, 0) / statsData.length
          const highFinish = Math.max(...statsData.map(stat => stat.high_finish))
          const bestLeg = Math.min(...statsData.map(stat => stat.best_leg).filter(leg => leg > 0))
          const worstLeg = Math.max(...statsData.map(stat => stat.worst_leg))

          setPlayerInfo({
            name: statsData[0].players?.player_name || 'Unknown Player',
            totalTournaments: statsData.length,
            totalMatches,
            totalSets,
            totalLegs,
            setsWon,
            legsWon,
            totalScore,
            totalDarts,
            avgThreeDart: Math.round(avgThreeDart * 100) / 100,
            avgFirstNine: Math.round(avgFirstNine * 100) / 100,
            avgOneDart: Math.round(avgOneDart * 100) / 100,
            setWinRate: Math.round((setsWon / totalSets) * 1000) / 10,
            legWinRate: Math.round((legsWon / totalLegs) * 1000) / 10,
            avgScorePerDart: Math.round((totalScore / totalDarts) * 100) / 100,
            highFinish,
            bestLeg: bestLeg === Infinity ? 0 : bestLeg,
            worstLeg,
            total100Plus,
            total140Plus,
            total170Plus,
            total180s,
            totalFinishes100Plus
          })
        }
      } catch (error) {
        console.error('Error fetching player data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!playerInfo) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Player not found</h2>
      </div>
    )
  }

  // Fixed tournament columns with proper TypeScript types
  const tournamentColumns = [
    { 
      key: 'tournament_name', 
      label: 'Tournament', 
      render: (_value: any, row: PlayerStat) => (
        <span className="font-medium">
          {row.tournaments?.tournament_name || 'Unknown Tournament'}
        </span>
      )
    },
    { 
      key: 'team_name', 
      label: 'Team', 
      render: (_value: any, row: PlayerStat) => (
        <span className="text-blue-600">
          {row.teams?.team_name || 'Unknown Team'}
        </span>
      )
    },
    { 
      key: 'match_played', 
      label: 'Matches',
      render: (value: number) => <span className="font-semibold">{value}</span>
    },
    { 
      key: 'sets_played', 
      label: 'Sets Played',
      render: (value: number) => <span>{value}</span>
    },
    { 
      key: 'sets_won', 
      label: 'Sets Won',
      render: (value: number) => <span className="text-green-600 font-semibold">{value}</span>
    },
    { 
      key: 'legs_played', 
      label: 'Legs Played',
      render: (value: number) => <span>{value}</span>
    },
    { 
      key: 'legs_won', 
      label: 'Legs Won',
      render: (value: number) => <span className="text-green-600 font-semibold">{value}</span>
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
      key: 'one_dart_avg', 
      label: '1-Dart Avg', 
      render: (value: number) => (
        <span className="text-gray-700">
          {value.toFixed(2)}
        </span>
      )
    },
    { 
      key: 'win_rate_sets', 
      label: 'Set Win Rate', 
      render: (value: number) => (
        <span className={`font-medium ${value >= 0.7 ? 'text-green-600' : value >= 0.5 ? 'text-blue-600' : 'text-red-600'}`}>
          {(value * 100).toFixed(1)}%
        </span>
      )
    },
    { 
      key: 'win_rate_legs', 
      label: 'Leg Win Rate', 
      render: (value: number) => (
        <span className={`font-medium ${value >= 0.7 ? 'text-green-600' : value >= 0.5 ? 'text-blue-600' : 'text-red-600'}`}>
          {(value * 100).toFixed(1)}%
        </span>
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
    },
    { 
      key: 'scores_180', 
      label: '180s',
      render: (value: number) => <span className="font-bold text-red-600">{value}</span>
    },
    { 
      key: 'scores_100_plus', 
      label: '100+',
      render: (value: number) => <span className="text-green-600">{value}</span>
    },
    { 
      key: 'scores_140_plus', 
      label: '140+',
      render: (value: number) => <span className="text-orange-600">{value}</span>
    },
    { 
      key: 'scores_170_plus', 
      label: '170+',
      render: (value: number) => <span className="text-red-600">{value}</span>
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/players"
            className="inline-flex items-center text-blue-600 hover:text-blue-900 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Players
          </Link>
        </div>

        {/* Player Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {playerInfo.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {playerInfo.name}
          </h1>
          <p className="text-xl text-gray-600">Complete Performance Analysis</p>
          <p className="text-sm text-gray-500 mt-2">Built & Managed by SUCA ANALYTICS</p>
        </div>

        {/* Key Performance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Tournaments"
            value={playerInfo.totalTournaments}
            icon={<Trophy className="h-8 w-8 text-yellow-500" />}
          />
          <StatCard
            title="Total Matches"
            value={playerInfo.totalMatches}
            icon={<Target className="h-8 w-8 text-green-500" />}
          />
          <StatCard
            title="Total Sets"
            value={playerInfo.totalSets}
            icon={<BarChart3 className="h-8 w-8 text-purple-500" />}
          />
          <StatCard
            title="Total Legs"
            value={playerInfo.totalLegs}
            icon={<Activity className="h-8 w-8 text-red-500" />}
          />
          <StatCard
            title="Avg 3-Dart"
            value={playerInfo.avgThreeDart}
            icon={<TrendingUp className="h-8 w-8 text-blue-600" />}
          />
          <StatCard
            title="Avg First 9"
            value={playerInfo.avgFirstNine}
            icon={<Zap className="h-8 w-8 text-orange-500" />}
          />
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Set Win Rate"
            value={`${playerInfo.setWinRate}%`}
            icon={<Award className="h-8 w-8 text-green-600" />}
          />
          <StatCard
            title="Leg Win Rate"
            value={`${playerInfo.legWinRate}%`}
            icon={<Award className="h-8 w-8 text-blue-600" />}
          />
          <StatCard
            title="High Finish"
            value={playerInfo.highFinish}
            icon={<Target className="h-8 w-8 text-yellow-600" />}
          />
          <StatCard
            title="Best Leg"
            value={playerInfo.bestLeg}
            icon={<Zap className="h-8 w-8 text-green-600" />}
          />
          <StatCard
            title="Score/Dart"
            value={playerInfo.avgScorePerDart}
            icon={<TrendingUp className="h-8 w-8 text-indigo-500" />}
          />
          <StatCard
            title="Total 180s"
            value={playerInfo.total180s}
            icon={<Award className="h-8 w-8 text-red-600" />}
          />
        </div>

        {/* Scoring Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Scoring Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{playerInfo.total180s}</div>
              <div className="text-sm text-red-600">180s</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{playerInfo.total170Plus}</div>
              <div className="text-sm text-orange-600">170+</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{playerInfo.total140Plus}</div>
              <div className="text-sm text-yellow-600">140+</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{playerInfo.total100Plus}</div>
              <div className="text-sm text-green-600">100+</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{playerInfo.totalFinishes100Plus}</div>
              <div className="text-sm text-blue-600">100+ Finishes</div>
            </div>
          </div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Line Chart - Performance Over Time */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Performance Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tournament" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="threeDartAvg" stroke="#3b82f6" strokeWidth={2} name="3-Dart Avg" />
                  <Line type="monotone" dataKey="firstNineAvg" stroke="#10b981" strokeWidth={2} name="First 9 Avg" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart - Win Rates */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Win Rate Analysis</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tournament" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="winRateSets" fill="#3b82f6" name="Set Win Rate %" />
                  <Bar dataKey="winRateLegs" fill="#10b981" name="Leg Win Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Complete Tournament History */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
            <h3 className="text-xl font-semibold text-white">Complete Tournament History</h3>
            <p className="text-blue-100 mt-1">Detailed performance across all tournaments</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {tournamentColumns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {playerStats.map((stat, index) => (
                  <tr key={stat.stat_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {tournamentColumns.map((column) => (
                      <td key={column.key} className="px-4 py-3 whitespace-nowrap text-sm">
                        {column.render ? 
                          column.render(stat[column.key as keyof PlayerStat], stat) : 
                          String(stat[column.key as keyof PlayerStat] || '')
                        }
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
