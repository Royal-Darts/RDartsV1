import { Crown, Trophy, Medal, Star } from 'lucide-react'

// RDPL Winners & Runners Up Data
const rdplWinners = [
  { year: 2025, winner: 'RSV Rising Stars', runnerUp: 'Rama Darts' },
  { year: 2024, winner: 'Balaji Darts', runnerUp: 'Purti Forever' },
  { year: 2023, winner: 'Royals Super Knights', runnerUp: 'Jai Ho' },
  { year: 2022, winner: 'Biscotti Barrels', runnerUp: 'Tons of Bull' },
  { year: 2021, winner: 'UGW', runnerUp: 'BLC High Rollers' },
  { year: 2020, winner: 'Merino', runnerUp: 'BLC High Rollers' },
  { year: 2019, winner: 'Friends Forever', runnerUp: 'Royals Super Knights' }
]

export default function HallOfFame() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-lg">
            <Crown className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          👑 Royal Darts Hall of Fame 👑
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Celebrating the Champions of the Royal Darts Premier League
        </p>
      </div>

      {/* RDPL Champions Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
            Royal Darts Premier League Champions
          </h2>
          <p className="text-gray-600 text-lg">
            Historic winners and runners-up from 2019-2025
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rdplWinners.map((winner, index) => (
            <div key={winner.year} className={`rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white ring-4 ring-yellow-300' : 'bg-white border-2 border-yellow-200 hover:border-yellow-400'
            }`}>
              <div className={`p-6 ${index === 0 ? 'text-white' : 'text-gray-900'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-bold">{winner.year}</h3>
                  <div className="flex items-center space-x-2">
                    {index === 0 && <Crown className="h-6 w-6" />}
                    {winner.year === 2025 && (
                      <div className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
                        LATEST
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${index === 0 ? 'bg-white bg-opacity-20' : 'bg-gradient-to-r from-yellow-50 to-amber-50'}`}>
                    <div className="flex items-center mb-2">
                      <Trophy className={`h-6 w-6 mr-3 ${index === 0 ? 'text-yellow-200' : 'text-yellow-600'}`} />
                      <span className="font-semibold text-lg">Champion</span>
                    </div>
                    <p className="font-bold text-xl">{winner.winner}</p>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${index === 0 ? 'bg-white bg-opacity-20' : 'bg-gradient-to-r from-gray-50 to-slate-50'}`}>
                    <div className="flex items-center mb-2">
                      <Medal className={`h-6 w-6 mr-3 ${index === 0 ? 'text-gray-200' : 'text-gray-600'}`} />
                      <span className="font-semibold text-lg">Runner-up</span>
                    </div>
                    <p className="font-bold text-xl">{winner.runnerUp}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Championship Statistics */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Championship Records</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white text-center">
            <div className="text-3xl font-bold mb-2">7</div>
            <div className="text-blue-100">Years of Excellence</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white text-center">
            <div className="text-3xl font-bold mb-2">14</div>
            <div className="text-green-100">Teams Participated</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white text-center">
            <div className="text-3xl font-bold mb-2">2</div>
            <div className="text-purple-100">Multiple Winners</div>
            <div className="text-xs text-purple-200 mt-1">RSV & BLC High Rollers</div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-xl text-white text-center">
            <div className="text-3xl font-bold mb-2">2025</div>
            <div className="text-amber-100">Latest Champions</div>
            <div className="text-xs text-amber-200 mt-1">RSV Rising Stars</div>
          </div>
        </div>
      </div>

      {/* Championship Timeline */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Championship Timeline</h2>
        </div>
        
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-yellow-400 to-amber-500 rounded-full"></div>
          
          <div className="space-y-8">
            {rdplWinners.map((winner, index) => (
              <div key={winner.year} className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-yellow-400">
                    <div className="font-bold text-lg text-gray-900">{winner.year}</div>
                    <div className="text-blue-600 font-semibold">{winner.winner}</div>
                    <div className="text-gray-600 text-sm">vs {winner.runnerUp}</div>
                  </div>
                </div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 p-8 rounded-xl border border-yellow-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Star className="h-6 w-6 text-yellow-600 mr-2" />
            "Champions are made in the crucible of competition"
            <Star className="h-6 w-6 text-yellow-600 ml-2" />
          </h3>
          <p className="text-gray-700 italic text-lg">
            Honoring 7 years of excellence in the Royal Darts Premier League
          </p>
          <div className="mt-4 text-sm text-gray-600">
            <strong>2019-2025:</strong> Seven years of thrilling competition and outstanding sportsmanship
          </div>
        </div>
      </div>
    </div>
  )
}
