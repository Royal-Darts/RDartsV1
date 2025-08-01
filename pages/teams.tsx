import { useEffect, useState } from 'react'
import { getTeams, getPlayerStats } from '@/lib/queries'
import { Team, PlayerStat } from '@/lib/supabase'
import DataTable from '@/components/DataTable'
import { Filter, X } from 'lucide-react'

interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any, index?: number) => React.ReactNode
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [teamStats, setTeamStats] = useState<any[]>([])
  const [filteredStats, setFilteredStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [minPlayers, setMinPlayers] = useState<number>(0)
  const [minTournaments, setMinTournaments] = useState<number>(0)
  const [minMatches, setMinMatches] = useState<number>(0)
  const [searchTeam, setSearchTeam] = useState<string>('')

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
        const filteredTeams = teamsData.filter(team => 
          !excludedTeams.includes(team.team_name)
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
              avg_win_rate: 0,
              total_matches: 0,
              tournaments: 0
            }
          }

          const uniquePlayers = new Set(teamStatsArray.map(stat => stat.player_id))
          const uniqueTournaments = new Set(teamStatsArray.map(stat => stat.tournament_id))
          const totalMatches = teamStatsArray.reduce((sum, stat) => sum + (stat.match_played || 0), 0)
          const avgThreeDart = teamStatsArray.reduce((sum, stat) => sum + (stat.three_dart_avg || 0), 0) / teamStatsArray.length
          const avgWinRate = teamStatsArray.reduce((sum, stat) => sum + (stat.win_rate_sets || 0), 0) / teamStatsArray.length

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
        
        // Sort by win rate (default)
        const sorted = aggregatedTeamStats.sort((a, b) => b.avg_win_rate - a.avg_win_rate)
        setFilteredStats(sorted)

      } catch (error) {
        console.error('Error fetching teams:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (teamStats.length > 0) {
      const filtered = teamStats.filter(team => {
        return (
          team.player_count >= minPlayers &&
          team.tournaments >= minTournaments &&
          team.total_matches >= minMatches &&
          team.team_name.toLowerCase().includes(searchTeam.toLowerCase())
        )
      }).sort((a, b) => b.avg_win_rate - a.avg_win_rate)

      setFilteredStats(filtered)
    }
  }, [minPlayers, minTournaments, minMatches, searchTeam, teamStats])

  const clearFilters = () => {
    setMinPlayers(0)
    setMinTournaments(0)
    setMinMatches(0)
    setSearchTeam('')
  }

  const columns: Column[] = [
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
      key: 'avg_win_rate',
      label: 'Set Win Rate (%)',
      render: (value: number) => (
        <span className="font-semibold text-primary-600">{value.toFixed(1)}%</span>
      )
    },
    {
      key: 'avg_three_dart',
      label: 'Avg 3-Dart',
      render: (value: number) => value.toFixed(2)
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
            Team statistics and performance overview (sorted by win rate)
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Team
            </label>
            <input
              type="text"
              value={searchTeam}
              onChange={(e) => setSearchTeam(e.target.value)}
              placeholder="Enter team name..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Players
            </label>
            <select
              value={minPlayers}
              onChange={(e) => setMinPlayers(parseInt(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value={0}>All</option>
              <option value={1}>1+</option>
              <option value={3}>3+</option>
              <option value={5}>5+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Tournaments
            </label>
            <select
              value={minTournaments}
              onChange={(e) => setMinTournaments(parseInt(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value={0}>All</option>
              <option value={1}>1+</option>
              <option value={2}>2+</option>
              <option value={3}>3+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Matches
            </label>
            <select
              value={minMatches}
              onChange={(e) => setMinMatches(parseInt(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value={0}>All</option>
              <option value={10}>10+</option>
              <option value={25}>25+</option>
              <option value={50}>50+</option>
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {filteredStats.length} of {teams.length} teams
          </div>
        </div>
      </div>

      <div className="mt-8">
        <DataTable
          data={filteredStats}
          columns={columns}
          title="All Teams (Sorted by Win Rate)"
        />
      </div>
    </div>
  )
}
