'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  RefreshCw, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Plus,
  Filter,
  Globe,
  Building2,
  FileText,
  BarChart3,
  Zap,
  Target,
  Eye,
  Gavel,
  Scale,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react'

interface RegulatoryBody {
  id: string
  name: string
  type: string
  jurisdiction: string
  industry?: string
  website?: string
  rssFeed?: string
  apiEndpoint?: string
  isActive: boolean
  monitoring?: any
  createdAt: string
  updatedAt: string
}

interface MonitoringResult {
  bodyId: string
  bodyName: string
  status: 'operational' | 'degraded' | 'outage'
  lastChecked: string
  updateFrequency: string
  recentUpdates: number
  lastUpdate?: string
}

interface RegulatoryBodyWithStatus extends RegulatoryBody {
  monitoringResult?: MonitoringResult
}

export default function RegulatoryMonitoringPage() {
  const [bodies, setBodies] = useState<RegulatoryBodyWithStatus[]>([])
  const [filteredBodies, setFilteredBodies] = useState<RegulatoryBodyWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [monitoringLoading, setMonitoringLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisContent, setAnalysisContent] = useState('')
  const [analysisType, setAnalysisType] = useState('regulation')
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const jurisdictions = ['all', 'US', 'EU', 'Global', 'California', 'New York', 'UK', 'Canada']
  const types = ['all', 'SEC', 'FINRA', 'GDPR', 'CCPA', 'HIPAA', 'SOX', 'Dodd-Frank']
  const industries = ['all', 'Financial', 'Healthcare', 'Technology', 'General', 'Insurance', 'Banking']

  useEffect(() => {
    fetchRegulatoryBodies()
  }, [])

  useEffect(() => {
    filterBodies()
  }, [bodies, searchTerm, selectedJurisdiction, selectedType, selectedIndustry])

  const fetchRegulatoryBodies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/regulatory-bodies')
      if (response.ok) {
        const data = await response.json()
        setBodies(data)
      }
    } catch (error) {
      console.error('Error fetching regulatory bodies:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBodies = () => {
    let filtered = bodies

    if (searchTerm) {
      filtered = filtered.filter(body =>
        body.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        body.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        body.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedJurisdiction !== 'all') {
      filtered = filtered.filter(body => body.jurisdiction === selectedJurisdiction)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(body => body.type === selectedType)
    }

    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(body => body.industry === selectedIndustry)
    }

    setFilteredBodies(filtered)
  }

  const monitorRegulatoryBody = async (bodyId: string) => {
    setMonitoringLoading(true)
    try {
      // Simulate monitoring - in real implementation, this would check RSS feeds, APIs, etc.
      const monitoringResult = {
        bodyId,
        bodyName: bodies.find(b => b.id === bodyId)?.name || 'Unknown',
        status: Math.random() > 0.8 ? 'outage' : Math.random() > 0.5 ? 'degraded' : 'operational',
        lastChecked: new Date().toISOString(),
        updateFrequency: 'Daily',
        recentUpdates: Math.floor(Math.random() * 10),
        lastUpdate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      // Update body with monitoring result
      setBodies(prev => prev.map(body => 
        body.id === bodyId 
          ? { ...body, monitoringResult }
          : body
      ))
    } catch (error) {
      console.error('Error monitoring regulatory body:', error)
    } finally {
      setMonitoringLoading(false)
    }
  }

  const monitorAllBodies = async () => {
    setMonitoringLoading(true)
    try {
      const results = await Promise.all(
        bodies.map(async (body) => {
          return {
            bodyId: body.id,
            bodyName: body.name,
            status: Math.random() > 0.8 ? 'outage' : Math.random() > 0.5 ? 'degraded' : 'operational',
            lastChecked: new Date().toISOString(),
            updateFrequency: 'Daily',
            recentUpdates: Math.floor(Math.random() * 10),
            lastUpdate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        })
      )

      // Update all bodies with monitoring results
      const resultsMap = new Map(results.map(r => [r.bodyId, r]))
      setBodies(prev => prev.map(body => ({
        ...body,
        monitoringResult: resultsMap.get(body.id)
      })))
    } catch (error) {
      console.error('Error monitoring all regulatory bodies:', error)
    } finally {
      setMonitoringLoading(false)
    }
  }

  const analyzeRegulatoryContent = async () => {
    if (!analysisContent.trim()) return

    try {
      setAnalyzing(true)
      const response = await fetch('/api/regulatory/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: analysisContent,
          type: analysisType,
          jurisdiction: selectedJurisdiction === 'all' ? 'US' : selectedJurisdiction,
          industry: selectedIndustry === 'all' ? 'General' : selectedIndustry
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysisResult(data)
      }
    } catch (error) {
      console.error('Error analyzing regulatory content:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'degraded':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'outage':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge variant="default" className="bg-green-100 text-green-800">Operational</Badge>
      case 'degraded':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Degraded</Badge>
      case 'outage':
        return <Badge variant="destructive">Outage</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const operationalCount = filteredBodies.filter(b => b.monitoringResult?.status === 'operational').length
  const degradedCount = filteredBodies.filter(b => b.monitoringResult?.status === 'degraded').length
  const outageCount = filteredBodies.filter(b => b.monitoringResult?.status === 'outage').length
  const notMonitoredCount = filteredBodies.filter(b => !b.monitoringResult).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Gavel className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">Regulatory Monitoring</h1>
                <p className="text-muted-foreground mt-1">
                  Real-time monitoring of regulatory bodies and compliance requirements
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchRegulatoryBodies} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operational</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{operationalCount}</div>
              <p className="text-xs text-muted-foreground">
                Bodies monitoring normally
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Degraded</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{degradedCount}</div>
              <p className="text-xs text-muted-foreground">
                Performance issues detected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outage</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outageCount}</div>
              <p className="text-xs text-muted-foreground">
                Service interruptions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Not Monitored</CardTitle>
              <Activity className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{notMonitoredCount}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting status check
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Regulatory Bodies */}
          <div className="lg:col-span-2 space-y-6">
            {/* Controls */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search regulatory bodies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Jurisdiction" />
                      </SelectTrigger>
                      <SelectContent>
                        {jurisdictions.map(jurisdiction => (
                          <SelectItem key={jurisdiction} value={jurisdiction}>
                            {jurisdiction === 'all' ? 'All' : jurisdiction}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {types.filter(type => type !== 'all').map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={monitorAllBodies} 
                      disabled={monitoringLoading || bodies.length === 0}
                      className="flex items-center gap-2"
                    >
                      {monitoringLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Activity className="w-4 h-4" />
                      )}
                      Monitor All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regulatory Bodies List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading regulatory bodies...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBodies.map(body => (
                  <Card key={body.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{body.name}</h3>
                            <Badge variant="outline">{body.type}</Badge>
                            {body.monitoringResult && getStatusBadge(body.monitoringResult.status)}
                            {!body.isActive && <Badge variant="secondary">Inactive</Badge>}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{body.jurisdiction}</span>
                            </div>
                            {body.industry && (
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                <span>{body.industry}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Updated {new Date(body.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          {body.monitoringResult && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-muted-foreground" />
                                <span>Updates: {body.monitoringResult.recentUpdates}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>Frequency: {body.monitoringResult.updateFrequency}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>Checked: {new Date(body.monitoringResult.lastChecked).toLocaleTimeString()}</span>
                              </div>
                              {body.monitoringResult.lastUpdate && (
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                  <span>Last: {new Date(body.monitoringResult.lastUpdate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {body.website && (
                              <Button
                                onClick={() => window.open(body.website, '_blank')}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Website
                              </Button>
                            )}
                            {body.rssFeed && (
                              <Button
                                onClick={() => window.open(body.rssFeed, '_blank')}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                RSS Feed
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => monitorRegulatoryBody(body.id)}
                            disabled={monitoringLoading}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            {monitoringLoading ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Activity className="w-4 h-4" />
                            )}
                            Check Status
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredBodies.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No regulatory bodies found</h3>
                      <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Analysis */}
          <div className="space-y-6">
            {/* Regulatory Analysis */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-blue-800">Regulatory Analysis</CardTitle>
                </div>
                <CardDescription className="text-blue-700">
                  Analyze regulatory content for compliance requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Content Type</label>
                    <Select value={analysisType} onValueChange={setAnalysisType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regulation">Regulation</SelectItem>
                        <SelectItem value="policy">Policy</SelectItem>
                        <SelectItem value="guidance">Guidance</SelectItem>
                        <SelectItem value="enforcement">Enforcement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Regulatory Content</label>
                    <Textarea
                      placeholder="Paste regulatory text, policy content, or guidance for analysis..."
                      value={analysisContent}
                      onChange={(e) => setAnalysisContent(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <Button 
                    onClick={analyzeRegulatoryContent}
                    disabled={analyzing || !analysisContent.trim()}
                    className="w-full flex items-center gap-2"
                  >
                    {analyzing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    Analyze Content
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-800">Analysis Results</CardTitle>
                  <CardDescription className="text-green-700">
                    AI-powered regulatory compliance analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Summary
                      </h4>
                      <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Risk Level
                      </h4>
                      <Badge className={
                        analysisResult.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                        analysisResult.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {analysisResult.riskLevel}
                      </Badge>
                    </div>
                    
                    {analysisResult.keyRequirements && analysisResult.keyRequirements.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Key Requirements
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {analysisResult.keyRequirements.slice(0, 3).map((req: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {analysisResult.recommendedActions && analysisResult.recommendedActions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Recommended Actions
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {analysisResult.recommendedActions.slice(0, 3).map((action: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Confidence: {(analysisResult.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}