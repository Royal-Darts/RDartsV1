import { useEffect, useState } from 'react'
import { getPlayerStats } from '@/lib/queries'
import { PlayerStat } from '@/lib/supabase'
import { Trophy, Crown, Medal, Star, Award, Target, Zap } from 'lucide-react'

// RDPL Winners & Runners Up Data
const rdplWinners = [
  { year: 2024, winner: 'Balaji Darts', runnerUp: 'Purti Forever' },
  { year: 2023, winner: 'Royals Super Knights', runnerUp: 'Jai Ho' },
  { year: 2022, winner: 'Biscotti Barrels', runnerUp: 'Tons of Bull' },
  { year: 2021, winner: 'UGW', runnerUp: 'BLC High Rollers' },
  { year: 2020, winner: 'Merino', runnerUp: 'BLC High Rollers' },
  { year: 2019, winner: 'Friends Forever', runnerUp: 'Royals Super Knights' }
]

interface PlayerCareerStats {
  playerId: number
  playerName: string
  tournaments: number
  totalMatches: number
  totalSets: number
  totalSetsWon: number
  setWinRate: number
  avgThreeDart: number
  avgFirstNine: number
  highFinish: number
  total180s: number
  total140Plus: number
  total100Plus: number
}

interface HallOfFameData {
  legends: PlayerCareerStats[]
  champions: PlayerCareerStats[]
  marksmen: PlayerCareerStats[]
  finishers: PlayerCareerStats[]
  veterans: PlayerCareerStats[]
  rookieStars: PlayerCareerStats[]
}

export default function HallOfFame() {
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [loading, setLoading] = useState(true)
  const [hallOfFameData, setHallOfFameData] = useState<HallOfFameData>({
    legends: [],
    champions: [],
    marksmen: [],
    finishers: [],
    veterans: [],
    rookieStars: []
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const statsData = await getPlayerStats()
        setPlayerStats(statsData)

        // Calculate Hall of Fame statistics
        const uniquePlayers = new Set(statsData.map(stat => stat.player_id))
        
        // Aggregate player career statistics with proper null safety
        const playerCareerStats: PlayerCareerStats[] = Array.from(uniquePlayers)
          .map(playerId => {
            const playerStatsArray = statsData.filter(stat => stat.player_id === playerId)
            if (playerStatsArray.length === 0) return null

            const totalMatches = playerStatsArray.reduce((sum, stat) => sum + (stat.match_played || 0), 0)
            const totalSets = playerStatsArray.reduce((sum, stat) => sum + (stat.sets_played || 0), 0)
            const totalSetsWon = playerStatsArray.reduce((sum, stat) => sum + (stat.sets_won || 0), 0)
            const avgThreeDart = playerStatsArray.reduce((sum, stat) => sum + (stat.three_dart_avg || 0), 0) / playerStatsArray.length
            const avgFirstNine = playerStatsArray.reduce((sum, stat) => sum + (stat.first_9_avg || 0), 0) / playerStatsArray.length
            const highFinish = Math.max(...playerStatsArray.map(stat => stat.high_finish || 0))
            const total180s = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_180 || 0), 0)
            const total140Plus = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_140_plus || 0), 0)
            const total100Plus = playerStatsArray.reduce((sum, stat) => sum + (stat.scores_100_plus || 0), 0)

            return {
              playerId,
              playerName: playerStatsArray[0]?.players?.player_name || 'Unknown Player',
              tournaments: playerStatsArray.length,
              totalMatches,
              totalSets,
              totalSetsWon,
              setWinRate: totalSets > 0 ? (totalSetsWon / totalSets) * 100 : 0,
              avgThreeDart: Math.round(avgThreeDart * 100) / 100,
              avgFirstNine: Math.round(avgFirstNine * 100) / 100,
              highFinish,
              total180s,
              total140Plus,
              total100Plus
            }
          })
          .filter((player): player is PlayerCareerStats => player !== null)

        // Create Hall of Fame categories with proper null safety
        const hallOfFame: HallOfFameData = {
          legends: playerCareerStats
            .filter(player => player.tournaments >= 5 && player.avgThreeDart >= 45)
            .sort((a, b) => (b?.avgThreeDart || 0) - (a?.avgThreeDart || 0))
            .slice(0, 10),
          
          champions: playerCareerStats
            .filter(player => player.tournaments >= 3 && player.setWinRate >= 60)
            .sort((a, b) => (b?.setWinRate || 0) - (a?.setWinRate || 0))
            .slice(0, 10),
            
          marksmen: playerCareerStats
            .filter(player => player.total180s >= 3)
            .sort((a, b) => (b?.total180s || 0) - (a?.total180s || 0))
            .slice(0, 10),
            
          finishers: playerCareerStats
            .filter(player => player.highFinish >= 80)
            .sort((a, b) => (b?.highFinish || 0) - (a?.highFinish || 0))
            .slice(0, 10),
            
          veterans: playerCareerStats
            .filter(player => player.tournaments >= 8)
            .sort((a, b) => (b?.tournaments || 0) - (a?.tournaments || 0))
            .slice(0, 10),
            
          rookieStars: playerCareerStats
            .filter(player => player.tournaments <= 3 && player.avgThreeDart >= 35)
            .sort((a, b) => (b?.avgThreeDart || 0) - (a?.avgThreeDart || 0))
            .slice(0, 10)
        }

        setHallOfFameData(hallOfFame)
      } catch (error) {
        console.error('Error fetching Hall of Fame data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Hall of Fame...</p>
        </div>
      </div>
    )
  }

  // Fixed HallOfFameCard component with proper TypeScript types
  const HallOfFameCard = ({ 
    title, 
    icon, 
    players, 
    metric, 
    subtitle, 
    bgColor 
  }: {
    title: string
    icon: React.ReactNode
    players: PlayerCareerStats[]
    metric: keyof PlayerCareerStats
    subtitle: string
    bgColor: string
  }) => (
    <div className={`${bgColor} rounded-lg shadow-lg overflow-hidden`}>
      <div className="p-6 text-white">
        <div className="flex items-center mb-4">
          {icon}
          <h3 className="text-xl font-bold ml-3">{title}</h3>
        </div>
        <p className="text-sm opacity-90 mb-4">{subtitle}</p>
        
        <div className="space-y-3">
          {players.slice(0, 5).map((player, index) => (
            <div key={player.playerId} className="flex items-center justify-between bg-white bg-opacity-20 rounded-lg p-3">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                  index === 1 ? 'bg-gray-300 text-gray-900' : 
                  index === 2 ? 'bg-amber-600 text-white' : 'bg-white bg-opacity-30'
                }`}>
                  {index + 1}
                </div>
                <span className="ml-3 font-medium">{player.playerName}</span>
              </div>
              <span className="font-bold">
                {typeof player[metric] === 'number' 
                  ? (metric === 'setWinRate' 
                      ? `${player[metric].toFixed(1)}%` 
                      : player[metric].toLocaleString())
                  : String(player[metric])
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full">
              <Crown className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            👑 Royal Darts Hall of Fame 👑
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Celebrating the legends, champions, and exceptional performers of Royal Darts tournaments
          </p>
        </div>

        {/* RDPL Champions Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
              RDPL Tournament Champions
            </h2>
            <p className="text-gray-600">Historic winners and runners-up of the Royal Darts Premier League</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rdplWinners.map((winner, index) => (
              <div key={winner.year} className={`rounded-lg shadow-lg overflow-hidden ${
                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-white border-2 border-yellow-200'
              }`}>
                <div className={`p-6 ${index === 0 ? 'text-white' : 'text-gray-900'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">{winner.year}</h3>
                    {index === 0 && <Crown className="h-6 w-6" />}
                  </div>
                  
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${index === 0 ? 'bg-white bg-opacity-20' : 'bg-yellow-50'}`}>
                      <div className="flex items-center">
                        <Trophy className={`h-5 w-5 mr-2 ${index === 0 ? 'text-yellow-200' : 'text-yellow-600'}`} />
                        <span className="font-semibold">Champion</span>
                      </div>
                      <p className="font-bold text-lg">{winner.winner}</p>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${index === 0 ? 'bg-white bg-opacity-20' : 'bg-gray-50'}`}>
                      <div className="flex items-center">
                        <Medal className={`h-5 w-5 mr-2 ${index === 0 ? 'text-gray-200' : 'text-gray-600'}`} />
                        <span className="font-semibold">Runner-up</span>
                      </div>
                      <p className="font-medium">{winner.runnerUp}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hall of Fame Categories */}
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Performance Hall of Fame</h2>
            <p className="text-gray-600">Elite performers across different categories</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* The Legends */}
            <HallOfFameCard
              title="The Legends"
              icon={<Crown className="h-8 w-8" />}
              players={hallOfFameData.legends}
              metric="avgThreeDart"
              subtitle="Elite performers with 45+ average and 5+ tournaments"
              bgColor="bg-gradient-to-r from-purple-600 to-purple-700"
            />

            {/* The Champions */}
            <HallOfFameCard
              title="The Champions"
              icon={<Trophy className="h-8 w-8" />}
              players={hallOfFameData.champions}
              metric="setWinRate"
              subtitle="Dominant winners with 60%+ set win rate"
              bgColor="bg-gradient-to-r from-blue-600 to-blue-700"
            />

            {/* The Marksmen */}
            <HallOfFameCard
              title="The Marksmen"
              icon={<Target className="h-8 w-8" />}
              players={hallOfFameData.marksmen}
              metric="total180s"
              subtitle="180 specialists with 3+ maximum scores"
              bgColor="bg-gradient-to-r from-red-600 to-red-700"
            />

            {/* The Finishers */}
            <HallOfFameCard
              title="The Finishers"
              icon={<Zap className="h-8 w-8" />}
              players={hallOfFameData.finishers}
              metric="highFinish"
              subtitle="Checkout masters with 80+ high finishes"
              bgColor="bg-gradient-to-r from-green-600 to-green-700"
            />

            {/* The Veterans */}
            <HallOfFameCard
              title="The Veterans"
              icon={<Award className="h-8 w-8" />}
              players={hallOfFameData.veterans}
              metric="tournaments"
              subtitle="Tournament stalwarts with 8+ appearances"
              bgColor="bg-gradient-to-r from-indigo-600 to-indigo-700"
            />

            {/* Rising Stars */}
            <HallOfFameCard
              title="Rising Stars"
              icon={<Star className="h-8 w-8" />}
              players={hallOfFameData.rookieStars}
              metric="avgThreeDart"
              subtitle="New talents with 35+ average in ≤3 tournaments"
              bgColor="bg-gradient-to-r from-orange-600 to-orange-700"
            />
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-yellow-100 to-amber-100 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              "Excellence is not a skill, it's an attitude"
            </h3>
            <p className="text-gray-600 italic">
              Honoring the dedication, skill, and sportsmanship of Royal Darts champions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
