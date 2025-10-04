'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Brain, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  RefreshCw,
  Plus,
  Filter,
  Search,
  Zap,
  Target,
  Eye,
  FileText,
  BarChart3
} from 'lucide-react'

interface AIAlert {
  id: string
  title: string
  description: string
  source: string
  category: string
  riskLevel: string
  severity: string
  publishedAt: string
  tags: string[]
  metadata: {
    aiGenerated: boolean
    originalPrompt: string
    confidence: number
  }
  analysis?: {
    keyRequirements: string[]
    recommendations: string[]
    impactAnalysis: string
  }
  _count: {
    assignments: number
    responses: number
  }
}

export default function RealTimeAlertsPage() {
  const [alerts, setAlerts] = useState<AIAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = ['all', 'Regulatory', 'Vendor Risk', 'Policy', 'Enforcement']
  const riskLevels = ['all', 'Critical', 'High', 'Medium', 'Low']

  useEffect(() => {
    fetchAIAlerts()
  }, [])

  const fetchAIAlerts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/alerts/ai-generate')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts)
      }
    } catch (error) {
      console.error('Error fetching AI alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAIAlert = async () => {
    if (!prompt.trim()) return

    try {
      setGenerating(true)
      const response = await fetch('/api/alerts/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          category: selectedCategory === 'all' ? 'Regulatory' : selectedCategory,
          autoAnalyze: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Add the new alert to the list
        setAlerts(prev => [data.alert, ...prev])
        setPrompt('')
      }
    } catch (error) {
      console.error('Error generating AI alert:', error)
    } finally {
      setGenerating(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical': return 'bg-red-500 text-white'
      case 'High': return 'bg-orange-500 text-white'
      case 'Medium': return 'bg-yellow-500 text-black'
      case 'Low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <AlertTriangle className="w-4 h-4" />
      case 'Warning': return <TrendingUp className="w-4 h-4" />
      case 'Info': return <FileText className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = searchTerm === '' || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || alert.category === selectedCategory
    const matchesRiskLevel = selectedRiskLevel === 'all' || alert.riskLevel === selectedRiskLevel

    return matchesSearch && matchesCategory && matchesRiskLevel
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">AI Compliance Alerts</h1>
                <p className="text-muted-foreground mt-1">
                  Real-time AI-powered compliance intelligence generation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchAIAlerts} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* AI Alert Generator */}
        <Card className="mb-8 border-purple-200">
          <CardHeader className="bg-purple-50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-purple-800">Generate AI Compliance Alert</CardTitle>
            </div>
            <CardDescription className="text-purple-700">
              Use AI to analyze compliance scenarios and generate structured alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Compliance Scenario or Topic</label>
                <Textarea
                  placeholder="Describe a compliance scenario, regulatory change, or risk situation..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={generateAIAlert}
                    disabled={generating || !prompt.trim()}
                    className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                  >
                    {generating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    Generate Alert
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search AI alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {riskLevels.map(level => (
                      <SelectItem key={level} value={level}>
                        {level === 'all' ? 'All Levels' : level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Alerts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading AI alerts...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map(alert => (
              <Card key={alert.id} className="hover:shadow-lg transition-shadow border-purple-100">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getRiskColor(alert.riskLevel)}>
                          {getSeverityIcon(alert.severity)}
                          {alert.riskLevel}
                        </Badge>
                        <Badge variant="outline">{alert.category}</Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          <Brain className="w-3 h-3 mr-1" />
                          AI Generated
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(alert.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">{alert.title}</h3>
                      <p className="text-muted-foreground mb-4">{alert.description}</p>
                      
                      {alert.analysis && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Key Requirements
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {alert.analysis.keyRequirements.slice(0, 3).map((req, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-blue-500 mt-1">•</span>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="bg-green-50 p-3 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Recommendations
                            </h4>
                            <ul className="text-sm text-green-700 space-y-1">
                              {alert.analysis.recommendations.slice(0, 3).map((rec, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-green-500 mt-1">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {alert.tags.slice(0, 5).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Source: {alert.source}</span>
                        <span>Confidence: {(alert.metadata.confidence * 100).toFixed(0)}%</span>
                        <span>Responses: {alert._count.responses}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Analyze
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredAlerts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No AI alerts found</h3>
                  <p className="text-muted-foreground">Generate your first AI compliance alert using the form above</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}