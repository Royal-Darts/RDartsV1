import { useEffect, useState } from 'react'
import { Activity, TrendingUp, Users, Target, Zap, RefreshCw } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts'

export default function LiveAnalytics() {
  const [liveData, setLiveData] = useState<any>({
    activeMatches: 8,
    onlinePlayers: 156,
    currentPerformance: 42.5,
    recentFinishes: []
  })
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      if (isLive) {
        // Simulate live data updates
        setLiveData((prev: any) => ({
          ...prev,
          activeMatches: Math.max(0, prev.activeMatches + Math.floor(Math.random() * 3) - 1),
          onlinePlayers: Math.max(100, prev.onlinePlayers + Math.floor(Math.random() * 10) - 5),
          currentPerformance: Math.max(30, Math.min(60, prev.currentPerformance + Math.random() * 2 - 1)),
          recentFinishes: [
            ...prev.recentFinishes.slice(-10),
            {
              time: new Date().toLocaleTimeString(),
              player: `Player ${Math.floor(Math.random() * 100)}`,
              finish: Math.floor(Math.random() * 170) + 30,
              timestamp: Date.now()
            }
          ]
        }))
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Activity className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Live Analytics</h1>
            <p className="text-slate-600">Real-time performance monitoring</p>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            isLive ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`}></div>
            <span className="text-sm font-medium">{isLive ? 'LIVE' : 'PAUSED'}</span>
          </div>
        </div>
        
        <button
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
            isLive ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          <RefreshCw className="h-4 w-4" />
          <span>{isLive ? 'Pause' : 'Resume'}</span>
        </button>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Active Matches</p>
              <p className="text-3xl font-bold text-emerald-600">{liveData.activeMatches}</p>
              <p className="text-emerald-600 text-sm">🔴 Live Now</p>
            </div>
            <Target className="h-12 w-12 text-emerald-100" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Online Players</p>
              <p className="text-3xl font-bold text-blue-600">{liveData.onlinePlayers}</p>
              <p className="text-blue-600 text-sm">+12 vs yesterday</p>
            </div>
            <Users className="h-12 w-12 text-blue-100" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Live Performance</p>
              <p className="text-3xl font-bold text-purple-600">{liveData.currentPerformance.toFixed(1)}</p>
              <p className="text-purple-600 text-sm">3-Dart Average</p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-100" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Peak Finish</p>
              <p className="text-3xl font-bold text-amber-600">170</p>
              <p className="text-amber-600 text-sm">Last 10 minutes</p>
            </div>
            <Zap className="h-12 w-12 text-amber-100" />
          </div>
        </div>
      </div>

      {/* Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent High Finishes</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {liveData.recentFinishes.slice(-10).reverse().map((finish: any, index: number) => (
              <div key={finish.timestamp} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-slate-900">{finish.player}</p>
                    <p className="text-xs text-slate-500">{finish.time}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full font-bold text-sm ${
                  finish.finish >= 100 ? 'bg-amber-100 text-amber-800' : 
                  finish.finish >= 70 ? 'bg-emerald-100 text-emerald-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {finish.finish}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { time: '10:00', performance: 41.2 },
                { time: '10:15', performance: 42.1 },
                { time: '10:30', performance: 41.8 },
                { time: '10:45', performance: 43.2 },
                { time: '11:00', performance: liveData.currentPerformance },
              ]}>
                <defs>
                  <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="performance"
                  stroke="#8B5CF6"
                  fillOpacity={1}
                  fill="url(#performanceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Tournament Status */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Active Tournament Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'RDPL Championship', status: 'Semi-Final', players: 32, progress: 75 },
            { name: 'Weekly Elite Cup', status: 'Quarter-Final', players: 16, progress: 62 },
            { name: 'Rising Stars Open', status: 'Round 1', players: 64, progress: 25 },
          ].map((tournament, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">{tournament.name}</h4>
              <p className="text-sm text-slate-600 mb-3">Current: {tournament.status}</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">Progress</span>
                <span className="text-xs font-medium text-slate-700">{tournament.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${tournament.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">{tournament.players} players</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
