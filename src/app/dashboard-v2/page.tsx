'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Pause,
  Globe,
  Building,
  Search,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  Award,
  Rocket,
  Brain,
  Network,
  AlertCircle,
  ThumbsUp,
  TrendingDown,
  DollarSign,
  Users2,
  FileCheck,
  GanttChart,
  MessageSquare,
  Video,
  BookOpen,
  Link2,
  ExternalLink,
  Home,
  LayoutDashboard,
  AlertOctagon,
  FileSearch,
  Monitor,
  MailOpen,
  UserCheck,
  BarChart,
  Settings2
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
  assignee?: string
  dueDate?: string
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
    avgResolutionTime: number
    teamEfficiency: number
  }
  breakdown: {
    byCategory: Array<{ category: string; count: number }>
    byRiskLevel: Array<{ riskLevel: string; count: number }>
    byStatus: Array<{ status: string; count: number }>
    byAssignee: Array<{ assignee: string; count: number }>
  }
  trends: {
    daily: Array<{ date: string; count: number }>
    weekly: Array<{ week: string; count: number }>
    monthly: Array<{ month: string; count: number }>
  }
}

interface VendorStatus {
  id: string
  name: string
  category: string
  status: string
  performance: string
  reliability: string
  availability: number
  responseTime: number
  lastChecked: string
  criticality: string
}

interface RegulatoryUpdate {
  id: string
  body: string
  title: string
  jurisdiction: string
  industry: string
  impact: string
  publishedAt: string
  status: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  department: string
  activeAlerts: number
  resolvedThisWeek: number
  efficiency: number
  status: string
}

export default function DashboardV2() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([])
  const [vendors, setVendors] = useState<VendorStatus[]>([])
  const [regulatoryUpdates, setRegulatoryUpdates] = useState<RegulatoryUpdate[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchDashboardData()
      }, 30000) // Refresh every 30 seconds for v2
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

      // Fetch alerts
      const alertsResponse = await fetch('/api/alerts?limit=20')
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setAlerts(alertsData.alerts || [])
      }

      // Fetch vendor status
      const vendorsResponse = await fetch('/api/vendors/realtime')
      if (vendorsResponse.ok) {
        const vendorsData = await vendorsResponse.json()
        setVendors(vendorsData.vendors || [])
      }

      // Fetch regulatory updates
      const regulatoryResponse = await fetch('/api/regulatory-bodies')
      if (regulatoryResponse.ok) {
        const regulatoryData = await regulatoryResponse.json()
        setRegulatoryUpdates(regulatoryData.bodies || [])
      }

      setLastRefresh(new Date())
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

  const navigateTo = (path: string) => {
    window.open(path, '_blank')
  }

  const exportData = () => {
    const dataToExport = {
      stats,
      alerts,
      vendors,
      regulatoryUpdates,
      exportedAt: new Date().toISOString(),
      version: '2.0'
    }
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `beacon-dashboard-v2-export-${new Date().toISOString().split('T')[0]}.json`
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
      case 'In Progress': return 'bg-yellow-500 text-black'
      case 'Archived': return 'bg-gray-500 text-white'
      case 'Superseded': return 'bg-purple-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'Good': return 'text-green-600'
      case 'Fair': return 'text-yellow-600'
      case 'Poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const criticalAlerts = alerts.filter(alert => alert.riskLevel === 'Critical')
  const highRiskAlerts = alerts.filter(alert => alert.riskLevel === 'High')
  const recentAlerts = alerts.slice(0, 5)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Beacon Compliance v2.0
                </h1>
                <p className="text-muted-foreground mt-1">
                  Advanced Compliance Intelligence Platform
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-muted-foreground">Loading advanced dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Enhanced Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Beacon Compliance v2.0
                </h1>
                <p className="text-muted-foreground mt-1">
                  Advanced Compliance Intelligence Platform
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
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
                Export v2
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Settings2 className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <div className="bg-white/60 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex flex-wrap gap-2">
            <Button 
              variant={activeTab === 'overview' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setActiveTab('overview')}
              className="gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </Button>
            <Button 
              variant={activeTab === 'alerts' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setActiveTab('alerts')}
              className="gap-2"
            >
              <AlertOctagon className="w-4 h-4" />
              Alerts
            </Button>
            <Button 
              variant={activeTab === 'vendors' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setActiveTab('vendors')}
              className="gap-2"
            >
              <Building className="w-4 h-4" />
              Vendors
            </Button>
            <Button 
              variant={activeTab === 'regulatory' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setActiveTab('regulatory')}
              className="gap-2"
            >
              <Globe className="w-4 h-4" />
              Regulatory
            </Button>
            <Button 
              variant={activeTab === 'analytics' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setActiveTab('analytics')}
              className="gap-2"
            >
              <BarChart className="w-4 h-4" />
              Analytics
            </Button>
            <Button 
              variant={activeTab === 'team' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setActiveTab('team')}
              className="gap-2"
            >
              <Users2 className="w-4 h-4" />
              Team
            </Button>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Last Refresh Info */}
        <div className="mb-6 text-sm text-muted-foreground">
          {lastRefresh && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
              {autoRefresh && (
                <span className="text-green-600">
                  • Auto-refresh enabled (30s intervals)
                </span>
              )}
              <Badge variant="outline" className="ml-2">
                v2.0
              </Badge>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateTo('/ai-alerts')}
            className="flex flex-col gap-1 h-auto py-3"
          >
            <Brain className="w-5 h-5" />
            <span className="text-xs">AI Alerts</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateTo('/vendors')}
            className="flex flex-col gap-1 h-auto py-3"
          >
            <Monitor className="w-5 h-5" />
            <span className="text-xs">Vendors</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateTo('/regulatory-monitoring')}
            className="flex flex-col gap-1 h-auto py-3"
          >
            <FileSearch className="w-5 h-5" />
            <span className="text-xs">Regulatory</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateTo('/reports')}
            className="flex flex-col gap-1 h-auto py-3"
          >
            <FileCheck className="w-5 h-5" />
            <span className="text-xs">Reports</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateTo('/team')}
            className="flex flex-col gap-1 h-auto py-3"
          >
            <UserCheck className="w-5 h-5" />
            <span className="text-xs">Team</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateTo('/communications')}
            className="flex flex-col gap-1 h-auto py-3"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs">Messages</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateTo('/training')}
            className="flex flex-col gap-1 h-auto py-3"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Training</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateTo('/integrations')}
            className="flex flex-col gap-1 h-auto py-3"
          >
            <Link2 className="w-5 h-5" />
            <span className="text-xs">Integrations</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats?.summary.totalAlerts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.summary.activeAlerts || 0} active
                  </p>
                  <Progress value={(stats?.summary.activeAlerts || 0) / (stats?.summary.totalAlerts || 1) * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats?.summary.criticalAlerts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Requires immediate attention
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">+12% this week</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.summary.resolutionRate || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    This week
                  </p>
                  <Progress value={stats?.summary.resolutionRate || 0} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Efficiency</CardTitle>
                  <Users className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats?.summary.teamEfficiency || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    Avg. resolution time: {stats?.summary.avgResolutionTime || 0}h
                  </p>
                  <Progress value={stats?.summary.teamEfficiency || 0} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Alerts */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-600" />
                        <CardTitle>Recent Alerts</CardTitle>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigateTo('/alerts')}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {recentAlerts.map((alert) => (
                          <div key={alert.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
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
                                </div>
                                <h4 className="font-semibold mb-2">{alert.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{new Date(alert.publishedAt).toLocaleDateString()}</span>
                                  {alert.assignee && (
                                    <span>Assigned to: {alert.assignee}</span>
                                  )}
                                  {alert.dueDate && (
                                    <span>Due: {new Date(alert.dueDate).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigateTo(`/alerts/${alert.id}`)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Quick Actions Panel */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common compliance tasks and tools</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button 
                        variant="outline" 
                        className="flex flex-col gap-2 h-auto py-4"
                        onClick={() => navigateTo('/ai-alerts')}
                      >
                        <Brain className="w-6 h-6" />
                        <span className="text-sm">Generate AI Alert</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex flex-col gap-2 h-auto py-4"
                        onClick={() => navigateTo('/risk-assessment')}
                      >
                        <AlertTriangle className="w-6 h-6" />
                        <span className="text-sm">Risk Assessment</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex flex-col gap-2 h-auto py-4"
                        onClick={() => navigateTo('/workflow-generator')}
                      >
                        <GanttChart className="w-6 h-6" />
                        <span className="text-sm">Workflow Generator</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex flex-col gap-2 h-auto py-4"
                        onClick={() => navigateTo('/compliance-check')}
                      >
                        <FileCheck className="w-6 h-6" />
                        <span className="text-sm">Compliance Check</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Vendor Status */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-green-600" />
                        <CardTitle>Vendor Status</CardTitle>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigateTo('/vendors')}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {vendors.slice(0, 5).map((vendor) => (
                          <div key={vendor.id} className="border rounded-lg p-3 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{vendor.name}</h4>
                              <Badge 
                                variant={vendor.status === 'Operational' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {vendor.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Performance:</span>
                                <span className={`ml-1 font-medium ${getPerformanceColor(vendor.performance)}`}>
                                  {vendor.performance}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Availability:</span>
                                <span className="ml-1 font-medium">{vendor.availability}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Regulatory Updates */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-600" />
                        <CardTitle>Regulatory Updates</CardTitle>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigateTo('/regulatory-monitoring')}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {regulatoryUpdates.slice(0, 3).map((update) => (
                          <div key={update.id} className="border rounded-lg p-3 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{update.body}</h4>
                              <Badge variant="outline" className="text-xs">
                                {update.jurisdiction}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{update.title}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="secondary">{update.industry}</Badge>
                              <span className="text-muted-foreground">
                                {new Date(update.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* System Health */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      <CardTitle>System Health</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">API Status</span>
                        <Badge variant="default" className="bg-green-500">Operational</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Database</span>
                        <Badge variant="default" className="bg-green-500">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">AI Services</span>
                        <Badge variant="default" className="bg-green-500">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email Service</span>
                        <Badge variant="default" className="bg-green-500">Delivering</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Monitoring</span>
                        <Badge variant="default" className="bg-blue-500">Active</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Alert Management</CardTitle>
                    <CardDescription>Manage and track all compliance alerts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                      <ScrollArea className="h-96">
                        <div className="space-y-3">
                          {alerts.map((alert) => (
                            <div key={alert.id} className="border rounded-lg p-4">
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
                                  </div>
                                  <h4 className="font-semibold mb-2">{alert.title}</h4>
                                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>{new Date(alert.publishedAt).toLocaleDateString()}</span>
                                    <span>Source: {alert.source}</span>
                                    {alert.assignee && (
                                      <span>Assigned to: {alert.assignee}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Target className="w-3 h-3 mr-1" />
                                    Assign
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Alert Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>By Risk Level</span>
                        </div>
                        {stats?.breakdown.byRiskLevel.map((item) => (
                          <div key={item.riskLevel} className="flex justify-between text-sm">
                            <span>{item.riskLevel}</span>
                            <span className="font-medium">{item.count}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>By Status</span>
                        </div>
                        {stats?.breakdown.byStatus.map((item) => (
                          <div key={item.status} className="flex justify-between text-sm">
                            <span>{item.status}</span>
                            <span className="font-medium">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendor Monitoring</CardTitle>
                    <CardDescription>Real-time vendor status and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {vendors.map((vendor) => (
                          <div key={vendor.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold">{vendor.name}</h4>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={vendor.status === 'Operational' ? 'default' : 'destructive'}
                                >
                                  {vendor.status}
                                </Badge>
                                <Badge variant="outline">{vendor.criticality}</Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Performance:</span>
                                <div className={`font-medium ${getPerformanceColor(vendor.performance)}`}>
                                  {vendor.performance}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Reliability:</span>
                                <div className="font-medium">{vendor.reliability}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Availability:</span>
                                <div className="font-medium">{vendor.availability}%</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Response Time:</span>
                                <div className="font-medium">{vendor.responseTime}ms</div>
                              </div>
                            </div>
                            <div className="mt-3 text-xs text-muted-foreground">
                              Last checked: {new Date(vendor.lastChecked).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendor Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['Cloud Services', 'Financial', 'Healthcare', 'Technology', 'Other'].map((category) => (
                        <div key={category} className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span className="font-medium">
                            {vendors.filter(v => v.category === category).length}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="regulatory" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Regulatory Bodies</CardTitle>
                    <CardDescription>Track regulatory changes and compliance requirements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {regulatoryUpdates.map((update) => (
                          <div key={update.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold">{update.body}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{update.jurisdiction}</Badge>
                                <Badge 
                                  variant={update.status === 'Active' ? 'default' : 'secondary'}
                                >
                                  {update.status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{update.title}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <Badge variant="secondary">{update.industry}</Badge>
                              <span className="text-muted-foreground">Impact: {update.impact}</span>
                              <span className="text-muted-foreground">
                                {new Date(update.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>By Jurisdiction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['US', 'EU', 'UK', 'Global', 'Other'].map((jurisdiction) => (
                        <div key={jurisdiction} className="flex justify-between text-sm">
                          <span>{jurisdiction}</span>
                          <span className="font-medium">
                            {regulatoryUpdates.filter(r => r.jurisdiction === jurisdiction).length}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Trends</CardTitle>
                  <CardDescription>Alert volume over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <BarChart3 className="w-16 h-16" />
                    <span className="ml-4">Chart visualization would be displayed here</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Breakdown by risk level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <PieChart className="w-16 h-16" />
                    <span className="ml-4">Pie chart would be displayed here</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Team member efficiency and workload</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Sarah Johnson', role: 'Compliance Manager', active: 5, resolved: 12, efficiency: 95 },
                    { name: 'Mike Chen', role: 'Risk Analyst', active: 3, resolved: 8, efficiency: 88 },
                    { name: 'Emily Davis', role: 'Compliance Officer', active: 7, resolved: 15, efficiency: 92 },
                    { name: 'Alex Rodriguez', role: 'Vendor Manager', active: 2, resolved: 6, efficiency: 85 },
                    { name: 'Lisa Wang', role: 'Regulatory Specialist', active: 4, resolved: 10, efficiency: 90 },
                    { name: 'David Brown', role: 'Compliance Analyst', active: 6, resolved: 9, efficiency: 87 }
                  ].map((member, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{member.name}</h4>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active Alerts:</span>
                          <span className="font-medium">{member.active}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Resolved This Week:</span>
                          <span className="font-medium">{member.resolved}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Efficiency:</span>
                          <span className="font-medium">{member.efficiency}%</span>
                        </div>
                        <Progress value={member.efficiency} className="mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}