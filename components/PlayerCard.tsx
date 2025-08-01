import { useState } from 'react'
import { Eye, TrendingUp, Trophy, Target, Award } from 'lucide-react'

interface PlayerCardProps {
  player: {
    id: number
    name: string
    team: string
    position: number
    threeDartAvg: number
    winRate: number
    totalMatches: number
    tournaments: number
    highFinish: number
    total180s: number
  }
  onClick: () => void
}

export default function PlayerCard({ player, onClick }: PlayerCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {player.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{player.name}</h3>
            <p className="text-xs text-gray-500">{player.team}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">{player.threeDartAvg.toFixed(2)}</div>
          <div className="text-xs text-gray-500">3-Dart Avg</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3 text-center">
        <div>
          <div className="text-sm font-semibold text-gray-900">{player.winRate.toFixed(1)}%</div>
          <div className="text-xs text-gray-500">Win Rate</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">{player.totalMatches}</div>
          <div className="text-xs text-gray-500">Matches</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">{player.highFinish}</div>
          <div className="text-xs text-gray-500">High Finish</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">{player.total180s}</div>
          <div className="text-xs text-gray-500">180s</div>
        </div>
      </div>

      {/* Rank Badge */}
      <div className="mt-3 flex items-center justify-between">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          player.position <= 3 
            ? 'bg-yellow-100 text-yellow-800' 
            : player.position <= 10 
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-700'
        }`}>
          Rank #{player.position}
        </div>
        <Eye className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  )
}
