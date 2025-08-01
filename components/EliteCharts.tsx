import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts'

interface ChartProps {
  data: any[]
  type: 'line' | 'area' | 'bar' | 'radar' | 'scatter' | 'pie'
  title?: string
  subtitle?: string
  height?: number
  showLegend?: boolean
}

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F97316']

export default function EliteCharts({ 
  data, 
  type, 
  title, 
  subtitle, 
  height = 400, 
  showLegend = true 
}: ChartProps) {
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = (): JSX.Element => {
    // If no data, return empty state
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-slate-400">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No data available</p>
          </div>
        </div>
      )
    }

    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {Object.keys(data[0] || {}).filter(key => key !== 'name').map((key, index) => (
              <Line 
                key={key}
                type="monotone" 
                dataKey={key} 
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              {Object.keys(data[0] || {}).filter(key => key !== 'name').map((key, index) => (
                <linearGradient key={key} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {Object.keys(data[0] || {}).filter(key => key !== 'name').map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                fill={`url(#gradient${index})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {Object.keys(data[0] || {}).filter(key => key !== 'name').map((key, index) => (
              <Bar 
                key={key}
                dataKey={key} 
                fill={COLORS[index % COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        )

      case 'radar':
        return (
          <RadarChart data={data}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {Object.keys(data[0] || {}).filter(key => key !== 'metric').map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            ))}
          </RadarChart>
        )

      case 'scatter':
        return (
          <ScatterChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="x" stroke="#9CA3AF" />
            <YAxis dataKey="y" stroke="#9CA3AF" />
            <Tooltip content={<CustomTooltip />} />
            <Scatter dataKey="y" fill={COLORS[0]} />
          </ScatterChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <p>Unsupported chart type: {type}</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="card-elite p-6">
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-slate-400">{subtitle}</p>
          )}
        </div>
      )}
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
