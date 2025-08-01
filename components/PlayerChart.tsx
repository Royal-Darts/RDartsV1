import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface PlayerChartProps {
  data: any[]
  title: string
}

export default function PlayerChart({ data, title }: PlayerChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tournament_name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="three_dart_avg" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="3-Dart Average"
            />
            <Line 
              type="monotone" 
              dataKey="win_rate_sets" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Set Win Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
