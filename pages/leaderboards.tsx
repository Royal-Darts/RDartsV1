import { useState, useEffect } from 'react'
import { getPlayerStats } from '@/lib/queries'
import UniversalSearch from '@/components/UniversalSearch'
import DataTable from '@/components/DataTable'

export default function LeaderboardsPage() {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [sortBy, setSortBy] = useState('three_dart_avg')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results)
  }

  const sortedResults = [...searchResults].sort((a, b) => {
    const aValue = a[sortBy] || 0
    const bValue = b[sortBy] || 0
    
    if (sortOrder === 'desc') {
      return bValue - aValue
    }
    return aValue - bValue
  })

  const columns = [
    {
      key: 'rank',
      label: 'Rank',
      render: (value: any, row: any, index: number) => index + 1
    },
    {
      key: 'player_name',
      label: 'Player',
      render: (value: any, row: any) => (
        <div>
          <div className="font-medium">{row.players?.player_name}</div>
          <div className="text-sm text-gray-500">{row.teams?.team_name}</div>
        </div>
      )
    },
    {
      key: 'tournament_name',
      label: 'Tournament',
      render: (value: any, row: any) => row.tournaments?.tournament_name
    },
    {
      key: 'three_dart_avg',
      label: '3-Dart Avg',
      render: (value: number) => (
        <span className={`font-medium ${value >= 45 ? 'text-green-600' : value >= 35 ? 'text-blue-600' : 'text-gray-600'}`}>
          {value.toFixed(2)}
        </span>
      )
    },
    {
      key: 'first_9_avg',
      label: 'First 9 Avg',
      render: (value: number) => value.toFixed(2)
    },
    {
      key: 'win_rate_sets',
      label: 'Win Rate',
      render: (value: number) => (
        <span className={`font-medium ${value >= 0.7 ? 'text-green-600' : value >= 0.5 ? 'text-blue-600' : 'text-red-600'}`}>
          {(value * 100).toFixed(1)}%
        </span>
      )
    },
    {
      key: 'high_finish',
      label: 'High Finish',
      render: (value: number) => (
        <span className={`font-bold ${value >= 100 ? 'text-yellow-600' : 'text-gray-600'}`}>
          {value}
        </span>
      )
    }
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Dynamic Leaderboards</h1>
          <p className="mt-2 text-sm text-gray-700">
            Advanced leaderboards with filtering, sorting, and search capabilities
          </p>
        </div>
      </div>

      <UniversalSearch onResultsChange={handleSearchResults} />

      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="three_dart_avg">3-Dart Average</option>
            <option value="first_9_avg">First 9 Average</option>
            <option value="win_rate_sets">Win Rate</option>
            <option value="high_finish">High Finish</option>
            <option value="scores_180">Most 180s</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="desc">Highest First</option>
            <option value="asc">Lowest First</option>
          </select>
        </div>
      </div>

      <DataTable
        data={sortedResults}
        columns={columns}
        title={`Leaderboard - ${searchResults.length} entries`}
      />
    </div>
  )
}
