import { useState, useEffect } from 'react'
import { Brain, TrendingUp, Target, Zap, Award, AlertTriangle } from 'lucide-react'

interface AIInsightsProps {
  playerId?: number
  playerData?: any
}

export default function AIInsights({ playerId, playerData }: AIInsightsProps) {
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateAIInsights()
  }, [playerId, playerData])

  const generateAIInsights = async () => {
    setLoading(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockInsights = [
        {
          type: 'performance',
          icon: TrendingUp,
          title: 'Performance Trend Analysis',
          content: 'Your 3-dart average has improved by 12% over the last 5 matches. The AI model predicts continued upward trajectory.',
          confidence: 94,
          actionable: true,
          priority: 'high'
        },
        {
          type: 'accuracy',
          icon: Target,
          title: 'Accuracy Pattern Recognition',
          content: 'Finishing accuracy drops by 8% in high-pressure situations. Focus on mental preparation techniques.',
          confidence: 87,
          actionable: true,
          priority: 'medium'
        },
        {
          type: 'consistency',
          icon: Award,
          title: 'Consistency Analysis',
          content: 'Your leg-to-leg variance is 15% below elite threshold. Excellent consistency in performance delivery.',
          confidence: 92,
          actionable: false,
          priority: 'low'
        },
        {
          type: 'weakness',
          icon: AlertTriangle,
          title: 'Improvement Opportunity',
          content: 'Double finishing success rate is 23% below your potential. Targeted practice could yield 10+ point average increase.',
          confidence: 89,
          actionable: true,
          priority: 'high'
        }
      ]
      
      setInsights(mockInsights)
      setLoading(false)
    }, 1500)
  }

  if (loading) {
    return (
      <div className="card-elite p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="h-6 w-6 text-purple-400 animate-pulse" />
          <h3 className="text-xl font-bold text-white">AI Performance Analysis</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-elite h-20 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card-elite p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">AI Performance Analysis</h3>
        </div>
        <div className="badge-premium">AI Powered</div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
              insight.priority === 'high' 
                ? 'bg-red-500/10 border-red-500/30' 
                : insight.priority === 'medium'
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                insight.priority === 'high' 
                  ? 'bg-red-500/20' 
                  : insight.priority === 'medium'
                  ? 'bg-amber-500/20'
                  : 'bg-emerald-500/20'
              }`}>
                <insight.icon className={`h-5 w-5 ${
                  insight.priority === 'high' 
                    ? 'text-red-400' 
                    : insight.priority === 'medium'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white text-sm">{insight.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Confidence: {insight.confidence}%</span>
                    {insight.actionable && (
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-slate-300">{insight.content}</p>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className={`text-xs font-medium ${
                    insight.priority === 'high' 
                      ? 'text-red-400' 
                      : insight.priority === 'medium'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}>
                    Priority: {insight.priority.toUpperCase()}
                  </div>
                  
                  {insight.actionable && (
                    <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-white transition-colors">
                      View Action Plan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="h-5 w-5 text-amber-400" />
          <h4 className="font-semibold text-white text-sm">Elite Performance Score</h4>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1 bg-slate-700 rounded-full h-3">
            <div 
              className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
              style={{ width: '78%' }}
            ></div>
          </div>
          <span className="text-2xl font-bold text-amber-400">78/100</span>
        </div>
        
        <p className="text-xs text-slate-400 mt-2">
          Based on comprehensive analysis of 50+ performance metrics
        </p>
      </div>
    </div>
  )
}
