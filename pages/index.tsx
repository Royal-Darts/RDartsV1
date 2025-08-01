import { useEffect, useState } from 'react'
import { getTournaments, getTopPerformers, getPlayerStats } from '@/lib/queries'
import { Tournament, PlayerStat } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { Users, Target, Trophy, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [topPerformers, setTopPerformers] = useState<PlayerStat[]>([])
  const [totalStats, setTotalStats] = useState({
    totalPlayers: 0,
    totalMatches: 0,
    avgDartAvg: 0,
    totalTournaments: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [tournamentsData, topPerformersData, allStats] = await Promise.all([
          getTournaments(),
          getTopPerformers('three_dart_avg', 10),
          getPlayerStats()
        ])

        setTournaments(tournamentsData)
        setTopPerformers(topPerformersData)
        
        // Calculate total stats
        const uniquePlayers = new Set(allStats.map(stat => stat.player_id))
        const totalMatches = allStats.reduce((sum, stat) => sum + stat.match_played, 0)
        const avgDartAvg = allStats.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / allStats.length
        
        setTotalStats({
          totalPlayers: uniquePlayers.size,
          totalMatches,
          avgDartAvg: Math.round(avgDartAvg * 100) / 100,
          totalTournaments: tournamentsData.length
        })
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
    key: 'player_name',
    label: 'Player',
    render: (value: any, row: PlayerStat) => (
      <div>
        <div className="font-medium">
          {row.players?.player_name || row.player_name || 'Unknown Player'}
        </div>
        <div className="text-gray-500">
          {row.teams?.team_name || row.team_name || 'Unknown Team'}
        </div>
      </div>
    )
  },
  {
    key: 'tournament_name',
    label: 'Tournament',
    render: (value: any, row: PlayerStat) => 
      row.tournaments?.tournament_name || row.tournament_name || 'Unknown Tournament'
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

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Overview of tournament statistics and top performers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Players"
          value={totalStats.totalPlayers}
          icon={<Users className="h-8 w-8 text-primary-500" />}
        />
        <StatCard
          title="Total Tournaments"
          value={totalStats.totalTournaments}
          icon={<Trophy className="h-8 w-8 text-primary-500" />}
        />
        <StatCard
          title="Total Matches"
          value={totalStats.totalMatches}
          icon={<Target className="h-8 w-8 text-primary-500" />}
        />
        <StatCard
          title="Average 3-Dart"
          value={totalStats.avgDartAvg}
          icon={<TrendingUp className="h-8 w-8 text-primary-500" />}
        />
      </div>

      {/* Top Performers Table */}
      <div className="mt-8">
        <DataTable
          data={topPerformers}
          columns={columns}
          title="Top 10 Performers (3-Dart Average)"
        />
      </div>
    </div>
  )
}
