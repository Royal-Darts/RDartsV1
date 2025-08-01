import { useEffect, useState } from 'react'
import { getPlayerStats, getTournaments } from '@/lib/queries'
import { PlayerStat, Tournament } from '@/lib/supabase'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter } from 'recharts'

export default function Analytics() {
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, tournamentsData] = await Promise.all([
          getPlayerStats(),
          getTournaments()
        ])

        setPlayerStats(statsData)
        setTournaments(tournamentsData)
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Prepare data for charts
  const tournamentAverages = tournaments.map(tournament => {
    const tournamentStats = playerStats.filter(stat => stat.tournament_id === tournament.tournament_id)
    const avgThreeDart = tournamentStats.length > 0 
      ? tournamentStats.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / tournamentStats.length
      : 0

    return {
      name: tournament.tournament_name,
      year: tournament.tournament_year,
      avg_three_dart: Math.round(avgThreeDart * 100) / 100,
      participants: tournamentStats.length
    }
  }).sort((a, b) => a.year - b.year)

  // Performance distribution data
  const performanceDistribution = playerStats.map(stat => ({
    three_dart_avg: stat.three_dart_avg,
    win_rate: stat.win_rate_sets * 100,
    player_name: stat.players?.player_name || 'Unknown'
  }))

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
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            Advanced statistics and performance insights
          </p>
        </div>
      </div>

      {/* Tournament Averages Chart */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tournament Averages Over Time</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tournamentAverages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg_three_dart" fill="#3b82f6" name="Average 3-Dart" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Distribution Chart */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Distribution (3-Dart Avg vs Win Rate)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={performanceDistribution.slice(0, 50)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="three_dart_avg" name="3-Dart Average" />
              <YAxis dataKey="win_rate" name="Win Rate %" />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'win_rate' ? `${value}%` : value,
                  name === 'win_rate' ? 'Win Rate' : '3-Dart Average'
                ]}
                labelFormatter={(value) => `Player: ${performanceDistribution.find(d => d.three_dart_avg === value)?.player_name || 'Unknown'}`}
              />
              <Scatter dataKey="win_rate" fill="#10b981" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Key Statistics</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Highest 3-Dart Average</dt>
              <dd className="text-2xl font-bold text-primary-600">
                {Math.max(...playerStats.map(s => s.three_dart_avg)).toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Highest Finish</dt>
              <dd className="text-2xl font-bold text-primary-600">
                {Math.max(...playerStats.map(s => s.high_finish))}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Most 180s</dt>
              <dd className="text-2xl font-bold text-primary-600">
                {Math.max(...playerStats.map(s => s.scores_180))}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tournament Participation</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Unique Players</dt>
              <dd className="text-2xl font-bold text-primary-600">
                {new Set(playerStats.map(s => s.player_id)).size}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Teams</dt>
              <dd className="text-2xl font-bold text-primary-600">
                {new Set(playerStats.map(s => s.team_id)).size}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Average Players per Tournament</dt>
              <dd className="text-2xl font-bold text-primary-600">
                {Math.round(playerStats.length / tournaments.length)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
