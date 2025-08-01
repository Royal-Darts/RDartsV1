import { useEffect, useState } from 'react'
import { getTeams, getPlayerStats } from '@/lib/queries'
import { Team, PlayerStat } from '@/lib/supabase'
import { Target, Users, Trophy, Award, TrendingUp } from 'lucide-react'

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

        // Aggregate team statistics
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

        // Sort by win rate by default (descending)
        const sortedStats = aggregatedTeamStats.sort((a, b) => b.avg_win_rate - a.avg_win_rate)
        setTeamStats(sortedStats)
        
      } catch (error) {
        console.error('Error fetching teams:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Performance Rankings</h1>
            <p className="text-gray-600">Comprehensive analysis of {teams.length} competitive teams</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{teams.length}</div>
              <div className="text-sm text-gray-600">Active Teams</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-500 mr-2" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {teamStats.reduce((sum, t) => sum + t.player_count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Players</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Target className="h-6 w-6 text-green-500 mr-2" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {teamStats.reduce((sum, t) => sum + t.total_matches, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Matches</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-purple-500 mr-2" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {teamStats.length > 0 ? Math.round(teamStats.reduce((sum, t) => sum + t.avg_three_dart, 0) / teamStats.length * 100) / 100 : 0}
              </div>
              <div className="text-sm text-gray-600">Avg 3-Dart</div>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Trophy className="h-5 w-5 text-blue-600 mr-2" />
                Team Performance Leaderboard
              </h3>
              <p className="text-blue-700 text-sm mt-1">
                {teams.length} teams ranked by win rate (highest to lowest)
              </p>
            </div>
            <div className="text-sm text-blue-600 bg-blue-200 px-3 py-1 rounded-full">
              Sorted by Win %
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Rate (%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">3-Dart Avg</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matches</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tournaments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Best Finish</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">180s</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamStats.map((team, index) => (
                <tr key={team.team_id} className={`hover:bg-gray-50 transition-colors ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {team.team_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-medium text-gray-900">{team.team_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {team.player_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`font-bold text-lg mr-3 ${
                        team.avg_win_rate >= 70 ? 'text-green-600' : 
                        team.avg_win_rate >= 50 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {team.avg_win_rate}%
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            team.avg_win_rate >= 70 ? 'bg-green-500' : 
                            team.avg_win_rate >= 50 ? 'bg-blue-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(team.avg_win_rate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-semibold ${
                      team.avg_three_dart >= 40 ? 'text-green-600' : 
                      team.avg_three_dart >= 30 ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {team.avg_three_dart.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {team.total_matches.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {team.tournaments}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-bold px-2 py-1 rounded ${
                      team.high_finish >= 100 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {team.high_finish}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-red-600">{team.total_180s}</span>
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
