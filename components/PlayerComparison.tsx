import { useState, useEffect } from 'react'
import { getPlayers, getPlayerStats } from '@/lib/queries'
import { Player, PlayerStat } from '@/lib/supabase'
import { Combobox } from '@headlessui/react'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'

export default function PlayerComparison() {
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [playerStats, setPlayerStats] = useState<{[key: number]: PlayerStat[]}>({})
  const [comparisonData, setComparisonData] = useState<any[]>([])

  useEffect(() => {
    async function fetchPlayers() {
      const playersData = await getPlayers()
      setPlayers(playersData)
    }
    fetchPlayers()
  }, [])

  useEffect(() => {
    async function fetchPlayerStats() {
      for (const player of selectedPlayers) {
        if (!playerStats[player.player_id]) {
          const stats = await getPlayerStats({ playerId: player.player_id })
          setPlayerStats(prev => ({
            ...prev,
            [player.player_id]: stats
          }))
        }
      }
    }
    
    if (selectedPlayers.length > 0) {
      fetchPlayerStats()
    }
  }, [selectedPlayers])

  useEffect(() => {
    if (selectedPlayers.length >= 2 && Object.keys(playerStats).length >= 2) {
      const metrics = [
        'Three Dart Avg',
        'First 9 Avg', 
        'Win Rate Sets',
        'Win Rate Legs',
        'High Finish',
        '100+ Scores',
        '140+ Scores',
        '180s'
      ]

      const data = metrics.map(metric => {
        const dataPoint: any = { metric }
        
        selectedPlayers.forEach(player => {
          const stats = playerStats[player.player_id]
          if (stats && stats.length > 0) {
            const avgStats = stats.reduce((acc, stat) => {
              return {
                three_dart_avg: acc.three_dart_avg + stat.three_dart_avg,
                first_9_avg: acc.first_9_avg + stat.first_9_avg,
                win_rate_sets: acc.win_rate_sets + stat.win_rate_sets,
                win_rate_legs: acc.win_rate_legs + stat.win_rate_legs,
                high_finish: Math.max(acc.high_finish, stat.high_finish),
                scores_100_plus: acc.scores_100_plus + stat.scores_100_plus,
                scores_140_plus: acc.scores_140_plus + stat.scores_140_plus,
                scores_180: acc.scores_180 + stat.scores_180
              }
            }, {
              three_dart_avg: 0, first_9_avg: 0, win_rate_sets: 0, win_rate_legs: 0,
              high_finish: 0, scores_100_plus: 0, scores_140_plus: 0, scores_180: 0
            })

            const numStats = stats.length
            let value = 0
            
            switch (metric) {
              case 'Three Dart Avg':
                value = avgStats.three_dart_avg / numStats
                break
              case 'First 9 Avg':
                value = avgStats.first_9_avg / numStats
                break
              case 'Win Rate Sets':
                value = (avgStats.win_rate_sets / numStats) * 100
                break
              case 'Win Rate Legs':
                value = (avgStats.win_rate_legs / numStats) * 100
                break
              case 'High Finish':
                value = avgStats.high_finish
                break
              case '100+ Scores':
                value = avgStats.scores_100_plus / numStats
                break
              case '140+ Scores':
                value = avgStats.scores_140_plus / numStats
                break
              case '180s':
                value = avgStats.scores_180 / numStats
                break
            }
            
            dataPoint[player.player_name] = Math.round(value * 100) / 100
          }
        })
        
        return dataPoint
      })

      setComparisonData(data)
    }
  }, [selectedPlayers, playerStats])

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Player Comparison Tool</h3>
      
      {/* Player Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Players to Compare (2-4 players)
        </label>
        <div className="flex flex-wrap gap-2">
          {players.slice(0, 20).map(player => (
            <button
              key={player.player_id}
              onClick={() => {
                if (selectedPlayers.includes(player)) {
                  setSelectedPlayers(prev => prev.filter(p => p.player_id !== player.player_id))
                } else if (selectedPlayers.length < 4) {
                  setSelectedPlayers(prev => [...prev, player])
                }
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedPlayers.includes(player)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {player.player_name}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Chart */}
      {selectedPlayers.length >= 2 && comparisonData.length > 0 && (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={comparisonData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
              {selectedPlayers.map((player, index) => (
                <Radar
                  key={player.player_id}
                  name={player.player_name}
                  dataKey={player.player_name}
                  stroke={['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'][index]}
                  fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'][index]}
                  fillOpacity={0.3}
                />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Stats Table */}
      {selectedPlayers.length >= 2 && (
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                {selectedPlayers.map(player => (
                  <th key={player.player_id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {player.player_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comparisonData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.metric}
                  </td>
                  {selectedPlayers.map(player => (
                    <td key={player.player_id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row[player.player_name] || 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
