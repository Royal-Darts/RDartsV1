import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getPlayerPerformanceOverTime, getPlayerStats } from '@/lib/queries'
import { PlayerStat } from '@/lib/supabase'
import PlayerChart from '@/components/PlayerChart'
import DataTable from '@/components/DataTable'
import StatCard from '@/components/StatCard'
import { ArrowLeft, Target, Trophy, TrendingUp, Award } from 'lucide-react'
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
          setPlayerInfo({
            name: statsData[0].players?.player_name,
            totalTournaments: statsData.length,
            totalMatches: statsData.reduce((sum, stat) => sum + stat.match_played, 0),
            avgThreeDart: Math.round((statsData.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / statsData.length) * 100) / 100,
            highFinish: Math.max(...statsData.map(stat => stat.high_finish))
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
      render: (value: any, row: PlayerStat) => row.tournaments?.tournament_name
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
            Detailed performance analysis and tournament history
          </p>
        </div>
      </div>

      {/* Stats Cards */}
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
