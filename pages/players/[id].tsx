import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getPlayerPerformanceOverTime, getPlayerStats } from '@/lib/queries'
import { PlayerStat } from '@/lib/supabase'
import PlayerChart from '@/components/PlayerChart'
import DataTable from '@/components/DataTable'
import StatCard from '@/components/StatCard'
import { ArrowLeft, Target, Trophy, TrendingUp, Award, Zap, Activity, Users, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function PlayerDetail() {
  const router = useRouter()
  const { id } = router.query
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [playerInfo, setPlayerInfo] = useState<any>(null)
  const [allTimeStats, setAllTimeStats] = useState<any>(null)
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
          win_rate_sets: stat.win_rate_sets * 100,
        })))

        if (statsData.length > 0) {
          // Calculate comprehensive all-time statistics
          const totalMatches = statsData.reduce((sum, stat) => sum + stat.match_played, 0)
          const totalSets = statsData.reduce((sum, stat) => sum + stat.sets_played, 0)
          const totalSetsWon = statsData.reduce((sum, stat) => sum + stat.sets_won, 0)
          const totalLegs = statsData.reduce((sum, stat) => sum + stat.legs_played, 0)
          const totalLegsWon = statsData.reduce((sum, stat) => sum + stat.legs_won, 0)
          const totalScore = statsData.reduce((sum, stat) => sum + stat.total_score, 0)
          const totalDarts = statsData.reduce((sum, stat) => sum + stat.total_darts, 0)
          const total100Plus = statsData.reduce((sum, stat) => sum + stat.scores_100_plus, 0)
          const total140Plus = statsData.reduce((sum, stat) => sum + stat.scores_140_plus, 0)
          const total170Plus = statsData.reduce((sum, stat) => sum + stat.scores_170_plus, 0)
          const total180s = statsData.reduce((sum, stat) => sum + stat.scores_180, 0)
          const totalFinishes100Plus = statsData.reduce((sum, stat) => sum + stat.finishes_100_plus, 0)

          const avgThreeDart = statsData.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / statsData.length
          const avgFirstNine = statsData.reduce((sum, stat) => sum + stat.first_9_avg, 0) / statsData.length
          const highFinish = Math.max(...statsData.map(stat => stat.high_finish))
          const bestLeg = Math.min(...statsData.map(stat => stat.best_leg).filter(leg => leg > 0))
          const worstLeg = Math.max(...statsData.map(stat => stat.worst_leg))

          setPlayerInfo({
            name: statsData[0].players?.player_name,
            totalTournaments: statsData.length,
            totalMatches,
            totalSets,
            totalSetsWon,
            totalLegs,
            totalLegsWon,
            avgThreeDart: Math.round(avgThreeDart * 100) / 100,
            avgFirstNine: Math.round(avgFirstNine * 100) / 100,
            overallWinRateSets: Math.round((totalSetsWon / totalSets) * 1000) / 10,
            overallWinRateLegs: Math.round((totalLegsWon / totalLegs) * 1000) / 10,
            highFinish,
            bestLeg: bestLeg === Infinity ? 0 : bestLeg,
            worstLeg: worstLeg === -Infinity ? 0 : worstLeg
          })

          setAllTimeStats({
            totalScore,
            totalDarts,
            avgScorePerDart: Math.round((totalScore / totalDarts) * 100) / 100,
            total100Plus,
            total140Plus,
            total170Plus,
            total180s,
            totalFinishes100Plus,
            avg100PlusPerMatch: Math.round((total100Plus / totalMatches) * 100) / 100,
            avg140PlusPerMatch: Math.round((total140Plus / totalMatches) * 100) / 100,
            avg180sPerMatch: Math.round((total180s / totalMatches) * 100) / 100
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
      render: (_value: any, row: PlayerStat) => (
        <div>
          <div className="font-medium">{row.tournaments?.tournament_name}</div>
          <div className="text-sm text-gray-500">{row.tournaments?.tournament_year}</div>
        </div>
      )
    },
    {
      key: 'team_name',
      label: 'Team',
      render: (_value: any, row: PlayerStat) => row.teams?.team_name
    },
    {
      key: 'match_played',
      label: 'Matches'
    },
    {
      key: 'sets_played',
      label: 'Sets'
    },
    {
      key: 'sets_won',
      label: 'Sets Won'
    },
    {
      key: 'three_dart_avg',
      label: '3-Dart Avg',
      render: (value: number) => value.toFixed(2)
    },
    {
      key: 'first_9_avg',
      label: 'First 9 Avg',
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/players"
            className="inline-flex items-center text-purple-600 hover:text-purple-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Players
          </Link>
        </div>

        <div className="sm:flex sm:items-center mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">👑 {playerInfo.name}</h1>
            <p className="mt-2 text-sm text-gray-700">
              Complete performance analysis and tournament history
            </p>
          </div>
        </div>

        {/* Primary Stats Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-8">
          <StatCard
            title="Tournaments"
            value={playerInfo.totalTournaments}
            icon={<Trophy className="h-6 w-6 text-yellow-500" />}
          />
          <StatCard
            title="Total Matches"
            value={playerInfo.totalMatches}
            icon={<Target className="h-6 w-6 text-green-500" />}
          />
          <StatCard
            title="Sets Played"
            value={playerInfo.totalSets}
            icon={<BarChart3 className="h-6 w-6 text-blue-500" />}
          />
          <StatCard
            title="3-Dart Average"
            value={playerInfo.avgThreeDart}
            icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
          />
          <StatCard
            title="First 9 Average"
            value={playerInfo.avgFirstNine}
            icon={<Zap className="h-6 w-6 text-orange-500" />}
          />
          <StatCard
            title="High Finish"
            value={playerInfo.highFinish}
            icon={<Award className="h-6 w-6 text-red-500" />}
          />
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Set Win Rate"
            value={`${playerInfo.overallWinRateSets}%`}
            subtitle={`${playerInfo.totalSetsWon}/${playerInfo.totalSets} sets`}
            icon={<Award className="h-6 w-6 text-green-600" />}
          />
          <StatCard
            title="Leg Win Rate"
            value={`${playerInfo.overallWinRateLegs}%`}
            subtitle={`${playerInfo.totalLegsWon}/${playerInfo.totalLegs} legs`}
            icon={<Activity className="h-6 w-6 text-blue-600" />}
          />
          <StatCard
            title="Best Leg"
            value={playerInfo.bestLeg}
            subtitle="Fewest darts"
            icon={<Zap className="h-6 w-6 text-yellow-600" />}
          />
          <StatCard
            title="Worst Leg"
            value={playerInfo.worstLeg}
            subtitle="Most darts"
            icon={<Target className="h-6 w-6 text-gray-600" />}
          />
        </div>

        {/* All-Time Scoring Statistics */}
        {allTimeStats && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Target className="h-6 w-6 mr-2 text-purple-500" />
              All-Time Scoring Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{allTimeStats.totalScore.toLocaleString()}</div>
                <div className="text-sm text-purple-600">Total Score</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{allTimeStats.totalDarts.toLocaleString()}</div>
                <div className="text-sm text-blue-600">Total Darts</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{allTimeStats.avgScorePerDart}</div>
                <div className="text-sm text-green-600">Avg per Dart</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{allTimeStats.total100Plus}</div>
                <div className="text-sm text-yellow-600">100+ Scores</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{allTimeStats.total140Plus}</div>
                <div className="text-sm text-red-600">140+ Scores</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{allTimeStats.total170Plus}</div>
                <div className="text-sm text-indigo-600">170+ Scores</div>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{allTimeStats.total180s}</div>
                <div className="text-sm text-pink-600">180s</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{allTimeStats.totalFinishes100Plus}</div>
                <div className="text-sm text-orange-600">100+ Finishes</div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-600">{allTimeStats.avg100PlusPerMatch}</div>
                <div className="text-sm text-gray-600">Avg 100+ per Match</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-600">{allTimeStats.avg140PlusPerMatch}</div>
                <div className="text-sm text-gray-600">Avg 140+ per Match</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-600">{allTimeStats.avg180sPerMatch}</div>
                <div className="text-sm text-gray-600">Avg 180s per Match</div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Chart */}
        <div className="mb-8">
          <PlayerChart
            data={performanceData}
            title="Performance Evolution Over Time"
          />
        </div>

        {/* Tournament Details */}
        <div className="mt-8">
          <DataTable
            data={playerStats}
            columns={columns}
            title="Complete Tournament Performance History"
          />
        </div>
      </div>
    </div>
  )
}
