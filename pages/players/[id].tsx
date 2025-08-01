import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getPlayerPerformanceOverTime, getPlayerStats } from '@/lib/queries'
import { PlayerStat } from '@/lib/supabase'
import PlayerChart from '@/components/PlayerChart'
import DataTable from '@/components/DataTable'
import StatCard from '@/components/StatCard'
import { ArrowLeft, Target, Trophy, TrendingUp, Award, Zap, Crosshair, Timer } from 'lucide-react'
import Link from 'next/link'

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
        const [statsData, performanceData] = await Promise.all([
          getPlayerStats({ playerId }),
          getPlayerPerformanceOverTime(playerId)
        ])

        setPlayerStats(statsData)
        setPerformanceData(performanceData.map(stat => ({
          ...stat,
          tournament_name: stat.tournaments?.tournament_name,
          win_rate_sets: stat.win_rate_sets * 100, // Convert to percentage for chart
        })))

        if (statsData.length > 0) {
          // Calculate comprehensive player statistics
          const totalMatches = statsData.reduce((sum, stat) => sum + stat.match_played, 0)
          const totalSets = statsData.reduce((sum, stat) => sum + stat.sets_played, 0)
          const totalLegs = statsData.reduce((sum, stat) => sum + stat.legs_played, 0)
          const totalScore = statsData.reduce((sum, stat) => sum + stat.total_score, 0)
          const totalDarts = statsData.reduce((sum, stat) => sum + stat.total_darts, 0)
          
          setPlayerInfo({
            name: statsData[0].players?.player_name,
            totalTournaments: statsData.length,
            totalMatches,
            totalSets,
            totalLegs,
            avgThreeDart: Math.round((statsData.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / statsData.length) * 100) / 100,
            avgOneDart: Math.round((statsData.reduce((sum, stat) => sum + stat.one_dart_avg, 0) / statsData.length) * 100) / 100,
            avgFirst9: Math.round((statsData.reduce((sum, stat) => sum + stat.first_9_avg, 0) / statsData.length) * 100) / 100,
            highFinish: Math.max(...statsData.map(stat => stat.high_finish)),
            bestLeg: Math.min(...statsData.map(stat => stat.best_leg).filter(leg => leg > 0)),
            worstLeg: Math.max(...statsData.map(stat => stat.worst_leg)),
            total180s: statsData.reduce((sum, stat) => sum + stat.scores_180, 0),
            total170Plus: statsData.reduce((sum, stat) => sum + stat.scores_170_plus, 0),
            total140Plus: statsData.reduce((sum, stat) => sum + stat.scores_140_plus, 0),
            total100Plus: statsData.reduce((sum, stat) => sum + stat.scores_100_plus, 0),
            totalFinishes100Plus: statsData.reduce((sum, stat) => sum + stat.finishes_100_plus, 0),
            avgWinRateSets: Math.round((statsData.reduce((sum, stat) => sum + stat.win_rate_sets, 0) / statsData.length) * 1000) / 10,
            avgWinRateLegs: Math.round((statsData.reduce((sum, stat) => sum + stat.win_rate_legs, 0) / statsData.length) * 1000) / 10,
            avgKeepRate: Math.round((statsData.reduce((sum, stat) => sum + stat.keep_rate, 0) / statsData.length) * 1000) / 10,
            avgBreakRate: Math.round((statsData.reduce((sum, stat) => sum + stat.break_rate, 0) / statsData.length) * 1000) / 10,
            totalScore,
            totalDarts,
            overallAverage: totalDarts > 0 ? Math.round((totalScore / totalDarts) * 100) / 100 : 0
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

  const columns = [
    {
      key: 'tournament_name',
      label: 'Tournament',
      render: (value: any, row: PlayerStat) => (
        <div>
          <div className="font-medium">{row.tournaments?.tournament_name}</div>
          <div className="text-sm text-gray-500">{row.tournaments?.tournament_year}</div>
        </div>
      )
    },
    {
      key: 'team_name',
      label: 'Team',
      render: (value: any, row: PlayerStat) => row.teams?.team_name
    },
    {
      key: 'match_played',
      label: 'Matches'
    },
    {
      key: 'three_dart_avg',
      label: '3-Dart Avg',
      render: (value: number) => value.toFixed(2)
    },
    {
      key: 'win_rate_sets',
      label: 'Set Win Rate',
      render: (value: number) => `${(value * 100).toFixed(1)}%`
    },
    {
      key: 'high_finish',
      label: 'High Finish'
    },
    {
      key: 'scores_180',
      label: '180s'
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
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

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/players"
          className="inline-flex items-center text-primary-600 hover:text-primary-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Players
        </Link>
      </div>

      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">{playerInfo.name}</h1>
          <p className="mt-2 text-sm text-gray-700">
            Complete performance analysis and tournament history
          </p>
        </div>
      </div>

      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Tournaments Played"
          value={playerInfo.totalTournaments}
          icon={<Trophy className="h-8 w-8 text-primary-500" />}
        />
        <StatCard
          title="Total Matches"
          value={playerInfo.totalMatches}
          icon={<Target className="h-8 w-8 text-primary-500" />}
        />
        <StatCard
          title="Average 3-Dart"
          value={playerInfo.avgThreeDart}
          icon={<TrendingUp className="h-8 w-8 text-primary-500" />}
        />
        <StatCard
          title="High Finish"
          value={playerInfo.highFinish}
          icon={<Award className="h-8 w-8 text-primary-500" />}
        />
      </div>

      {/* Detailed Statistics Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
        {/* Averages */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Averages
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">3-Dart Average</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.avgThreeDart}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">1-Dart Average</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.avgOneDart}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">First 9 Average</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.avgFirst9}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Overall Average</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.overallAverage}</dd>
            </div>
          </dl>
        </div>

        {/* Scoring */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            High Scores
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">180s</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.total180s}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">170+ Scores</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.total170Plus}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">140+ Scores</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.total140Plus}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">100+ Scores</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.total100Plus}</dd>
            </div>
          </dl>
        </div>

        {/* Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Crosshair className="h-5 w-5 mr-2" />
            Performance
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Set Win Rate</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.avgWinRateSets}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Leg Win Rate</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.avgWinRateLegs}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Keep Rate</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.avgKeepRate}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Break Rate</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.avgBreakRate}%</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Timer className="h-5 w-5 mr-2" />
            Best & Worst
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Best Leg</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.bestLeg} darts</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Worst Leg</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.worstLeg} darts</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">100+ Finishes</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.totalFinishes100Plus}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Totals</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Total Sets Played</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.totalSets}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Total Legs Played</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.totalLegs}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Total Score</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.totalScore.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Total Darts Thrown</dt>
              <dd className="text-sm font-medium text-gray-900">{playerInfo.totalDarts.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="mb-8">
        <PlayerChart
          data={performanceData}
          title="Performance Over Time"
        />
      </div>

      {/* Tournament Details */}
      <div className="mt-8">
        <DataTable
          data={playerStats}
          columns={columns}
          title="Tournament Performance History"
        />
      </div>
    </div>
  )
}
