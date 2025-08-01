import { useState, useEffect } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts'
import { getTournaments, getPlayerStats } from '@/lib/queries'

export default function TrendAnalysis() {
  const [trendData, setTrendData] = useState<any[]>([])
  const [selectedMetric, setSelectedMetric] = useState('three_dart_avg')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrendData() {
      try {
        const [tournaments, allStats] = await Promise.all([
          getTournaments(),
          getPlayerStats()
        ])

        // Group stats by tournament and calculate averages
        const tournamentStats = tournaments.map(tournament => {
          const tournamentData = allStats.filter(stat => stat.tournament_id === tournament.tournament_id)
          
          if (tournamentData.length === 0) {
            return {
              tournament_name: tournament.tournament_name,
              tournament_year: tournament.tournament_year,
              three_dart_avg: 0,
              first_9_avg: 0,
              win_rate_sets: 0,
              high_finish_avg: 0,
              scores_180_avg: 0,
              participants: 0
            }
          }

          const avgStats = tournamentData.reduce((acc, stat) => ({
            three_dart_avg: acc.three_dart_avg + stat.three_dart_avg,
            first_9_avg: acc.first_9_avg + stat.first_9_avg,
            win_rate_sets: acc.win_rate_sets + stat.win_rate_sets,
            high_finish_avg: acc.high_finish_avg + stat.high_finish,
            scores_180_avg: acc.scores_180_avg + stat.scores_180
          }), {
            three_dart_avg: 0,
            first_9_avg: 0, 
            win_rate_sets: 0,
            high_finish_avg: 0,
            scores_180_avg: 0
          })

          const count = tournamentData.length
          return {
            tournament_name: tournament.tournament_name,
            tournament_year: tournament.tournament_year,
            three_dart_avg: Math.round((avgStats.three_dart_avg / count) * 100) / 100,
            first_9_avg: Math.round((avgStats.first_9_avg / count) * 100) / 100,
            win_rate_sets: Math.round((avgStats.win_rate_sets / count) * 1000) / 10,
            high_finish_avg: Math.round(avgStats.high_finish_avg / count),
            scores_180_avg: Math.round((avgStats.scores_180_avg / count) * 100) / 100,
            participants: count
          }
        }).sort((a, b) => a.tournament_year - b.tournament_year)

        setTrendData(tournamentStats)
      } catch (error) {
        console.error('Error fetching trend data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendData()
  }, [])

  const metrics = [
    { key: 'three_dart_avg', label: '3-Dart Average', color: '#8884d8' },
    { key: 'first_9_avg', label: 'First 9 Average', color: '#82ca9d' },
    { key: 'win_rate_sets', label: 'Win Rate %', color: '#ffc658' },
    { key: 'high_finish_avg', label: 'Avg High Finish', color: '#ff7c7c' },
    { key: 'scores_180_avg', label: 'Avg 180s per Player', color: '#8dd1e1' },
    { key: 'participants', label: 'Participants', color: '#d084d0' }
  ]

  const selectedMetricData = metrics.find(m => m.key === selectedMetric)

  if (loading) {
    return <div className="animate-pulse">Loading trend analysis...</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Performance Trends Analysis</h3>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {metrics.map(metric => (
            <option key={metric.key} value={metric.key}>
              {metric.label}
            </option>
          ))}
        </select>
      </div>

      {/* Main Trend Chart */}
      <div className="h-80 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="tournament_name" 
              angle={-45} 
              textAnchor="end" 
              height={80}
              interval={0}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(label) => `Tournament: ${label}`}
              formatter={(value: any) => [value, selectedMetricData?.label]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={selectedMetricData?.color}
              fill={selectedMetricData?.color}
              fillOpacity={0.3}
              name={selectedMetricData?.label}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Multi-Metric Comparison */}
      <div className="h-80">
        <h4 className="text-lg font-medium text-gray-900 mb-4">All Metrics Overview</h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="tournament_name"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="three_dart_avg" 
              stroke="#8884d8" 
              name="3-Dart Avg"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="first_9_avg" 
              stroke="#82ca9d" 
              name="First 9 Avg"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="win_rate_sets" 
              stroke="#ffc658" 
              name="Win Rate %"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Insights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {trendData.length >= 2 && (
          <>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Latest Tournament</h5>
              <p className="text-sm text-blue-700">
                {trendData[trendData.length - 1]?.tournament_name} had {trendData[trendData.length - 1]?.participants} participants
                with avg 3-dart of {trendData[trendData.length - 1]?.three_dart_avg}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-medium text-green-900 mb-2">Best Performance</h5>
              <p className="text-sm text-green-700">
                Highest avg 3-dart: {Math.max(...trendData.map(t => t.three_dart_avg)).toFixed(2)} 
                {trendData.find(t => t.three_dart_avg === Math.max(...trendData.map(t => t.three_dart_avg)))?.tournament_name && 
                  ` in ${trendData.find(t => t.three_dart_avg === Math.max(...trendData.map(t => t.three_dart_avg)))?.tournament_name}`
                }
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h5 className="font-medium text-purple-900 mb-2">Growth Trend</h5>
              <p className="text-sm text-purple-700">
                {trendData[trendData.length - 1]?.three_dart_avg > trendData[0]?.three_dart_avg 
                  ? `↗️ Performance improving over time` 
                  : `📊 Performance varies by tournament`
                }
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
