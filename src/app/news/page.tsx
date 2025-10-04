'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Newspaper, 
  Search, 
  Filter, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  Calendar,
  Tag,
  Globe,
  BarChart3,
  RefreshCw,
  Download,
  Settings,
  Shield,
  Zap,
  Database,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react'

interface NewsArticle {
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
  url: string
  scrapedDate?: string
  sentimentScore?: number
  relevanceScore?: number
  entities: string[]
  summary: string
  fullContent?: string
}

interface NewsStats {
  total: number
  recent: number
  highRisk: number
  byCategory: Array<{ category: string; count: number }>
  byRiskLevel: Array<{ riskLevel: string; count: number }>
  bySource: Array<{ source: string; count: number }>
  topTags: Array<{ tag: string; count: number }>
  sentimentDistribution: {
    positive: number
    neutral: number
    negative: number
  }
  scrapingActivity: Array<{
    timestamp: string
    notes: string
    status: string
  }>
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [stats, setStats] = useState<NewsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all')
  const [selectedVendor, setSelectedVendor] = useState('all')
  const [timeRange, setTimeRange] = useState('24')

  useEffect(() => {
    fetchNewsData()
    fetchNewsStats()
  }, [])

  const fetchNewsData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '100',
        hours: timeRange
      })

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      if (selectedRiskLevel !== 'all') {
        params.append('riskLevel', selectedRiskLevel)
      }

      if (selectedVendor !== 'all') {
        params.append('vendor', selectedVendor)
      }

      const response = await fetch(`/api/news?${params}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      }
    } catch (error) {
      console.error('Error fetching news data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNewsStats = async () => {
    try {
      const response = await fetch('/api/news/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching news stats:', error)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchNewsData()
    await fetchNewsStats()
    setRefreshing(false)
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

  const getSentimentIcon = (score?: number) => {
    if (!score) return <Minus className="w-4 h-4 text-gray-500" />
    if (score > 0.1) return <ThumbsUp className="w-4 h-4 text-green-500" />
    if (score < -0.1) return <ThumbsDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  const getSentimentColor = (score?: number) => {
    if (!score) return 'text-gray-500'
    if (score > 0.1) return 'text-green-600'
    if (score < -0.1) return 'text-red-600'
    return 'text-gray-500'
  }

  const filteredArticles = articles.filter(article => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        article.title.toLowerCase().includes(searchLower) ||
        article.description.toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    return true
  })

  const categories = stats?.byCategory.map(item => item.category) || []
  const riskLevels = ['Critical', 'High', 'Medium', 'Low']
  const vendors = ['AWS', 'Azure', 'Google', 'Microsoft', 'Oracle', 'Salesforce']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Newspaper className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Compliance News Feed
                </h1>
                <p className="text-muted-foreground mt-1">
                  Real-time news scraping and analysis for compliance intelligence
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
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
                onClick={() => window.open('/api/news', '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                <Newspaper className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.recent} in last 24h
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High-Risk Articles</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
                <Globe className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.bySource.length}</div>
                <p className="text-xs text-muted-foreground">
                  News sources monitored
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Tags</CardTitle>
                <Tag className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.topTags.length}</div>
                <p className="text-xs text-muted-foreground">
                  Unique tags identified
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  {riskLevels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map(vendor => (
                    <SelectItem key={vendor} value={vendor}>
                      {vendor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last Hour</SelectItem>
                  <SelectItem value="24">Last 24 Hours</SelectItem>
                  <SelectItem value="168">Last Week</SelectItem>
                  <SelectItem value="720">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-blue-600" />
                    <CardTitle>News Articles</CardTitle>
                    <Badge variant="outline">{filteredArticles.length} articles</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={refreshData}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading news articles...</p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {filteredArticles.map((article) => (
                        <div key={article.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getRiskColor(article.riskLevel)}>
                                  {article.riskLevel}
                                </Badge>
                                <Badge variant="outline">{article.category}</Badge>
                                <Badge variant="secondary">{article.source}</Badge>
                                {article.sentimentScore && (
                                  <div className="flex items-center gap-1">
                                    {getSentimentIcon(article.sentimentScore)}
                                    <span className={`text-xs ${getSentimentColor(article.sentimentScore)}`}>
                                      {article.sentimentScore.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <h4 className="font-semibold mb-2">{article.title}</h4>
                              <p className="text-sm text-muted-foreground mb-3">{article.description}</p>
                              <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(article.publishedAt).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex gap-1">
                                  {article.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(article.url, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Read
                              </Button>
                              {article.riskLevel === 'Critical' || article.riskLevel === 'High' ? (
                                <Button variant="destructive" size="sm">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Alert
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Articles by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.byCategory.map((item) => (
                      <div key={item.category} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(item.count / stats.total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Risk Level Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.byRiskLevel.map((item) => (
                      <div key={item.riskLevel} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.riskLevel}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                item.riskLevel === 'Critical' ? 'bg-red-600' :
                                item.riskLevel === 'High' ? 'bg-orange-600' :
                                item.riskLevel === 'Medium' ? 'bg-yellow-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${(item.count / stats.total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Top Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.topTags.slice(0, 10).map((item) => (
                      <div key={item.tag} className="flex justify-between items-center">
                        <span className="text-sm">{item.tag}</span>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5" />
                    Sentiment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-600">Positive</span>
                      <span className="text-sm text-muted-foreground">
                        {stats?.sentimentDistribution.positive || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Neutral</span>
                      <span className="text-sm text-muted-foreground">
                        {stats?.sentimentDistribution.neutral || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-red-600">Negative</span>
                      <span className="text-sm text-muted-foreground">
                        {stats?.sentimentDistribution.negative || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  News Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats?.bySource.map((source) => (
                    <div key={source.source} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{source.source}</h4>
                        <Badge variant="outline">{source.count}</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(source.count / stats.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Scraping Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {stats?.scrapingActivity.map((activity, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                          <Badge 
                            variant={activity.status === 'success' ? 'default' : 'destructive'}
                          >
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.notes}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}