import { useEffect, useState } from 'react'
import { getTeams, getPlayerStats } from '@/lib/queries'
import { Team, PlayerStat } from '@/lib/supabase'
import DataTable from '@/components/DataTable'

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [teamStats, setTeamStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamsData, allStats] = await Promise.all([
          getTeams(),
          getPlayerStats()
        ])

        setTeams(teamsData)

        // Aggregate team statistics
        const aggregatedTeamStats = teamsData.map(team => {
          const teamStatsArray = allStats.filter(stat => stat.team_id === team.team_id)
          
          if (teamStatsArray.length === 0) {
            return {
              team_id: team.team_id,
              team_name: team.team_name,
              player_count: 0,
              avg_three_dart: 0,
              avg_win_rate: 0,
              total_matches: 0,
              tournaments: 0
            }
          }

          const uniquePlayers = new Set(teamStatsArray.map(stat => stat.player_id))
          const uniqueTournaments = new Set(teamStatsArray.map(stat => stat.tournament_id))
          const totalMatches = teamStatsArray.reduce((sum, stat) => sum + stat.match_played, 0)
          const avgThreeDart = teamStatsArray.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / teamStatsArray.length
          const avgWinRate = teamStatsArray.reduce((sum, stat) => sum + stat.win_rate_sets, 0) / teamStatsArray.length

          return {
            team_id: team.team_id,
            team_name: team.team_name,
            player_count: uniquePlayers.size,
            avg_three_dart: Math.round(avgThreeDart * 100) / 100,
            avg_win_rate: Math.round(avgWinRate * 1000) / 10,
            total_matches: totalMatches,
            tournaments: uniqueTournaments.size
          }
        })

        setTeamStats(aggregatedTeamStats)
      } catch (error) {
        console.error('Error fetching teams:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const columns = [
    {
      key: 'team_name',
      label: 'Team Name',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'player_count',
      label: 'Players'
    },
    {
      key: 'tournaments',
      label: 'Tournaments'
    },
    {
      key: 'total_matches',
      label: 'Total Matches'
    },
    {
      key: 'avg_three_dart',
      label: 'Avg 3-Dart'
    },
    {
      key: 'avg_win_rate',
      label: 'Avg Win Rate (%)'
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
          <h1 className="text-2xl font-semibold text-gray-900">Teams</h1>
          <p className="mt-2 text-sm text-gray-700">
            Team statistics and performance overview
          </p>
        </div>
      </div>

      <div className="mt-8">
        <DataTable
          data={teamStats.sort((a, b) => b.avg_three_dart - a.avg_three_dart)}
          columns={columns}
          title={`All Teams (${teams.length} total)`}
        />
      </div>
    </div>
  )
}
