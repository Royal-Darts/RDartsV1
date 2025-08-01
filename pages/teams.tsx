import { useEffect, useState } from 'react'
import { getTeams, getPlayerStats } from '@/lib/queries'
import { Team, PlayerStat } from '@/lib/supabase'
import DataTable from '@/components/DataTable'
import { Target, Users, Trophy, Award } from 'lucide-react'

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [teamStats, setTeamStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Teams to exclude from display
  const excludedTeams = ['Ladderboard', 'Ladies Singles']

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamsData, allStats] = await Promise.all([
          getTeams(),
          getPlayerStats()
        ])

        // Filter out excluded teams
        const filteredTeams = teamsData.filter(
          team => !excludedTeams.includes(team.team_name)
        )
        
        setTeams(filteredTeams)

        // Aggregate team statistics only for non-excluded teams
        const aggregatedTeamStats = filteredTeams.map(team => {
          const teamStatsArray = allStats.filter(stat => stat.team_id === team.team_id)
          
          if (teamStatsArray.length === 0) {
            return {
              team_id: team.team_id,
              team_name: team.team_name,
              player_count: 0,
              avg_three_dart: 0,
              avg_first_9: 0,
              avg_win_rate: 0,
              total_matches: 0,
              tournaments: 0,
              high_finish: 0,
              total_180s: 0
            }
          }

          const uniquePlayers = new Set(teamStatsArray.map(stat => stat.player_id))
          const uniqueTournaments = new Set(teamStatsArray.map(stat => stat.tournament_id))
          const totalMatches = teamStatsArray.reduce((sum, stat) => sum + stat.match_played, 0)
          const avgThreeDart = teamStatsArray.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / teamStatsArray.length
          const avgFirstNine = teamStatsArray.reduce((sum, stat) => sum + stat.first_9_avg, 0) / teamStatsArray.length
          const avgWinRate = teamStatsArray.reduce((sum, stat) => sum + stat.win_rate_sets, 0) / teamStatsArray.length
          const highFinish = Math.max(...teamStatsArray.map(stat => stat.high_finish))
          const total180s = teamStatsArray.reduce((sum, stat) => sum + stat.scores_180, 0)

          return {
            team_id: team.team_id,
            team_name: team.team_name,
            player_count: uniquePlayers.size,
            avg_three_dart: Math.round(avgThreeDart * 100) / 100,
            avg_first_9: Math.round(avgFirstNine * 100) / 100,
            avg_win_rate: Math.round(avgWinRate * 1000) / 10,
            total_matches: totalMatches,
            tournaments: uniqueTournaments.size,
            high_finish: highFinish,
            total180s
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
      key: 'rank',
      label: '#',
      render: (_value: any, _row: any, index?: number) => (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
          (index ?? 0) < 3 ? ((index ?? 0) === 0 ? 'bg-yellow-500' : (index ?? 0) === 1 ? 'bg-gray-400' : 'bg-amber-600') : 'bg-purple-500'
        }`}>
          {(index ?? 0) + 1}
        </div>
      )
    },
    {
      key: 'team_name',
      label: 'Team Name',
      render: (value: string) => (
        <div className="font-medium text-gray-900 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
            {value.charAt(0).toUpperCase()}
          </div>
          {value}
        </div>
      )
    },
    {
      key: 'player_count',
      label: 'Players',
      render: (value: number) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {value}
        </span>
      )
    },
    {
      key: 'tournaments',
      label: 'Tournaments',
      render: (value: number) => (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          {value}
        </span>
      )
    },
    {
      key: 'total_matches',
      label: 'Total Matches',
      render: (value: number) => value.toLocaleString()
    },
    {
      key: 'avg_three_dart',
      label: '3-Dart Avg',
      render: (value: number) => (
        <span className={`font-bold ${value >= 40 ? 'text-green-600' : value >= 30 ? 'text-blue-600' : 'text-gray-600'}`}>
          {value.toFixed(2)}
        </span>
      )
    },
    {
      key: 'avg_first_9',
      label: 'First 9 Avg',
      render: (value: number) => (
        <span className="font-semibold text-purple-600">
          {value.toFixed(2)}
        </span>
      )
    },
    {
      key: 'avg_win_rate',
      label: 'Win Rate (%)',
      render: (value: number) => (
        <div className="flex items-center">
          <span className={`font-medium ${value >= 60 ? 'text-green-600' : value >= 40 ? 'text-blue-600' : 'text-red-600'}`}>
            {value}%
          </span>
          <div className="ml-2 w-12 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${value >= 60 ? 'bg-green-500' : value >= 40 ? 'bg-blue-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(value, 100)}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'high_finish',
      label: 'Best Finish',
      render: (value: number) => (
        <span className={`font-bold px-2 py-1 rounded ${value >= 100 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>
          {value}
        </span>
      )
    },
    {
      key: 'total_180s',
      label: 'Total 180s',
      render: (value: number) => (
        <span className="font-bold text-red-600">{value}</span>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Team Performance Rankings
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive analysis of {teams.length} competitive teams
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-white rounded-lg shadow-md">
            <div className="text-2xl font-bold text-purple-600">{teams.length}</div>
            <div className="text-sm text-purple-600">Active Teams</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-md">
            <div className="text-2xl font-bold text-blue-600">
              {teamStats.reduce((sum, t) => sum + t.player_count, 0)}
            </div>
            <div className="text-sm text-blue-600">Total Players</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-md">
            <div className="text-2xl font-bold text-green-600">
              {teamStats.reduce((sum, t) => sum + t.total_matches, 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Total Matches</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-md">
            <div className="text-2xl font-bold text-yellow-600">
              {Math.round(teamStats.reduce((sum, t) => sum + t.avg_three_dart, 0) / teamStats.length * 100) / 100}
            </div>
            <div className="text-sm text-yellow-600">Avg 3-Dart</div>
          </div>
        </div>

        {/* Teams Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-blue-600">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Trophy className="h-6 w-6 mr-2" />
              Team Performance Leaderboard
            </h3>
            <p className="text-purple-100 mt-1">
              {teams.length} teams ranked by average 3-dart performance
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamStats
                  .sort((a, b) => b.avg_three_dart - a.avg_three_dart)
                  .map((row, index) => (
                    <tr key={row.team_id} className={`hover:bg-gray-50 transition-colors ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''}`}>
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {column.render ? column.render(row[column.key], row, index) : row[column.key]}
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
