import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { getPlayers, getTeams, getTournaments, getPlayerStats } from '@/lib/queries'

interface SearchFilters {
  searchTerm: string
  selectedTournaments: number[]
  selectedTeams: number[]
  minAverage: number
  maxAverage: number
  minWinRate: number
  maxWinRate: number
}

interface UniversalSearchProps {
  onResultsChange: (results: any[]) => void
}

export default function UniversalSearch({ onResultsChange }: UniversalSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    selectedTournaments: [],
    selectedTeams: [],
    minAverage: 0,
    maxAverage: 100,
    minWinRate: 0,
    maxWinRate: 100
  })

  const [tournaments, setTournaments] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [allPlayerStats, setAllPlayerStats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [tournamentsData, teamsData, playerStatsData] = await Promise.all([
          getTournaments(),
          getTeams(),
          getPlayerStats()
        ])
        
        setTournaments(tournamentsData)
        setTeams(teamsData)
        setAllPlayerStats(playerStatsData)
      } catch (error) {
        console.error('Error loading search data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  const filteredResults = useMemo(() => {
    if (!allPlayerStats.length) return []

    return allPlayerStats.filter(stat => {
      // Text search
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const playerMatch = stat.players?.player_name?.toLowerCase().includes(searchLower)
        const teamMatch = stat.teams?.team_name?.toLowerCase().includes(searchLower)
        const tournamentMatch = stat.tournaments?.tournament_name?.toLowerCase().includes(searchLower)
        
        if (!playerMatch && !teamMatch && !tournamentMatch) {
          return false
        }
      }

      // Tournament filter
      if (filters.selectedTournaments.length > 0) {
        if (!filters.selectedTournaments.includes(stat.tournament_id)) {
          return false
        }
      }

      // Team filter
      if (filters.selectedTeams.length > 0) {
        if (!filters.selectedTeams.includes(stat.team_id)) {
          return false
        }
      }

      // Average filter
      if (stat.three_dart_avg < filters.minAverage || stat.three_dart_avg > filters.maxAverage) {
        return false
      }

      // Win rate filter
      const winRatePercent = stat.win_rate_sets * 100
      if (winRatePercent < filters.minWinRate || winRatePercent > filters.maxWinRate) {
        return false
      }

      return true
    })
  }, [allPlayerStats, filters])

  useEffect(() => {
    onResultsChange(filteredResults)
  }, [filteredResults, onResultsChange])

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedTournaments: [],
      selectedTeams: [],
      minAverage: 0,
      maxAverage: 100,
      minWinRate: 0,
      maxWinRate: 100
    })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Advanced Search & Filters
        </h3>
        <button
          onClick={clearFilters}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4 mr-1" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Text Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Players, Teams, Tournaments
          </label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Type to search..."
            />
          </div>
        </div>

        {/* Tournament Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tournaments
          </label>
          <select
            multiple
            value={filters.selectedTournaments.map(String)}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value))
              setFilters(prev => ({ ...prev, selectedTournaments: selected }))
            }}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {tournaments.map(tournament => (
              <option key={tournament.tournament_id} value={tournament.tournament_id}>
                {tournament.tournament_name} ({tournament.tournament_year})
              </option>
            ))}
          </select>
        </div>

        {/* Team Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teams
          </label>
          <select
            multiple
            value={filters.selectedTeams.map(String)}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value))
              setFilters(prev => ({ ...prev, selectedTeams: selected }))
            }}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {teams.map(team => (
              <option key={team.team_id} value={team.team_id}>
                {team.team_name}
              </option>
            ))}
          </select>
        </div>

        {/* Average Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            3-Dart Average Range
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={filters.minAverage}
              onChange={(e) => setFilters(prev => ({ ...prev, minAverage: parseFloat(e.target.value) }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Min"
              min="0"
              max="100"
              step="0.1"
            />
            <input
              type="number"
              value={filters.maxAverage}
              onChange={(e) => setFilters(prev => ({ ...prev, maxAverage: parseFloat(e.target.value) }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Max"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        {/* Win Rate Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Win Rate % Range
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={filters.minWinRate}
              onChange={(e) => setFilters(prev => ({ ...prev, minWinRate: parseFloat(e.target.value) }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Min %"
              min="0"
              max="100"
            />
            <input
              type="number"
              value={filters.maxWinRate}
              onChange={(e) => setFilters(prev => ({ ...prev, maxWinRate: parseFloat(e.target.value) }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Max %"
              min="0"
              max="100"
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between pt-4 border-t">
        <span className="text-sm text-gray-500">
          {isLoading ? 'Loading...' : `${filteredResults.length} results found`}
        </span>
        
        {(filters.selectedTournaments.length > 0 || 
          filters.selectedTeams.length > 0 || 
          filters.searchTerm || 
          filters.minAverage > 0 || 
          filters.maxAverage < 100 ||
          filters.minWinRate > 0 ||
          filters.maxWinRate < 100) && (
          <div className="flex flex-wrap gap-1">
            {filters.searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                "{filters.searchTerm}"
              </span>
            )}
            {filters.selectedTournaments.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {filters.selectedTournaments.length} tournament(s)
              </span>
            )}
            {filters.selectedTeams.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {filters.selectedTeams.length} team(s)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
