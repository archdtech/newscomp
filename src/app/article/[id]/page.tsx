'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  ExternalLink,
  Calendar,
  Tag,
  AlertTriangle,
  Shield,
  Clock,
  Globe,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

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
  createdAt: string
  tags: string[]
  metadata?: {
    original_url?: string
    full_content?: string
    entities?: string[]
    sentiment_score?: number
  }
}

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<ComplianceAlert | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/alerts/${params.id}`)
        if (!response.ok) {
          throw new Error('Article not found')
        }
        const data = await response.json()
        setArticle(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchArticle()
    }
  }, [params.id])

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <XCircle className="w-4 h-4 text-red-500" />
      case 'Warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'Info': return <CheckCircle className="w-4 h-4 text-blue-500" />
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Resolved': return 'bg-blue-100 text-blue-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading article...</span>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Article Not Found
            </CardTitle>
            <CardDescription>
              {error || 'The requested compliance alert could not be found.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900">Home</Link>
              <span>/</span>
              <span>Compliance Alert</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Article Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold leading-tight mb-4">
                    {article.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span>{article.source}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(article.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getRiskColor(article.riskLevel)}>
                    {article.riskLevel} Risk
                  </Badge>
                  <Badge className={getStatusColor(article.status)}>
                    {article.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Alert Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Alert Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {article.description}
                  </p>
                </CardContent>
              </Card>

              {/* Full Content (if available) */}
              {article.metadata?.full_content && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {article.metadata.full_content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {article.metadata?.original_url && (
                      <Button 
                        onClick={() => window.open(article.metadata?.original_url, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Original Source
                      </Button>
                    )}
                    <Button variant="outline">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Reviewed
                    </Button>
                    <Button variant="outline">
                      <Tag className="w-4 h-4 mr-2" />
                      Add to Watchlist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Alert Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Alert Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Category</label>
                    <p className="text-sm text-gray-900">{article.category}</p>
                  </div>
                  {article.subcategory && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Subcategory</label>
                      <p className="text-sm text-gray-900">{article.subcategory}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Severity</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getSeverityIcon(article.severity)}
                      <span className="text-sm text-gray-900">{article.severity}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Priority</label>
                    <p className="text-sm text-gray-900">Level {article.priority}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Entities (if available) */}
              {article.metadata?.entities && article.metadata.entities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Related Entities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {article.metadata.entities.map((entity, index) => (
                        <div key={index} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                          {entity}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resource Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resource Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Source Available</span>
                      <div className="flex items-center gap-1">
                        {article.metadata?.original_url ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600">Unavailable</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Checked</span>
                      <span className="text-sm text-gray-900">
                        {new Date(article.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
