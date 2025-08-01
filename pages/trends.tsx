import TrendAnalysis from '@/components/TrendAnalysis'

export default function TrendsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Performance Trends</h1>
          <p className="mt-2 text-sm text-gray-700">
            Analyze performance trends across tournaments and time periods
          </p>
        </div>
      </div>
      
      <TrendAnalysis />
    </div>
  )
}
