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
            <XAxis 
              dataKey="tournament_name" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: any, name: string) => {
                if (name === 'win_rate_sets') {
                  return [`${value.toFixed(1)}%`, 'Set Win Rate']
                }
                return [typeof value === 'number' ? value.toFixed(2) : value, name]
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="three_dart_avg" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="3-Dart Average"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="first_9_avg" 
              stroke="#10b981" 
              strokeWidth={2}
              name="First 9 Average"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="win_rate_sets" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Set Win Rate (%)"
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="one_dart_avg" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="1-Dart Average"
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
