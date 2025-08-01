import { Award, Crown, Trophy, Medal } from 'lucide-react'

const champions = [
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
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Crown className="h-12 w-12 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Hall of Fame</h1>
        <h2 className="text-xl font-semibold text-primary-600 mb-8">
          Royal Darts Premier League Champions
        </h2>
      </div>

      {/* Champions Timeline */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {champions.map((champion, index) => (
            <div 
              key={champion.year}
              className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-primary-500"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {index === 0 ? (
                        <Crown className="h-10 w-10 text-yellow-500" />
                      ) : index === 1 ? (
                        <Trophy className="h-10 w-10 text-yellow-600" />
                      ) : (
                        <Award className="h-10 w-10 text-primary-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {champion.year}
                        </h3>
                        {index === 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Current Champions
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <Crown className="h-5 w-5 text-yellow-500" />
                          <span className="text-lg font-semibold text-gray-900">
                            Champions: {champion.winner}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Medal className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-600">
                            Runners-up: {champion.runnerUp}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-600">
                      {champion.year}
                    </div>
                    <div className="text-sm text-gray-500">
                      Season
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-12 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Championship Statistics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Most Titles */}
            <div className="text-center bg-white rounded-lg p-6 shadow">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-2">Most Titles</h4>
              <p className="text-sm text-gray-600">
                Each team has won once (7 different champions)
              </p>
            </div>

            {/* Most Finals */}
            <div className="text-center bg-white rounded-lg p-6 shadow">
              <Medal className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-2">Most Finals</h4>
              <div className="text-sm text-gray-600">
                <p><strong>BLC High Rollers:</strong> 2 (2021, 2020)</p>
                <p><strong>Royals Super Knights:</strong> 2 (2023, 2019)</p>
              </div>
            </div>

            {/* Tournament Legacy */}
            <div className="text-center bg-white rounded-lg p-6 shadow">
              <Crown className="h-8 w-8 text-primary-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-2">Tournament Legacy</h4>
              <p className="text-sm text-gray-600">
                <strong>7 seasons</strong> of Royal Darts Premier League excellence
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
