import { useEffect, useState } from 'react'
import { getTournaments, getTopPerformers, getPlayerStats } from '@/lib/queries'
import StatCard from '@/components/StatCard'
import { TrendingUp, Users, Target, Trophy, Zap, Award, BarChart3, Activity } from 'lucide-react'

interface DashboardStats {
  totalPlayers: number
  totalMatches: number
  totalSets: number
  totalLegs: number
  avgThreeDart: number
  avgFirstNine: number
  avgWinRateSets: number
  totalTournaments: number
  highest180s: number
  highestFinish: number
  mostMatches: number
  bestAverage: number
  totalScore: number
  totalDarts: number
  avgScorePerDart: number
}

export default function EnhancedDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [topPerformers, setTopPerformers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAdvancedStats() {
      try {
        const [tournamentsData, allStats] = await Promise.all([
          getTournaments(),
          getPlayerStats()
        ])

        // Calculate comprehensive statistics
        const uniquePlayers = new Set(allStats.map(stat => stat.player_id))
        const totalMatches = allStats.reduce((sum, stat) => sum + stat.match_played, 0)
        const totalSets = allStats.reduce((sum, stat) => sum + stat.sets_played, 0)
        const totalLegs = allStats.reduce((sum, stat) => sum + stat.legs_played, 0)
        const totalScore = allStats.reduce((sum, stat) => sum + stat.total_score, 0)
        const totalDarts = allStats.reduce((sum, stat) => sum + stat.total_darts, 0)
        
        const avgThreeDart = allStats.reduce((sum, stat) => sum + stat.three_dart_avg, 0) / allStats.length
        const avgFirstNine = allStats.reduce((sum, stat) => sum + stat.first_9_avg, 0) / allStats.length
        const avgWinRateSets = allStats.reduce((sum, stat) => sum + stat.win_rate_sets, 0) / allStats.length
        
        const highest180s = Math.max(...allStats.map(s => s.scores_180))
        const highestFinish = Math.max(...allStats.map(s => s.high_finish))
        const mostMatches = Math.max(...allStats.map(s => s.match_played))
        const bestAverage = Math.max(...allStats.map(s => s.three_dart_avg))

        setStats({
          totalPlayers: uniquePlayers.size,
          totalMatches,
          totalSets,
          totalLegs,
          avgThreeDart: Math.round(avgThreeDart * 100) / 100,
          avgFirstNine: Math.round(avgFirstNine * 100) / 100,
          avgWinRateSets: Math.round(avgWinRateSets * 1000) / 10,
          totalTournaments: tournamentsData.length,
          highest180s,
          highestFinish,
          mostMatches,
          bestAverage: Math.round(bestAverage * 100) / 100,
          totalScore,
          totalDarts,
          avgScorePerDart: Math.round((totalScore / totalDarts) * 100) / 100
        })

        const topPerfs = await getTopPerformers('three_dart_avg', 5)
        setTopPerformers(topPerfs)
      } catch (error) {
        console.error('Error fetching enhanced stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdvancedStats()
  }, [])

  if (loading || !stats) {
    return <div className="animate-pulse">Loading enhanced dashboard...</div>
  }

  return (
    <div className="space-y-8">
      {/* Hero Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          title="Players"
          value={stats.totalPlayers}
          icon={<Users className="h-8 w-8 text-blue-500" />}
          trend={{ value: 12, label: "vs last season", isPositive: true }}
        />
        <StatCard
          title="Tournaments"
          value={stats.totalTournaments}
          icon={<Trophy className="h-8 w-8 text-yellow-500" />}
        />
        <StatCard
          title="Total Matches"
          value={stats.totalMatches}
          icon={<Target className="h-8 w-8 text-green-500" />}
        />
        <StatCard
          title="Sets Played"
          value={stats.totalSets}
          icon={<BarChart3 className="h-8 w-8 text-purple-500" />}
        />
        <StatCard
          title="Legs Played"
          value={stats.totalLegs}
          icon={<Activity className="h-8 w-8 text-red-500" />}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Avg 3-Dart"
          value={stats.avgThreeDart}
          subtitle="Overall average"
          icon={<TrendingUp className="h-8 w-8 text-blue-600" />}
        />
        <StatCard
          title="Avg First 9"
          value={stats.avgFirstNine}
          subtitle="Opening performance"
          icon={<Zap className="h-8 w-8 text-orange-500" />}
        />
        <StatCard
          title="Win Rate"
          value={`${stats.avgWinRateSets}%`}
          subtitle="Sets won"
          icon={<Award className="h-8 w-8 text-green-600" />}
        />
        <StatCard
          title="Score/Dart"
          value={stats.avgScorePerDart}
          subtitle="Average per dart"
          icon={<Target className="h-8 w-8 text-indigo-500" />}
        />
      </div>

      {/* Record Holders */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Best Average"
          value={stats.bestAverage}
          subtitle="Tournament record"
          icon={<Award className="h-8 w-8 text-gold-500" />}
        />
        <StatCard
          title="Highest Finish"
          value={stats.highestFinish}
          subtitle="Single checkout"
          icon={<Zap className="h-8 w-8 text-yellow-600" />}
        />
        <StatCard
          title="Most 180s"
          value={stats.highest180s}
          subtitle="In one tournament"
          icon={<Target className="h-8 w-8 text-red-600" />}
        />
        <StatCard
          title="Most Matches"
          value={stats.mostMatches}
          subtitle="Tournament games"
          icon={<Activity className="h-8 w-8 text-purple-600" />}
        />
      </div>
    </div>
  )
}
