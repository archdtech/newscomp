'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Bell,
  Settings,
  Download,
  RefreshCw,
  Shield,
  FileText,
  Database,
  Zap,
  Target,
  Eye,
  Filter,
  Play,
  Pause
} from 'lucide-react'

interface ComplianceAlert {
  id: string
  title: string
  description: string
  source: string
  category: string
  riskLevel: string
  severity: string
  status: string
  priority: number
  publishedAt: string
  tags: string[]
}

interface DashboardStats {
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
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchDashboardData()
      }, 60000) // Refresh every 60 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats
      const statsResponse = await fetch('/api/alerts/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch critical and high risk alerts
      const alertsResponse = await fetch('/api/alerts?riskLevel=Critical&limit=10')
      if (alertsResponse.ok) {
        const criticalData = await alertsResponse.json()
        
        const highRiskResponse = await fetch('/api/alerts?riskLevel=High&limit=10')
        const highRiskData = await highRiskResponse.json()
        
        setAlerts([...criticalData.alerts, ...highRiskData.alerts])
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  const viewAlertDetails = (alertId: string) => {
    // Navigate to alert details or open modal
    window.open(`/alerts/${alertId}`, '_blank')
  }

  const assignAlert = (alertId: string) => {
    // Open assignment dialog or navigate to assignment page
    console.log('Assign alert:', alertId)
    // TODO: Implement assignment functionality
  }

  const generateReport = () => {
    // Generate and download compliance report
    console.log('Generating report...')
    // TODO: Implement report generation
  }

  const viewAnalytics = () => {
    // Navigate to analytics page
    window.open('/analytics', '_blank')
  }

  const viewSystemStatus = () => {
    // Navigate to system status page
    window.open('/system-status', '_blank')
  }

  const manageTeam = () => {
    // Navigate to team management page
    window.open('/team', '_blank')
  }

  const exportData = () => {
    // Export dashboard data
    const dataToExport = {
      stats,
      alerts,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `beacon-dashboard-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical': return <XCircle className="w-4 h-4" />
      case 'High': return <AlertTriangle className="w-4 h-4" />
      case 'Medium': return <Clock className="w-4 h-4" />
      case 'Low': return <CheckCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
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

  const criticalAlerts = alerts.filter(alert => alert.riskLevel === 'Critical')
  const highRiskAlerts = alerts.filter(alert => alert.riskLevel === 'High')

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">Compliance Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Real-time compliance intelligence and risk monitoring
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">Compliance Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Real-time compliance intelligence and risk monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-green-100 text-green-700 border-green-300" : ""}
              >
                {autoRefresh ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Auto Refresh On
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Auto Refresh
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                disabled={refreshing}
              >
                {refreshing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportData}
              >
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
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.summary.totalAlerts || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.summary.activeAlerts || 0} active
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.summary.criticalAlerts || 0}</div>
              <p className="text-xs text-muted-foreground">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.summary.resolutionRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requiring Attention</CardTitle>
              <Bell className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.summary.requiringAttention || 0}</div>
              <p className="text-xs text-muted-foreground">
                High & Critical risk
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Last Refresh Info */}
        <div className="mb-6 text-sm text-muted-foreground">
          {lastRefresh && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
              {autoRefresh && (
                <span className="text-green-600">
                  • Auto-refresh enabled (60s intervals)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Alerts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Critical Alerts Section */}
            {criticalAlerts.length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <CardTitle className="text-red-800">Critical Alerts ({criticalAlerts.length})</CardTitle>
                    </div>
                    <Badge variant="destructive">IMMEDIATE ACTION</Badge>
                  </div>
                  <CardDescription className="text-red-700">
                    Alerts requiring immediate attention and action
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {criticalAlerts.map((alert) => (
                      <div key={alert.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getRiskColor(alert.riskLevel)}>
                                {getRiskIcon(alert.riskLevel)}
                                {alert.riskLevel}
                              </Badge>
                              <Badge variant="outline">{alert.category}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(alert.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="font-semibold text-red-900 mb-2">{alert.title}</h4>
                            <p className="text-sm text-red-700 mb-3">{alert.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                Source: {alert.source}
                              </span>
                              {alert.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => viewAlertDetails(alert.id)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => assignAlert(alert.id)}
                            >
                              <Target className="w-3 h-3 mr-1" />
                              Assign
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* High Risk Alerts Section */}
            {highRiskAlerts.length > 0 && (
              <Card className="border-orange-200">
                <CardHeader className="bg-orange-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <CardTitle className="text-orange-800">High Risk Alerts ({highRiskAlerts.length})</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-orange-700 border-orange-300">
                      HIGH PRIORITY
                    </Badge>
                  </div>
                  <CardDescription className="text-orange-700">
                    Alerts requiring prompt attention and monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {highRiskAlerts.map((alert) => (
                      <div key={alert.id} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getRiskColor(alert.riskLevel)}>
                                {getRiskIcon(alert.riskLevel)}
                                {alert.riskLevel}
                              </Badge>
                              <Badge variant="outline">{alert.category}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(alert.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="font-semibold text-orange-900 mb-2">{alert.title}</h4>
                            <p className="text-sm text-orange-700 mb-3">{alert.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                Source: {alert.source}
                              </span>
                              {alert.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewAlertDetails(alert.id)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => assignAlert(alert.id)}
                            >
                              <Target className="w-3 h-3 mr-1" />
                              Assign
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Alerts */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>All Alerts ({alerts.length})</CardTitle>
                    <CardDescription>
                      Complete overview of all compliance alerts
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getRiskColor(alert.riskLevel)}>
                              {getRiskIcon(alert.riskLevel)}
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
                          <h4 className="font-semibold mb-2">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                              Source: {alert.source}
                            </span>
                            {alert.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewAlertDetails(alert.id)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Alert Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Alert Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.breakdown.byCategory.map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{category.count}</span>
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full"
                            style={{ 
                              width: `${(category.count / (stats?.summary.totalAlerts || 1)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>

            {/* Risk Levels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Risk Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.breakdown.byRiskLevel.map((risk) => (
                    <div key={risk.riskLevel} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          risk.riskLevel === 'Critical' ? 'bg-red-500' :
                          risk.riskLevel === 'High' ? 'bg-orange-500' :
                          risk.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <span className="text-sm font-medium">{risk.riskLevel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{risk.count}</span>
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full"
                            style={{ 
                              width: `${(risk.count / (stats?.summary.totalAlerts || 1)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={generateReport}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={viewAnalytics}
                  >
                    <PieChart className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={viewSystemStatus}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    System Status
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={manageTeam}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Team Management
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={exportData}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Data Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>System health check completed</span>
                    <span className="text-muted-foreground text-xs">2m ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>3 new alerts detected</span>
                    <span className="text-muted-foreground text-xs">15m ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>AWS monitoring updated</span>
                    <span className="text-muted-foreground text-xs">1h ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Daily digest sent</span>
                    <span className="text-muted-foreground text-xs">2h ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}