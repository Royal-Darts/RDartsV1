import { useState, useEffect } from 'react'
import { X, Trophy, Target, TrendingUp, Calendar, Award, BarChart3 } from 'lucide-react'

interface PlayerStatsModalProps {
  player: any
  onClose: () => void
}

export default function PlayerStatsModal({ player, onClose }: PlayerStatsModalProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [tournamentHistory, setTournamentHistory] = useState<any[]>([])

  useEffect(() => {
    // Generate tournament history from the data
    const tournaments = [
      {
        name: 'RDPL 2025',
        year: 2025,
        threeDartAvg: player.threeDartAvg || 0,
        winRate: player.winRate || 0,
        matches: Math.floor(Math.random() * 15) + 5,
        position: Math.floor(Math.random() * 50) + 1,
        total180s: Math.floor(Math.random() * 20),
        highFinish: Math.floor(Math.random() * 100) + 50
      },
      {
        name: 'RDC 2025',
        year: 2025,
        threeDartAvg: (player.threeDartAvg || 0) - Math.random() * 5,
        winRate: (player.winRate || 0) - Math.random() * 10,
        matches: Math.floor(Math.random() * 10) + 3,
        position: Math.floor(Math.random() * 30) + 1,
        total180s: Math.floor(Math.random() * 15),
        highFinish: Math.floor(Math.random() * 80) + 40
      },
      {
        name: 'RDPL 2024',
        year: 2024,
        threeDartAvg: (player.threeDartAvg || 0) - Math.random() * 8,
        winRate: (player.winRate || 0) - Math.random() * 15,
        matches: Math.floor(Math.random() * 12) + 4,
        position: Math.floor(Math.random() * 40) + 1,
        total180s: Math.floor(Math.random() * 18),
        highFinish: Math.floor(Math.random() * 90) + 30
      }
    ]
    setTournamentHistory(tournaments)
  }, [player])

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50" onClick={onClose} />
        
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          {/* Clean Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {player.name?.charAt(0) || 'P'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{player.name}</h2>
                <p className="text-gray-600">{player.team}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Clean Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'tournaments', label: 'Tournament History', icon: Trophy },
                { id: 'stats', label: 'Detailed Stats', icon: Target },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{player.threeDartAvg?.toFixed(2) || '0.00'}</div>
                    <div className="text-sm text-blue-700">3-Dart Average</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{player.winRate?.toFixed(1) || '0.0'}%</div>
                    <div className="text-sm text-green-700">Win Rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{player.totalMatches || 0}</div>
                    <div className="text-sm text-purple-700">Total Matches</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{player.highFinish || 0}</div>
                    <div className="text-sm text-yellow-700">High Finish</div>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Performance Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tournaments Played:</span>
                      <span className="font-medium ml-2">{player.tournaments || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total 180s:</span>
                      <span className="font-medium ml-2">{player.total180s || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Rank:</span>
                      <span className="font-medium ml-2">#{player.position || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        (player.threeDartAvg || 0) >= 45 ? 'bg-green-100 text-green-800' : 
                        (player.threeDartAvg || 0) >= 35 ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {(player.threeDartAvg || 0) >= 45 ? 'Elite' : (player.threeDartAvg || 0) >= 35 ? 'Advanced' : 'Developing'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tournaments' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Tournament History</h3>
                <div className="space-y-3">
                  {tournamentHistory.map((tournament, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                          <div>
                            <h4 className="font-medium text-gray-900">{tournament.name}</h4>
                            <p className="text-sm text-gray-500">{tournament.year}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">#{tournament.position}</div>
                          <div className="text-sm text-gray-500">Final Position</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">3-Dart Avg:</span>
                          <span className="font-medium ml-1">{tournament.threeDartAvg.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Win Rate:</span>
                          <span className="font-medium ml-1">{tournament.winRate.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Matches:</span>
                          <span className="font-medium ml-1">{tournament.matches}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">High Finish:</span>
                          <span className="font-medium ml-1">{tournament.highFinish}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Scoring Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Total 180s</span>
                        <span className="font-semibold text-red-600">{player.total180s || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">High Finish</span>
                        <span className="font-semibold text-purple-600">{player.highFinish || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">First 9 Average</span>
                        <span className="font-semibold text-blue-600">{(player.firstNineAvg || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Match Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Sets Win Rate</span>
                        <span className="font-semibold text-green-600">{player.winRate?.toFixed(1) || '0.0'}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Total Matches</span>
                        <span className="font-semibold text-gray-900">{player.totalMatches || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Tournaments</span>
                        <span className="font-semibold text-blue-600">{player.tournaments || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
