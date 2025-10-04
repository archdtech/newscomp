'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Tag, 
  ExternalLink, 
  Calendar, 
  Building2, 
  Download, 
  Settings, 
  Package, 
  CheckCircle, 
  Brain, 
  Gavel,
  Shield,
  BarChart3,
  Users,
  Zap,
  Target,
  ArrowRight,
  Star,
  Award,
  TrendingUpIcon,
  AlertTriangle,
  Eye,
  Database,
  Globe
} from 'lucide-react'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs"

interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  publishedAt: string
  tags: string[]
  category: string
  originalUrl: string
  isFeatured: boolean
  impact: 'High' | 'Medium' | 'Low'
}

interface StatCard {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend: 'up' | 'down' | 'stable'
  color: string
}

interface FeatureCard {
  title: string
  description: string
  icon: React.ReactNode
  link: string
  color: string
}

export default function Home() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedImpact, setSelectedImpact] = useState('all')
  const [loading, setLoading] = useState(true)

  // Enhanced mock compliance alerts data for demonstration
  const mockArticles: NewsArticle[] = [
    {
      id: '1',
      title: 'SEC Proposes New Cybersecurity Disclosure Requirements for Public Companies',
      summary: 'The Securities and Exchange Commission has proposed new rules requiring public companies to disclose material cybersecurity incidents within 4 business days, including details about the incident\'s nature and impact.',
      source: 'SEC',
      publishedAt: '2025-06-20',
      tags: ['High Risk', 'Cybersecurity', 'Disclosure', 'Public Companies'],
      category: 'Regulatory Change',
      originalUrl: 'https://www.sec.gov/news/statement/gensler-statement-cybersecurity-risk-062025',
      isFeatured: true,
      impact: 'High'
    },
    {
      id: '2',
      title: 'AWS Service Outage Affects Multiple US-East Regions',
      summary: 'Amazon Web Services experienced a multi-hour outage affecting EC2, S3, and Lambda services across multiple US-East regions, impacting thousands of enterprise customers.',
      source: 'AWS Status',
      publishedAt: '2025-06-19',
      tags: ['Medium Risk', 'Vendor Outage', 'Cloud Infrastructure'],
      category: 'Vendor Risk',
      originalUrl: 'https://status.aws.amazon.com/',
      isFeatured: false,
      impact: 'Medium'
    },
    {
      id: '3',
      title: 'GDPR Enforcement Actions Increase by 45% in 2025',
      summary: 'European data protection authorities have significantly increased enforcement actions under GDPR, with fines totaling €1.2 billion in the first half of 2025, focusing on data breaches and consent violations.',
      source: 'European Data Protection Board',
      publishedAt: '2025-06-18',
      tags: ['High Risk', 'GDPR', 'Enforcement', 'Privacy'],
      category: 'Regulatory Change',
      originalUrl: 'https://edpb.europa.eu/news/en/news/2025/edpb-report-gdpr-enforcement-trends-2025',
      isFeatured: true,
      impact: 'High'
    },
    {
      id: '4',
      title: 'Stripe Payment Processing Delays in European Region',
      summary: 'Stripe reported payment processing delays affecting European customers, with some transactions experiencing up to 2-hour delays in settlement and processing times.',
      source: 'Stripe Status',
      publishedAt: '2025-06-17',
      tags: ['Low Risk', 'Payment Processing', 'Vendor Outage'],
      category: 'Vendor Risk',
      originalUrl: 'https://status.stripe.com/',
      isFeatured: false,
      impact: 'Low'
    },
    {
      id: '5',
      title: 'FINRA Issues New Guidance on Crypto Asset Compliance',
      summary: 'The Financial Industry Regulatory Authority released comprehensive new guidance for member firms dealing with crypto assets, covering custody, trading, and customer protection requirements.',
      source: 'FINRA',
      publishedAt: '2025-06-16',
      tags: ['High Risk', 'Cryptocurrency', 'Compliance Guidance', 'Financial Services'],
      category: 'Regulatory Change',
      originalUrl: 'https://www.finra.org/rules-guidance/guidance/crypto-asset-compliance',
      isFeatured: true,
      impact: 'High'
    }
  ]

  // Statistics data
  const stats: StatCard[] = [
    {
      title: 'Active Alerts',
      value: '247',
      description: '+12% from last week',
      icon: <AlertTriangle className="w-6 h-6" />,
      trend: 'up',
      color: 'text-red-600'
    },
    {
      title: 'Vendors Monitored',
      value: '156',
      description: '100+ critical services',
      icon: <Building2 className="w-6 h-6" />,
      trend: 'stable',
      color: 'text-blue-600'
    },
    {
      title: 'Regulatory Bodies',
      value: '52',
      description: 'Global coverage',
      icon: <Gavel className="w-6 h-6" />,
      trend: 'up',
      color: 'text-green-600'
    },
    {
      title: 'Time Saved',
      value: '3.5h',
      description: 'Daily average',
      icon: <Clock className="w-6 h-6" />,
      trend: 'up',
      color: 'text-purple-600'
    }
  ]

  // Feature cards
  const features: FeatureCard[] = [
    {
      title: 'Compliance Dashboard',
      description: 'Real-time analytics and insights into your compliance landscape',
      icon: <BarChart3 className="w-8 h-8" />,
      link: '/dashboard',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Vendor Monitoring',
      description: 'Real-time status tracking of critical vendors and service providers',
      icon: <Building2 className="w-8 h-8" />,
      link: '/vendors',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'AI Alerts',
      description: 'Intelligent compliance alerts powered by advanced AI analysis',
      icon: <Brain className="w-8 h-8" />,
      link: '/ai-alerts',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Regulatory Monitor',
      description: 'Comprehensive tracking of regulatory bodies and compliance requirements',
      icon: <Gavel className="w-8 h-8" />,
      link: '/regulatory-monitoring',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  useEffect(() => {
    // Fetch real compliance alerts from API
    const fetchData = async () => {
      try {
        const [alertsResponse, statsResponse] = await Promise.all([
          fetch('/api/alerts?limit=20'),
          fetch('/api/news/stats')
        ])
        
        const alertsData = await alertsResponse.json()
        const statsData = await statsResponse.json()
        
        // Map API data to component interface
        const mappedArticles = alertsData.alerts?.map((alert: any) => ({
          id: alert.id,
          title: alert.title,
          summary: alert.description,
          source: alert.source,
          publishedAt: alert.publishedAt,
          tags: alert.tags || [],
          category: alert.category,
          originalUrl: alert.metadata?.original_url || `https://example.com/alert/${alert.id}`,
          isFeatured: alert.riskLevel === 'Critical' || alert.riskLevel === 'High',
          impact: alert.riskLevel === 'Critical' ? 'High' : alert.riskLevel === 'High' ? 'High' : alert.riskLevel === 'Medium' ? 'Medium' : 'Low'
        })) || []
        
        setArticles(mappedArticles)
        setFilteredArticles(mappedArticles)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        // Fallback to mock data
        setArticles(mockArticles)
        setFilteredArticles(mockArticles)
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = articles

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory)
    }

    if (selectedImpact !== 'all') {
      filtered = filtered.filter(article => article.impact === selectedImpact)
    }

    setFilteredArticles(filtered)
  }, [articles, searchTerm, selectedCategory, selectedImpact])

  const categories = ['all', ...new Set(articles.map(article => article.category))]
  const impacts = ['all', 'High', 'Medium', 'Low']

  const featuredArticles = filteredArticles.filter(article => article.isFeatured)
  const regularArticles = filteredArticles.filter(article => !article.isFeatured)

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'High':
        return <Badge variant="destructive" className="bg-red-500">High Impact</Badge>
      case 'Medium':
        return <Badge variant="secondary" className="bg-yellow-500 text-yellow-900">Medium Impact</Badge>
      case 'Low':
        return <Badge variant="outline">Low Impact</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 mr-4" />
              <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                Beacon
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 mb-4">
              Compliance Intelligence Platform
            </p>
            <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
              Transform hours of manual compliance monitoring into minutes of intelligent, automated operations with AI-powered insights and real-time alerts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignedOut>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <SignInButton mode="modal">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg">
                      Sign In to Get Started
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 text-lg">
                      Create Account
                    </Button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 text-lg">
                    <Link href="/news" className="flex items-center gap-2">
                      View News Feed
                      <Eye className="w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white opacity-10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white opacity-10 rounded-full animate-pulse delay-2000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform at a Glance</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real-time insights into your compliance landscape with powerful analytics and monitoring capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                      {stat.trend === 'up' && <TrendingUpIcon className="w-4 h-4 mr-1" />}
                      {stat.trend === 'down' && <TrendingUpIcon className="w-4 h-4 mr-1 rotate-180" />}
                      {stat.description}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Authentication-based Content Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <SignedOut>Get Started with Beacon</SignedOut>
              <SignedIn>Welcome to Your Dashboard</SignedIn>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              <SignedOut>
                Sign in or create an account to access powerful compliance intelligence features and real-time monitoring.
              </SignedOut>
              <SignedIn>
                You're all set! Explore the full capabilities of our compliance intelligence platform.
              </SignedIn>
            </p>
          </div>

          <SignedOut>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Shield className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Authentication</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Industry-leading security with Clerk authentication to protect your compliance data.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Brain className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Advanced AI algorithms provide intelligent compliance analysis and risk assessment.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Monitoring</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      24/7 monitoring of vendors, regulatory changes, and compliance requirements.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-12">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <SignInButton mode="modal">
                    <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-8 py-3 text-lg">
                      Sign In Now
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg">
                      Create Free Account
                    </Button>
                  </SignUpButton>
                </div>
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard'}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard</h3>
                    <p className="text-sm text-gray-600">View your compliance analytics and alerts</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard-v2'}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard v2</h3>
                    <p className="text-sm text-gray-600">Advanced dashboard with enhanced features</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/news'}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Globe className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">News Feed</h3>
                    <p className="text-sm text-gray-600">Real-time compliance news and updates</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/vendors'}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Vendors</h3>
                    <p className="text-sm text-gray-600">Monitor vendor status and performance</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </SignedIn>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to streamline your compliance operations and stay ahead of regulatory changes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-white`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link href={feature.link}>
                      Explore
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Alerts Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Recent Compliance Alerts</h2>
              <p className="text-lg text-gray-600">Stay informed with the latest regulatory changes and vendor updates.</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedImpact} onValueChange={setSelectedImpact}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Impact</SelectItem>
                  {impacts.filter(impact => impact !== 'all').map(impact => (
                    <SelectItem key={impact} value={impact}>{impact}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading compliance alerts...</p>
            </div>
          ) : (
            <>
              {/* Critical Alerts */}
              {featuredArticles.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Critical Alerts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredArticles.map(article => (
                      <Card key={article.id} className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <Badge variant="default" className="mb-2">{article.category}</Badge>
                              <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {getImpactBadge(article.impact)}
                              <span className="text-xs text-gray-500">{article.publishedAt}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-base mb-4 text-left">
                            {article.summary}
                          </CardDescription>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {article.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {article.source}
                            </span>
                            <div className="flex gap-2">
                              <Link href={`/article/${article.id}`}>
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  Read More
                                </Button>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => window.open(article.originalUrl, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3" />
                                View Source
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Alerts */}
              {regularArticles.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Recent Updates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularArticles.map(article => (
                      <Card key={article.id} className="shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <Badge variant="outline" className="mb-2">{article.category}</Badge>
                              <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {getImpactBadge(article.impact)}
                              <span className="text-xs text-gray-500">{article.publishedAt}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-base mb-4 text-left">
                            {article.summary}
                          </CardDescription>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {article.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {article.source}
                            </span>
                            <div className="flex gap-2">
                              <Link href={`/article/${article.id}`}>
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  Read More
                                </Button>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => window.open(article.originalUrl, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3" />
                                View Source
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Compliance Operations?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of compliance professionals who trust Beacon to streamline their workflow and stay ahead of regulatory changes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg">
              <a href="/dashboard" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 text-lg">
              <a href="/vendors" className="flex items-center gap-2">
                View Demo
                <Eye className="w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}