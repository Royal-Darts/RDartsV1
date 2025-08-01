import { useEffect, useState } from 'react'
import { getTournaments, getPlayerStats } from '@/lib/queries'
import { Tournament, PlayerStat } from '@/lib/supabase'
import DataTable from '@/components/DataTable'

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [tournamentStats, setTournamentStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [tournamentsData, allStats] = await Promise.all([
          getTournaments(),
          getPlayerStats()
        ])

        setTournaments(tournamentsData)

        // Aggregate tournament statistics
        const aggregatedTournamentStats = tournamentsData.map(tournament => {
          const tournamentStatsArray = allStats.filter(stat => stat.tournament_id === tournament.tournament_id)
          
          if (tournamentStatsArray.length === 0) {
            return {
              tournament_id: tournament.tournament_id,
              tournament_name: tournament.tournament_name,
              tournament_year: tournament.tournament_year,
              participant_count: 0,
              avg_three_dart: 0,
              total_matches: 0,
              teams_count: 0,
              highest_avg: 0,
              highest_finish: 0
            }
          }

          const uniquePlayers = new Set(tournamentStatsArray.map(stat => stat.player_id))
          const uniqueTeams = new Set(tournamentStatsArray.map(stat => stat.team_id))
          const totalMatches = tournamentStatsArray.reduce((sum, stat) => sum + stat.match_played, 0)
          const avgThreeDart = tournamentStatsArray.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / tournamentStatsArray.length
          const highestAvg = Math.max(...tournamentStatsArray.map(stat => stat.three_dart_avg))
          const highestFinish = Math.max(...tournamentStatsArray.map(stat => stat.high_finish))

          return {
            tournament_id: tournament.tournament_id,
            tournament_name: tournament.tournament_name,
            tournament_year: tournament.tournament_year,
            participant_count: uniquePlayers.size,
            avg_three_dart: Math.round(avgThreeDart * 100) / 100,
            total_matches: totalMatches,
            teams_count: uniqueTeams.size,
            highest_avg: Math.round(highestAvg * 100) / 100,
            highest_finish: highestFinish
          }
        })

        setTournamentStats(aggregatedTournamentStats)
      } catch (error) {
        console.error('Error fetching tournaments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const columns = [
    {
      key: 'tournament_name',
      label: 'Tournament',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-gray-500 text-sm">{row.tournament_year}</div>
        </div>
      )
    },
    {
      key: 'participant_count',
      label: 'Participants'
    },
    {
      key: 'teams_count',
      label: 'Teams'
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
      key: 'highest_avg',
      label: 'Highest Avg'
    },
    {
      key: 'highest_finish',
      label: 'Highest Finish'
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
          <h1 className="text-2xl font-semibold text-gray-900">Tournaments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tournament overview and statistics
          </p>
        </div>
      </div>

      <div className="mt-8">
        <DataTable
          data={tournamentStats.sort((a, b) => b.tournament_year - a.tournament_year)}
          columns={columns}
          title={`All Tournaments (${tournaments.length} total)`}
        />
      </div>
    </div>
  )
}
