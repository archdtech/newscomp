'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  RefreshCw, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Server, 
  ExternalLink,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Settings,
  Play,
  Pause
} from 'lucide-react'

interface Vendor {
  id: string
  name: string
  category: string
  statusPage?: string
  criticality: 'Low' | 'Medium' | 'High' | 'Critical'
  isActive: boolean
  monitoring?: any
  contacts?: any
}

interface MonitoringResult {
  vendorId: string
  vendorName: string
  status: 'operational' | 'degraded' | 'outage'
  responseTime: number
  lastChecked: string
  uptime: number
  incidents: Array<{
    id: string
    title: string
    severity: string
    startTime: string
    endTime?: string
    description: string
  }>
}

interface VendorWithStatus extends Vendor {
  monitoringResult?: MonitoringResult
}

export default function VendorMonitoringPage() {
  const [vendors, setVendors] = useState<VendorWithStatus[]>([])
  const [filteredVendors, setFilteredVendors] = useState<VendorWithStatus[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCriticality, setSelectedCriticality] = useState('all')
  const [loading, setLoading] = useState(true)
  const [monitoringLoading, setMonitoringLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const categories = ['Cloud Infrastructure', 'Payment Processing', 'Communication', 'Security', 'Data Storage']
  const criticalities = ['Low', 'Medium', 'High', 'Critical']

  useEffect(() => {
    fetchVendors()
  }, [])

  useEffect(() => {
    filterVendors()
  }, [vendors, searchTerm, selectedCategory, selectedCriticality])

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        monitorAllVendors()
        setLastRefresh(new Date())
      }, 30000) // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, vendors])

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/vendors')
      if (response.ok) {
        const data = await response.json()
        setVendors(data)
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterVendors = () => {
    let filtered = vendors

    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(vendor => vendor.category === selectedCategory)
    }

    if (selectedCriticality !== 'all') {
      filtered = filtered.filter(vendor => vendor.criticality === selectedCriticality)
    }

    setFilteredVendors(filtered)
  }

  const monitorVendor = async (vendorId: string) => {
    setMonitoringLoading(true)
    try {
      const response = await fetch(`/api/vendors/realtime?vendorId=${vendorId}`)
      if (response.ok) {
        const monitoringResult = await response.json()
        
        // Update vendor with monitoring result
        setVendors(prev => prev.map(vendor => 
          vendor.id === vendorId 
            ? { ...vendor, monitoringResult }
            : vendor
        ))
      }
    } catch (error) {
      console.error('Error monitoring vendor:', error)
    } finally {
      setMonitoringLoading(false)
    }
  }

  const monitorAllVendors = async () => {
    setMonitoringLoading(true)
    try {
      const vendorIds = vendors.map(v => v.id)
      const response = await fetch('/api/vendors/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vendorIds, enableRealTime: true })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Update all vendors with monitoring results
        const resultsMap = new Map(data.results.map((r: MonitoringResult) => [r.vendorId, r]))
        setVendors(prev => prev.map(vendor => ({
          ...vendor,
          monitoringResult: resultsMap.get(vendor.id)
        })))
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Error monitoring all vendors:', error)
    } finally {
      setMonitoringLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'degraded':
        return <TrendingDown className="w-4 h-4 text-yellow-500" />
      case 'outage':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
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

  const getCriticalityBadge = (criticality: string) => {
    switch (criticality) {
      case 'Critical':
        return <Badge variant="destructive">Critical</Badge>
      case 'High':
        return <Badge variant="destructive" className="bg-orange-500">High</Badge>
      case 'Medium':
        return <Badge variant="secondary">Medium</Badge>
      case 'Low':
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const operationalCount = filteredVendors.filter(v => v.monitoringResult?.status === 'operational').length
  const degradedCount = filteredVendors.filter(v => v.monitoringResult?.status === 'degraded').length
  const outageCount = filteredVendors.filter(v => v.monitoringResult?.status === 'outage').length
  const notMonitoredCount = filteredVendors.filter(v => !v.monitoringResult).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">Vendor Monitoring</h1>
              <p className="text-muted-foreground mt-1">Real-time monitoring of critical vendor services</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
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
              <p className="text-xs text-muted-foreground">Vendors operating normally</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Degraded</CardTitle>
              <TrendingDown className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{degradedCount}</div>
              <p className="text-xs text-muted-foreground">Performance issues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outage</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outageCount}</div>
              <p className="text-xs text-muted-foreground">Service interruptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Not Monitored</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{notMonitoredCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting status check</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search vendors..."
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
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCriticality} onValueChange={setSelectedCriticality}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Criticality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {criticalities.map(criticality => (
                      <SelectItem key={criticality} value={criticality}>{criticality}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  variant={autoRefresh ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh'}
                </Button>
                <Button 
                  onClick={monitorAllVendors} 
                  disabled={monitoringLoading || vendors.length === 0}
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
            {lastRefresh && (
              <div className="mt-4 text-sm text-muted-foreground">
                Last refresh: {lastRefresh.toLocaleTimeString()}
                {autoRefresh && (
                  <span className="ml-2 text-green-600">
                    • Auto-refresh enabled (30s intervals)
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vendor List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading vendors...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVendors.map(vendor => (
              <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{vendor.name}</h3>
                        {getCriticalityBadge(vendor.criticality)}
                        <Badge variant="outline">{vendor.category}</Badge>
                        {vendor.monitoringResult && getStatusBadge(vendor.monitoringResult.status)}
                      </div>
                      <p className="text-muted-foreground mb-3">{vendor.description || 'No description available'}</p>
                      
                      {vendor.monitoringResult && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            <span>Response: {vendor.monitoringResult.responseTime}ms</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            <span>Uptime: {vendor.monitoringResult.uptime.toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Checked: {new Date(vendor.monitoringResult.lastChecked).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                            <span>Incidents: {vendor.monitoringResult.incidents.length}</span>
                          </div>
                        </div>
                      )}
                      {vendor.monitoringResult?.metrics && (
                        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Performance:</span>
                            <Badge variant={vendor.monitoringResult.metrics.performance === 'good' ? 'default' : vendor.monitoringResult.metrics.performance === 'fair' ? 'secondary' : 'destructive'}>
                              {vendor.monitoringResult.metrics.performance}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Reliability:</span>
                            <Badge variant={vendor.monitoringResult.metrics.reliability === 'high' ? 'default' : vendor.monitoringResult.metrics.reliability === 'medium' ? 'secondary' : 'destructive'}>
                              {vendor.monitoringResult.metrics.reliability}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Criticality:</span>
                            {getCriticalityBadge(vendor.criticality)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => monitorVendor(vendor.id)}
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
                      {vendor.statusPage && (
                        <Button
                          onClick={() => window.open(vendor.statusPage, '_blank')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Status Page
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredVendors.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}