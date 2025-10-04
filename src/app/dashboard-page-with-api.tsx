'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  Filter,
  Search,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Bell,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react'

interface AlertStats {
  summary: {
    totalAlerts: number
    activeAlerts: number
    criticalAlerts: number
    highRiskAlerts: number
    recentAlerts: number
    requiringAttention: number
    resolutionRate: number
  }
  breakdown: {
    byCategory: Array<{ category: string; count: number }>
    byRiskLevel: Array<{ riskLevel: string; count: number }>
    byStatus: Array<{ status: string; count: number }>
  }
  trends: Array<{ date: string; count: number }>
  topSources: Array<{ source: string; count: number }>
}

interface ComplianceAlert {
  id: string
  title: string
  description: string
  source: string
  category: string
  subcategory?: string
  riskLevel: string
  severity: string
  status: string
  priority: number
  publishedAt: string
  expiresAt?: string
  tags: string[]
  metadata?: any
  analysis?: {
    summary: string
    keyRequirements: string[]
    deadlines: string[]
    recommendations: string[]
  }
  assignments?: Array<{
    user: { id: string; name: string; email: string }
    status: string
  }>
  _count?: {
    assignments: number
    responses: number
  }
}

export default function Dashboard() {
  const [stats, setStats] = useState<AlertStats | null>(null)
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats
      const statsResponse = await fetch('/api/alerts/stats')
      const statsData = await statsResponse.json()
      setStats(statsData)

      // Fetch alerts
      const alertsResponse = await fetch('/api/alerts?limit=20')
      const alertsData = await alertsResponse.json()
      setAlerts(alertsData.alerts)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-500 text-white'
      case 'Resolved': return 'bg-green-500 text-white'
      case 'Archived': return 'bg-gray-500 text-white'
      case 'Superseded': return 'bg-purple-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesCategory = selectedCategory === 'all' || alert.category === selectedCategory
    const matchesRiskLevel = selectedRiskLevel === 'all' || alert.riskLevel === selectedRiskLevel
    const matchesSearch = searchTerm === '' || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.source.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesRiskLevel && matchesSearch
  })

  const criticalAlerts = filteredAlerts.filter(alert => alert.riskLevel === 'Critical')
  const highRiskAlerts = filteredAlerts.filter(alert => alert.riskLevel === 'High')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <span className="ml-3">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Real-time compliance intelligence and risk monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchDashboardData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.totalAlerts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.summary.activeAlerts} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.summary.criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.summary.resolutionRate}%</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requiring Attention</CardTitle>
              <Bell className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.summary.requiringAttention}</div>
              <p className="text-xs text-muted-foreground">
                High & Critical risk
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Alerts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Compliance Alerts</CardTitle>
                  <CardDescription>
                    Real-time monitoring of regulatory and vendor risks
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      placeholder="Search alerts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="all">All Categories</option>
                  {stats?.breakdown.byCategory.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category} ({cat.count})
                    </option>
                  ))}
                </select>
                <select
                  value={selectedRiskLevel}
                  onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Critical Alerts Section */}
              {criticalAlerts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    Critical Alerts ({criticalAlerts.length})
                  </h3>
                  <div className="space-y-3">
                    {criticalAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getRiskColor(alert.riskLevel)}>
                                {alert.riskLevel}
                              </Badge>
                              <Badge variant="outline">{alert.category}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(alert.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="font-semibold text-red-900">{alert.title}</h4>
                            <p className="text-sm text-red-700 mt-1">{alert.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                Source: {alert.source}
                              </span>
                              {alert._count?.assignments && alert._count.assignments > 0 && (
                                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                  {alert._count.assignments} assigned
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* High Risk Alerts Section */}
              {highRiskAlerts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    High Risk Alerts ({highRiskAlerts.length})
                  </h3>
                  <div className="space-y-3">
                    {highRiskAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getRiskColor(alert.riskLevel)}>
                                {alert.riskLevel}
                              </Badge>
                              <Badge variant="outline">{alert.category}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(alert.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="font-semibold text-orange-900">{alert.title}</h4>
                            <p className="text-sm text-orange-700 mt-1">{alert.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                Source: {alert.source}
                              </span>
                              {alert._count?.assignments && alert._count.assignments > 0 && (
                                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                  {alert._count.assignments} assigned
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Alerts */}
              <div>
                <h3 className="text-lg font-semibold mb-3">All Alerts ({filteredAlerts.length})</h3>
                <div className="space-y-3">
                  {filteredAlerts.slice(0, 10).map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getRiskColor(alert.riskLevel)}>
                              {alert.riskLevel}
                            </Badge>
                            <Badge variant="outline">{alert.category}</Badge>
                            <Badge className={getStatusColor(alert.status)}>
                              {alert.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(alert.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-semibold">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                              Source: {alert.source}
                            </span>
                            {alert._count?.responses && alert._count.responses > 0 && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                {alert._count.responses} responses
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Analytics */}
        <div className="space-y-6">
          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.breakdown.byRiskLevel && (
                <div className="space-y-3">
                  {stats.breakdown.byRiskLevel.map((item) => (
                    <div key={item.riskLevel} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getRiskColor(item.riskLevel).split(' ')[0]}`} />
                        <span className="text-sm font-medium">{item.riskLevel}</span>
                      </div>
                      <span className="text-sm font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.breakdown.byCategory && (
                <div className="space-y-3">
                  {stats.breakdown.byCategory.slice(0, 5).map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.topSources && (
                <div className="space-y-3">
                  {stats.topSources.slice(0, 5).map((item, index) => (
                    <div key={item.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <span className="text-sm">{item.source}</span>
                      </div>
                      <span className="text-sm font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                Create New Alert
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Assign Alerts
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Run Analysis
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}