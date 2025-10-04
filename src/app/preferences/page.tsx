'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Mail, 
  Globe, 
  Building2, 
  Clock, 
  Shield, 
  Bell,
  Save,
  X,
  Plus
} from 'lucide-react'

interface UserPreferences {
  industry: string
  jurisdictions: string[]
  vendorWatchlist: string[]
  emailFrequency: string
  timezone: string
  riskThreshold: string
  categories: string[]
  emailTime: string
  notifications: {
    email: boolean
    critical: boolean
    high: boolean
    medium: boolean
  }
}

const INDUSTRIES = [
  'Financial Services',
  'Healthcare',
  'Technology',
  'Insurance',
  'Manufacturing',
  'Retail',
  'Energy',
  'Government',
  'Education',
  'Other'
]

const JURISDICTIONS = [
  'United States',
  'European Union',
  'United Kingdom',
  'Canada',
  'Australia',
  'Singapore',
  'Japan',
  'Global'
]

const CATEGORIES = [
  'Regulatory',
  'Vendor',
  'Policy',
  'Enforcement',
  'Security',
  'Privacy',
  'Financial',
  'Operational'
]

const COMMON_VENDORS = [
  'Amazon Web Services',
  'Microsoft Azure',
  'Google Cloud Platform',
  'Salesforce',
  'Stripe',
  'Plaid',
  'Okta',
  'Slack',
  'Microsoft 365',
  'DocuSign'
]

export default function PreferencesPage() {
  const { user } = useUser()
  const [preferences, setPreferences] = useState<UserPreferences>({
    industry: '',
    jurisdictions: [],
    vendorWatchlist: [],
    emailFrequency: 'daily',
    timezone: 'America/New_York',
    riskThreshold: 'medium',
    categories: ['Regulatory', 'Vendor'],
    emailTime: '07:00',
    notifications: {
      email: true,
      critical: true,
      high: true,
      medium: false
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newVendor, setNewVendor] = useState('')

  useEffect(() => {
    loadPreferences()
  }, [user])

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      if (response.ok) {
        const data = await response.json()
        if (data.preferences) {
          setPreferences({ ...preferences, ...data.preferences })
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preferences })
      })

      if (response.ok) {
        console.log('Preferences saved successfully')
      } else {
        console.error('Failed to save preferences')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const addVendor = () => {
    if (newVendor.trim() && !preferences.vendorWatchlist.includes(newVendor.trim())) {
      setPreferences({
        ...preferences,
        vendorWatchlist: [...preferences.vendorWatchlist, newVendor.trim()]
      })
      setNewVendor('')
    }
  }

  const removeVendor = (vendor: string) => {
    setPreferences({
      ...preferences,
      vendorWatchlist: preferences.vendorWatchlist.filter(v => v !== vendor)
    })
  }

  const toggleJurisdiction = (jurisdiction: string) => {
    const updated = preferences.jurisdictions.includes(jurisdiction)
      ? preferences.jurisdictions.filter(j => j !== jurisdiction)
      : [...preferences.jurisdictions, jurisdiction]
    
    setPreferences({ ...preferences, jurisdictions: updated })
  }

  const toggleCategory = (category: string) => {
    const updated = preferences.categories.includes(category)
      ? preferences.categories.filter(c => c !== category)
      : [...preferences.categories, category]
    
    setPreferences({ ...preferences, categories: updated })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>
              <p className="text-gray-600">Customize your compliance intelligence experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          
          {/* Industry & Jurisdictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Industry & Jurisdictions
              </CardTitle>
              <CardDescription>
                Help us tailor compliance alerts to your specific industry and regulatory environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={preferences.industry} onValueChange={(value) => setPreferences({ ...preferences, industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Jurisdictions</Label>
                <p className="text-sm text-gray-600 mb-3">Select the regulatory jurisdictions relevant to your organization</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {JURISDICTIONS.map(jurisdiction => (
                    <div key={jurisdiction} className="flex items-center space-x-2">
                      <Switch
                        checked={preferences.jurisdictions.includes(jurisdiction)}
                        onCheckedChange={() => toggleJurisdiction(jurisdiction)}
                      />
                      <Label className="text-sm">{jurisdiction}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Preferences
              </CardTitle>
              <CardDescription>
                Configure when and how you receive compliance alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="frequency">Email Frequency</Label>
                  <Select value={preferences.emailFrequency} onValueChange={(value) => setPreferences({ ...preferences, emailFrequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time (Critical only)</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="emailTime">Daily Digest Time</Label>
                  <Input
                    type="time"
                    value={preferences.emailTime}
                    onChange={(e) => setPreferences({ ...preferences, emailTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Notification Types</Label>
                <div className="space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Critical Alerts</span>
                    </div>
                    <Switch
                      checked={preferences.notifications.critical}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, critical: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">High Priority Alerts</span>
                    </div>
                    <Switch
                      checked={preferences.notifications.high}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, high: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Medium Priority Alerts</span>
                    </div>
                    <Switch
                      checked={preferences.notifications.medium}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, medium: checked }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Alert Categories
              </CardTitle>
              <CardDescription>
                Choose which types of compliance alerts you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CATEGORIES.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Switch
                      checked={preferences.categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <Label className="text-sm">{category}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vendor Watchlist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Vendor Watchlist
              </CardTitle>
              <CardDescription>
                Monitor specific vendors for service outages and compliance issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add vendor to watchlist..."
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addVendor()}
                />
                <Button onClick={addVendor} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Common Vendors</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {COMMON_VENDORS.map(vendor => (
                    <Button
                      key={vendor}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!preferences.vendorWatchlist.includes(vendor)) {
                          setPreferences({
                            ...preferences,
                            vendorWatchlist: [...preferences.vendorWatchlist, vendor]
                          })
                        }
                      }}
                      disabled={preferences.vendorWatchlist.includes(vendor)}
                    >
                      {vendor}
                    </Button>
                  ))}
                </div>
              </div>

              {preferences.vendorWatchlist.length > 0 && (
                <div>
                  <Label className="text-sm text-gray-600">Your Watchlist</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {preferences.vendorWatchlist.map(vendor => (
                      <Badge key={vendor} variant="secondary" className="flex items-center gap-1">
                        {vendor}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeVendor(vendor)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={savePreferences} disabled={saving} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
