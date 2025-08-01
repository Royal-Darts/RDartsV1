import PlayerComparison from '@/components/PlayerComparison'
import { BarChart3, Users, TrendingUp } from 'lucide-react'

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Player Performance Comparison
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Compare up to 4 players side-by-side across all key performance metrics and visualize their strengths
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Users className="h-12 w-12 text-blue-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Multi-Player Analysis</h3>
            <p className="text-gray-600 text-sm">Compare 2-4 players simultaneously</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Visual Charts</h3>
            <p className="text-gray-600 text-sm">Radar and bar charts for insights</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <BarChart3 className="h-12 w-12 text-purple-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Detailed Stats</h3>
            <p className="text-gray-600 text-sm">Comprehensive metric breakdown</p>
          </div>
        </div>

        {/* Main Comparison Component */}
        <PlayerComparison />
      </div>
    </div>
  )
}
