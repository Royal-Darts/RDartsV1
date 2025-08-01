import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getPlayerStats } from '@/lib/queries'
import { PlayerStat } from '@/lib/supabase'
import { User, Trophy, Target, TrendingUp, Award, ArrowLeft, Calendar, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface PlayerDetails {
  player_id: number
  player_name: string
  team_name: string
  statistics: PlayerStat[]
  aggregatedStats: {
    totalTournaments: number
    totalMatches: number
    totalSets: number
    totalLegs: number
    totalSetsWon: number
    totalLegsWon: number
    avgThreeDart: number
    avgFirstNine: number
    setWinRate: number
    legWinRate: number
    highFinish: number
    total180s: number
    total140Plus: number
    total100Plus: number
    totalScore: number
    totalDarts: number
    bestLeg: number
    worstLeg: number
  }
}

export default function PlayerStatPage() {
  const router = useRouter()
  const { id } = router.query
  const [playerDetails, setPlayerDetails] = useState<PlayerDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    async function fetchPlayerDetails() {
      try {
        setLoading(true)
        const allStats = await getPlayerStats()
        
        const playerId = parseInt(id as string)
        const playerStatsArray = allStats.filter(stat => stat.player_id === playerId)

        if (playerStatsArray.length === 0) {
          setError('Player not found')
          return
        }

        const playerName = playerStatsArray[0]?.players?.player_name || 'Unknown Player'
        const teamName = playerStatsArray[0]?.teams?.team_name || 'Unknown Team'

        // Calculate aggregated statistics
        const totalMatches = playerStatsArray.reduce((sum, stat) => sum + (stat.match_played || 0), 0)
        const totalSets = playerStatsArray.reduce((sum, stat) => sum + (stat.sets_played || 0), 0)
        const totalLegs = playerStatsArray.reduce((sum, stat) => sum + (stat.legs_played || 0), 0)
        const totalSetsWon = playerStatsArray.reduce((sum, stat) => sum + (stat.sets_won || 0), 0)
        const totalLegsWon = playerStatsArray.reduce((sum, stat) => sum + (stat.legs_won || 0), 0)
        const totalScore = playerStatsArray.reduce((sum, stat) => sum + (stat.total_score || 0), 0)
        const totalDarts = playerStatsArray.reduce((sum, stat) => sum + (stat.total_darts || 0), 0)

        const avgThreeDart = playerStatsArray.reduce((sum, stat) => sum + (stat.three_dart_avg || 0), 0) / playerStatsArray.length
        const avgFirstNine = playerStatsArray.reduce((sum, stat) => sum + (stat.first_9_avg || 0), 0) / playerStatsArray.length
        const highFinish = Math.max(...playerStatsArray.map(stat => stat.high_finish || 0))
        const total180s = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_180 || 0), 0)
        const total140Plus = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_140_plus || 0), 0)
        const total100Plus = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_100_plus || 0), 0)
        const bestLeg = Math.min(...playerStatsArray.map(s => s.best_leg).filter(l => l && l > 0)) || 0
        const worstLeg = Math.max(...playerStatsArray.map(s => s.worst_leg).filter(l => l && l > 0)) || 0

        setPlayerDetails({
          player_id: playerId,
          player_name: playerName,
          team_name: teamName,
          statistics: playerStatsArray,
          aggregatedStats: {
            totalTournaments: playerStatsArray.length,
            totalMatches,
            totalSets,
            totalLegs,
            totalSetsWon,
            totalLegsWon,
            avgThreeDart: Math.round(avgThreeDart * 100) / 100,
            avgFirstNine: Math.round(avgFirstNine * 100) / 100,
            setWinRate: Math.round((totalSetsWon / Math.max(totalSets, 1)) * 1000) / 10,
            legWinRate: Math.round((totalLegsWon / Math.max(totalLegs, 1)) * 1000) / 10,
            highFinish,
            total180s,
            total140Plus,
            total100Plus,
            totalScore,
            totalDarts,
            bestLeg,
            worstLeg
          }
        })
      } catch (error) {
        console.error('Error fetching player details:', error)
        setError('Failed to load player details')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayerDetails()
  }, [id])

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error || !playerDetails) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Player Not Found</h2>
          <p className="text-gray-500 mb-4">{error || 'The requested player could not be found.'}</p>
          <Link href="/players" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Players
          </Link>
        </div>
      </div>
    )
  }

  const { aggregatedStats, statistics } = playerDetails

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/players"
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Players
        </Link>

        <div className="flex items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-6">
            {playerDetails.player_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{playerDetails.player_name}</h1>
            <p className="text-lg text-gray-600">{playerDetails.team_name}</p>
            <p className="text-sm text-gray-500">{aggregatedStats.totalTournaments} tournaments played</p>
          </div>
        </div>
      </div>

      {/* Key Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white text-center">
          <div className="text-3xl font-bold mb-2">{aggregatedStats.avgThreeDart.toFixed(2)}</div>
          <div className="text-blue-100 text-sm">3-Dart Average</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white text-center">
          <div className="text-3xl font-bold mb-2">{aggregatedStats.avgFirstNine.toFixed(2)}</div>
          <div className="text-green-100 text-sm">First 9 Average</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white text-center">
          <div className="text-3xl font-bold mb-2">{aggregatedStats.setWinRate.toFixed(1)}%</div>
          <div className="text-purple-100 text-sm">Set Win Rate</div>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-xl text-white text-center">
          <div className="text-3xl font-bold mb-2">{aggregatedStats.highFinish}</div>
          <div className="text-amber-100 text-sm">High Finish</div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white text-center">
          <div className="text-3xl font-bold mb-2">{aggregatedStats.total180s}</div>
          <div className="text-red-100 text-sm">Total 180s</div>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 rounded-xl text-white text-center">
          <div className="text-3xl font-bold mb-2">{aggregatedStats.totalMatches}</div>
          <div className="text-indigo-100 text-sm">Total Matches</div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Match Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
            Match Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tournaments Played</span>
              <span className="font-semibold">{aggregatedStats.totalTournaments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Matches</span>
              <span className="font-semibold">{aggregatedStats.totalMatches}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Sets</span>
              <span className="font-semibold">{aggregatedStats.totalSets}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sets Won</span>
              <span className="font-semibold text-green-600">{aggregatedStats.totalSetsWon}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Legs</span>
              <span className="font-semibold">{aggregatedStats.totalLegs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Legs Won</span>
              <span className="font-semibold text-green-600">{aggregatedStats.totalLegsWon}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Leg Win Rate</span>
              <span className="font-semibold text-blue-600">{aggregatedStats.legWinRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Scoring Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 text-green-500 mr-2" />
            Scoring Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Score</span>
              <span className="font-semibold">{aggregatedStats.totalScore.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Darts</span>
              <span className="font-semibold">{aggregatedStats.totalDarts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Score Per Dart</span>
              <span className="font-semibold text-blue-600">
                {(aggregatedStats.totalScore / aggregatedStats.totalDarts).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">100+ Scores</span>
              <span className="font-semibold text-green-600">{aggregatedStats.total100Plus}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">140+ Scores</span>
              <span className="font-semibold text-purple-600">{aggregatedStats.total140Plus}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Best Leg</span>
              <span className="font-semibold text-green-600">{aggregatedStats.bestLeg || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Worst Leg</span>
              <span className="font-semibold text-red-600">{aggregatedStats.worstLeg || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament-by-Tournament Statistics */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            Tournament-by-Tournament Performance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tournament</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">3-Dart Avg</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First 9 Avg</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matches</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sets W/L</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">High Finish</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">180s</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">100+ Scores</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statistics.map((stat, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {stat.tournaments?.tournament_name || 'Unknown Tournament'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {stat.tournaments?.tournament_year || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-blue-600">
                      {stat.three_dart_avg?.toFixed(2) || '0.00'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-green-600">
                      {stat.first_9_avg?.toFixed(2) || '0.00'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stat.match_played || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-green-600 font-medium">{stat.sets_won || 0}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-red-600 font-medium">{(stat.sets_played || 0) - (stat.sets_won || 0)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {stat.sets_played ? ((stat.sets_won || 0) / stat.sets_played * 100).toFixed(1) : '0.0'}%
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (stat.sets_played ? (stat.sets_won || 0) / stat.sets_played * 100 : 0) >= 70 ? 'bg-green-500' : 
                            (stat.sets_played ? (stat.sets_won || 0) / stat.sets_played * 100 : 0) >= 50 ? 'bg-blue-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${stat.sets_played ? (stat.sets_won || 0) / stat.sets_played * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-bold px-2 py-1 rounded ${
                      (stat.high_finish || 0) >= 100 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {stat.high_finish || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-red-600">{stat.scores_180 || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-green-600">{stat.scores_100_plus || 0}</span>
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
