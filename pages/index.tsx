import { useEffect, useState } from 'react'
import { getTournaments, getTopPerformers, getPlayerStats } from '@/lib/queries'
import { Tournament, PlayerStat } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { Users, Target, Trophy, TrendingUp } from 'lucide-react'

// Define Column interface locally if not importing from types
interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any, index?: number) => React.ReactNode
}

export default function Dashboard() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [topPerformers, setTopPerformers] = useState<PlayerStat[]>([])
  const [topAggregatedPlayers, setTopAggregatedPlayers] = useState<any[]>([])
  const [totalStats, setTotalStats] = useState({
    totalPlayers: 0,
    totalMatches: 0,
    avgDartAvg: 0,
    totalTournaments: 0
  })
  const [loading, setLoading] = useState(true)

  // Players to exclude from leaderboard display
  const excludedPlayers = ['Anjana Rustagi', 'Sai Agarwal']

  useEffect(() => {
    async function fetchData() {
      try {
        const [tournamentsData, topPerformersData, allStats] = await Promise.all([
          getTournaments(),
          getTopPerformers('three_dart_avg', 20),
          getPlayerStats()
        ])

        setTournaments(tournamentsData)
        
        const filteredTopPerformers = topPerformersData.filter(performer => 
          !excludedPlayers.includes(performer.players?.player_name || performer.player_name || '')
        ).slice(0, 10)

        setTopPerformers(filteredTopPerformers)

        // Calculate aggregated top 10 players by 3-dart average
        const playerAggregations = new Map()

        allStats.forEach(stat => {
          const playerName = stat.players?.player_name || stat.player_name || 'Unknown'
          const playerId = stat.player_id
          
          if (excludedPlayers.includes(playerName)) return

          if (!playerAggregations.has(playerId)) {
            playerAggregations.set(playerId, {
              player_id: playerId,
              player_name: playerName,
              total_score: 0,
              total_darts: 0,
              tournament_count: 0,
              total_matches: 0,
              total_180s: 0,
              high_finish: 0,
              total_win_rate_sets: 0,
              total_first_9: 0,
              teams: new Set()
            })
          }

          const player = playerAggregations.get(playerId)
          player.total_score += stat.total_score
          player.total_darts += stat.total_darts
          player.tournament_count += 1
          player.total_matches += stat.match_played
          player.total_180s += stat.scores_180
          player.high_finish = Math.max(player.high_finish, stat.high_finish)
          player.total_win_rate_sets += stat.win_rate_sets
          player.total_first_9 += stat.first_9_avg
          player.teams.add(stat.teams?.team_name || 'Unknown')
        })

        const aggregatedPlayers = Array.from(playerAggregations.values()).map(player => ({
          ...player,
          // Verified calculation: (total_score / total_darts) * 3
          avg_three_dart: player.total_darts > 0 ? Math.round(((player.total_score / player.total_darts) * 3) * 100) / 100 : 0,
          avg_win_rate_sets: Math.round((player.total_win_rate_sets / player.tournament_count) * 1000) / 10,
          avg_first_9: Math.round((player.total_first_9 / player.tournament_count) * 100) / 100,
          teams_played: Array.from(player.teams).join(', ')
        }))

        aggregatedPlayers.sort((a, b) => b.avg_three_dart - a.avg_three_dart)
        setTopAggregatedPlayers(aggregatedPlayers.slice(0, 10))
        
        const uniquePlayers = new Set(allStats.map(stat => stat.player_id))
        const totalMatches = allStats.reduce((sum, stat) => sum + stat.match_played, 0)
        const totalScore = allStats.reduce((sum, stat) => sum + stat.total_score, 0)
        const totalDarts = allStats.reduce((sum, stat) => sum + stat.total_darts, 0)
        const avgDartAvg = totalDarts > 0 ? ((totalScore / totalDarts) * 3) : 0
        
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

  // Consistent column design for both tables
  const aggregatedColumns: Column[] = [
    {
      key: 'rank',
      label: 'Rank',
      render: (value: any, row: any, index?: number) => (
        <div className="flex items-center justify-center">
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
            (index || 0) === 0 ? 'bg-yellow-500 text-white' : 
            (index || 0) === 1 ? 'bg-gray-400 text-white' : 
            (index || 0) === 2 ? 'bg-amber-600 text-white' : 
            'bg-primary-100 text-primary-700'
          }`}>
            {(index || 0) + 1}
          </span>
        </div>
      )
    },
    {
      key: 'player_name',
      label: 'Player',
      render: (value: string, row: any) => (
        <div>
          <div className="font-semibold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.tournament_count} tournaments</div>
        </div>
      )
    },
    {
      key: 'avg_three_dart',
      label: '3-Dart Avg',
      render: (value: number) => (
        <span className="font-bold text-primary-600 text-lg">{value.toFixed(2)}</span>
      )
    },
    {
      key: 'avg_first_9',
      label: 'First 9 Avg',
      render: (value: number) => (
        <span className="font-medium text-gray-700">{value.toFixed(2)}</span>
      )
    },
    {
      key: 'total_matches',
      label: 'Matches',
      render: (value: number) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'avg_win_rate_sets',
      label: 'Win Rate',
      render: (value: number) => (
        <div className="flex items-center">
          <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${Math.min(value, 100)}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">{value.toFixed(1)}%</span>
        </div>
      )
    },
    {
      key: 'total_180s',
      label: '180s',
      render: (value: number) => (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
          {value}
        </span>
      )
    },
    {
      key: 'high_finish',
      label: 'High Finish',
      render: (value: number) => (
        <span className="font-medium text-red-600">{value}</span>
      )
    }
  ]

  const performersColumns: Column[] = [
    {
      key: 'rank',
      label: 'Rank',
      render: (value: any, row: any, index?: number) => (
        <div className="flex items-center justify-center">
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
            (index || 0) === 0 ? 'bg-green-500 text-white' : 
            (index || 0) === 1 ? 'bg-green-400 text-white' : 
            (index || 0) === 2 ? 'bg-green-300 text-white' : 
            'bg-gray-100 text-gray-700'
          }`}>
            {(index || 0) + 1}
          </span>
        </div>
      )
    },
    {
      key: 'player_name',
      label: 'Player',
      render: (value: any, row: PlayerStat) => (
        <div>
          <div className="font-semibold text-gray-900">{row.players?.player_name || value}</div>
          <div className="text-xs text-gray-500">{row.teams?.team_name}</div>
        </div>
      )
    },
    {
      key: 'three_dart_avg',
      label: '3-Dart Avg',
      render: (value: number) => (
        <span className="font-bold text-primary-600 text-lg">{value.toFixed(2)}</span>
      )
    },
    {
      key: 'tournament_name',
      label: 'Tournament',
      render: (value: any, row: PlayerStat) => (
        <div>
          <div className="font-medium text-gray-700">{row.tournaments?.tournament_name}</div>
          <div className="text-xs text-gray-500">{row.tournaments?.tournament_year}</div>
        </div>
      )
    },
    {
      key: 'win_rate_sets',
      label: 'Win Rate',
      render: (value: number) => (
        <div className="flex items-center">
          <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${Math.min(value * 100, 100)}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">{(value * 100).toFixed(1)}%</span>
        </div>
      )
    },
    {
      key: 'scores_180',
      label: '180s',
      render: (value: number) => (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
          {value}
        </span>
      )
    },
    {
      key: 'high_finish',
      label: 'High Finish',
      render: (value: number) => (
        <span className="font-medium text-red-600">{value}</span>
      )
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
          <h1 className="text-3xl font-bold text-gray-900">Royal Darts Dashboard</h1>
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

      {/* Top 10 Aggregated Players Table */}
      <div className="mt-8">
        <DataTable
          data={topAggregatedPlayers}
          columns={aggregatedColumns}
          title="🏆 Top 10 Players (Aggregated Performance Across All Tournaments)"
        />
      </div>

      {/* Top Single Tournament Performances */}
      <div className="mt-8">
        <DataTable
          data={topPerformers}
          columns={performersColumns}
          title="⭐ Top 10 Single Tournament Performances"
        />
      </div>
    </div>
  )
}
