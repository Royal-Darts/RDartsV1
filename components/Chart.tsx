import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'

interface ChartProps {
  data: any[]
  type: 'line' | 'bar'
  height?: number
  dataKey?: string
}

export default function Chart({ data, type, height = 300, dataKey = 'performance' }: ChartProps) {
  const ChartComponent = type === 'line' ? LineChart : BarChart
  
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          {type === 'line' ? (
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={{ fill: '#2563eb', strokeWidth: 2 }}
            />
          ) : (
            <Bar dataKey={dataKey} fill="#2563eb" radius={[4, 4, 0, 0]} />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}
