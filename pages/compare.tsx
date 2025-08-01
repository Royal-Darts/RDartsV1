import PlayerComparison from '@/components/PlayerComparison'

export default function ComparePage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Player Comparison</h1>
          <p className="mt-2 text-sm text-gray-700">
            Compare performance metrics between different players
          </p>
        </div>
      </div>
      
      <PlayerComparison />
    </div>
  )
}
