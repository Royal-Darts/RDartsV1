import { useEffect, useState } from 'react'
import { getPlayerStats, getTournaments } from '@/lib/queries'
import { Crown, Trophy, Award, Medal, Star, Target } from 'lucide-react'

export default function HallOfFame() {
  const [champions, setChampions] = useState<any[]>([])
  const [elitePlayers, setElitePlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [playerStats, tournaments] = await Promise.all([
          getPlayerStats(),
          getTournaments()
        ])

        // Tournament Champions
        const championsList = [
          {
            year: 2025,
            tournament: 'RDPL 2025',
            champion: 'RSV Rising Stars',
            runnerUp: 'Rama Darts',
            icon: '🏆',
            color: 'from-yellow-400 to-yellow-600'
          },
          {
            year: 2024,
            tournament: 'RDPL 2024',
            champion: 'UGW',
            runnerUp: 'Vyana Sharp Shooters',
            icon: '🥇',
            color: 'from-gray-400 to-gray-600'
          },
          {
            year: 2025,
            tournament: 'RDC 2025',
            champion: 'RCGC-R',
            runnerUp: 'RCGC-W',
            icon: '🏅',
            color: 'from-amber-400 to-amber-600'
          }
        ]

        // Elite Players (45+ average)
        const elitePlayersList = playerStats
          .filter(stat => stat.three_dart_avg >= 45)
          .sort((a, b) => b.three_dart_avg - a.three_dart_avg)
          .map((stat, index) => ({
            rank: index + 1,
            name: stat.players?.player_name,
            team: stat.teams?.team_name,
            average: stat.three_dart_avg,
            winRate: stat.win_rate_sets * 100,
            total180s: stat.scores_180,
            highFinish: stat.high_finish
          }))

        setChampions(championsList)
        setElitePlayers(elitePlayersList)
      } catch (error) {
        console.error('Error fetching hall of fame data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Clean Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Crown className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hall of Fame</h1>
        <p className="text-gray-600">Celebrating excellence in Royal Darts</p>
      </div>

      {/* Tournament Champions */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200">
          <h2 className="text-xl font-bold text-yellow-800 flex items-center">
            <Trophy className="h-6 w-6 mr-2" />
            Tournament Champions
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid gap-4">
            {champions.map((champion, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${champion.color} rounded-full flex items-center justify-center text-white text-xl`}>
                    {champion.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{champion.tournament}</h3>
                    <p className="text-gray-600">{champion.year}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{champion.champion}</div>
                  <div className="text-sm text-gray-500">
                    Runner-up: <span className="font-medium">{champion.runnerUp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Elite Players */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <h2 className="text-xl font-bold text-blue-800 flex items-center">
            <Star className="h-6 w-6 mr-2" />
            Elite Players (45+ Average)
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">3-Dart Avg</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Win Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">180s</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">High Finish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {elitePlayers.map((player, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {player.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{player.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-600">{player.team}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-green-600">{player.average.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{player.winRate.toFixed(1)}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-red-600">{player.total180s}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-purple-600">{player.highFinish}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Achievement Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Award className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Highest Average</h3>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">56.85</div>
            <div className="text-gray-600">Sashank Shah</div>
            <div className="text-sm text-gray-500">UGW - RDPL 2024</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Target className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Highest Finish</h3>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">121</div>
            <div className="text-gray-600">Jay Vardhan Bansal</div>
            <div className="text-sm text-gray-500">Ladderboard 2024</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Medal className="h-6 w-6 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Most 180s</h3>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">10</div>
            <div className="text-gray-600">Sashank Shah</div>
            <div className="text-sm text-gray-500">RDPL 2025</div>
          </div>
        </div>
      </div>
    </div>
  )
}
