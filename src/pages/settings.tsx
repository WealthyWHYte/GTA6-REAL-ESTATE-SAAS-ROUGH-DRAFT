// Settings Page - API Connections & User Preferences
// Users can configure their API keys, email credentials, and AI preferences

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, Key, Mail, Brain, Zap, CreditCard, 
  CheckCircle, RefreshCw, Save, Eye, EyeOff, ExternalLink, Info, Terminal
} from 'lucide-react'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({})
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({})

  // Fetch API keys
  const { data: apiKeys, refetch: refetchKeys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data } = await supabase.from('api_keys').select('*').eq('user_id', user.id)
      return data || []
    }
  })

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase.from('user_preferences').select('*').eq('user_id', user.id).single()
      return data
    }
  })

  // Fetch API usage
  const { data: usageStats } = useQuery({
    queryKey: ['api-usage'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      const { data } = await supabase.from('api_usage_log')
        .select('api_service, tokens_used, estimated_cost')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())
      return data || []
    }
  })

  // Save API Key mutation
  const saveApiKey = useMutation({
    mutationFn: async ({ service, apiKey, config }: { service: string, apiKey: string, config?: any }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data: account } = await supabase.from('accounts').select('id').eq('user_id', user.id).single()
      await supabase.from('api_keys').upsert({
        account_id: account?.id,
        user_id: user.id,
        service,
        api_key_encrypted: apiKey,
        api_key_last4: apiKey.slice(-4),
        config: config || {},
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'account_id,service' })
    },
    onSuccess: () => refetchKeys()
  })

  // Save preferences mutation
  const savePreferences = useMutation({
    mutationFn: async (prefs: any) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data: account } = await supabase.from('accounts').select('id').eq('user_id', user.id).single()
      await supabase.from('user_preferences').upsert({
        account_id: account?.id,
        user_id: user.id,
        ...prefs,
        updated_at: new Date().toISOString()
      }, { onConflict: 'account_id' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-preferences'] })
  })

  const toggleShowKey = (service: string) => {
    setShowKeys(prev => ({ ...prev, [service]: !prev[service] }))
  }

  // Gmail OAuth functions
  const [gmailConnected, setGmailConnected] = useState(false)
  
  // Check Gmail connection status
  useQuery({
    queryKey: ['gmail-status'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false
      const { data } = await supabase
        .from('user_api_config')
        .select('gmail_status')
        .eq('account_id', user.id)
        .single()
      setGmailConnected(data?.gmail_status === 'connected')
      return data?.gmail_status === 'connected'
    }
  })

  const connectGmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // Get OAuth URL
      const { data } = await supabase.functions.invoke('gmail-oauth-handler', {
        body: { action: 'get_url', account_id: user.id }
      })
      
      if (data?.url) {
        // Open OAuth in popup
        window.open(data.url, 'Gmail OAuth', 'width=500,height=600')
      }
    } catch (e) {
      console.error('Failed to connect Gmail:', e)
    }
  }

  const disconnectGmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      await supabase.functions.invoke('gmail-oauth-handler', {
        body: { action: 'disconnect', account_id: user.id }
      })
      
      setGmailConnected(false)
      queryClient.invalidateQueries({ queryKey: ['gmail-status'] })
    } catch (e) {
      console.error('Failed to disconnect Gmail:', e)
    }
  }

  const monthlySpend = usageStats?.reduce((sum, u) => sum + (u.estimated_cost || 0), 0) || 0
  const totalCalls = usageStats?.length || 0
  const budget = preferences?.max_monthly_spend || 100
  const budgetUsed = (monthlySpend / budget) * 100

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Settings
          </h1>
          <p className="text-slate-600 mt-2">Configure your API connections and AI preferences</p>
        </div>

        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connections"><Key className="w-4 h-4 mr-2" />API Connections</TabsTrigger>
            <TabsTrigger value="ai"><Brain className="w-4 h-4 mr-2" />AI Settings</TabsTrigger>
            <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" />Email</TabsTrigger>
            <TabsTrigger value="usage"><CreditCard className="w-4 h-4 mr-2" />Usage</TabsTrigger>
          </TabsList>

          {/* API Connections */}
          <TabsContent value="connections" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🧠</span>
                    <div>
                      <CardTitle>OpenRouter AI</CardTitle>
                      <CardDescription>AI for market analysis, scoring, and emails</CardDescription>
                    </div>
                  </div>
                  <Badge variant={apiKeys?.find(k => k.service === 'openrouter') ? "default" : "secondary"}>
                    {apiKeys?.find(k => k.service === 'openrouter') ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>API Key</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      type={showKeys.openrouter ? "text" : "password"}
                      placeholder="sk-or-v1-..."
                      className="flex-1"
                      value={apiKeyInputs.openrouter || ''}
                      onChange={(e) => setApiKeyInputs(prev => ({ ...prev, openrouter: e.target.value }))}
                    />
                    <Button variant="outline" size="icon" onClick={() => toggleShowKey('openrouter')}>
                      {showKeys.openrouter ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => apiKeyInputs.openrouter && saveApiKey.mutate({ service: 'openrouter', apiKey: apiKeyInputs.openrouter })} disabled={!apiKeyInputs.openrouter}>
                    <Save className="w-4 h-4 mr-2" /> Save Key
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="https://openrouter.ai/keys" target="_blank">Get Key <ExternalLink className="w-3 h-3 ml-1" /></a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📧</span>
                    <div>
                      <CardTitle>Gmail</CardTitle>
                      <CardDescription>Send & receive emails (OAuth recommended)</CardDescription>
                    </div>
                  </div>
                  <Badge variant={gmailConnected ? "default" : "secondary"}>
                    {gmailConnected ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* OAuth Connection */}
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">🔗 Gmail OAuth (Recommended)</p>
                      <p className="text-sm text-gray-600">Connect to read agent replies automatically</p>
                    </div>
                    {gmailConnected ? (
                      <Button variant="destructive" size="sm" onClick={disconnectGmail}>
                        Disconnect
                      </Button>
                    ) : (
                      <Button size="sm" onClick={connectGmail}>
                        Connect Gmail
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-500">- OR -</div>
                
                {/* App Password (Legacy) */}
                <div>
                  <Label>App Password (Legacy - can send only)</Label>
                  <div className="grid grid-cols-2 gap-4 mt-1">
                    <Input placeholder="you@gmail.com" id="gmail-email" />
                    <Input type="password" placeholder="xxxx xxxx xxxx xxxx" id="gmail-pass" />
                  </div>
                </div>
                <Button variant="outline" onClick={() => {
                  const email = (document.getElementById('gmail-email') as HTMLInputElement)?.value
                  const pass = (document.getElementById('gmail-pass') as HTMLInputElement)?.value
                  if (email && pass) saveApiKey.mutate({ service: 'gmail', apiKey: JSON.stringify({ email, password: pass }), config: { email } })
                }}>
                  <Save className="w-4 h-4 mr-2" /> Save App Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🕷️</span>
                    <div>
                      <CardTitle>Apify</CardTitle>
                      <CardDescription>Web scraping for property data</CardDescription>
                    </div>
                  </div>
                  <Badge variant={apiKeys?.find(k => k.service === 'apify') ? "default" : "secondary"}>
                    {apiKeys?.find(k => k.service === 'apify') ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>API Token</Label>
                  <Input 
                    type={showKeys.apify ? "text" : "password"}
                    placeholder="apify_api_..."
                    className="mt-1"
                    value={apiKeyInputs.apify || ''}
                    onChange={(e) => setApiKeyInputs(prev => ({ ...prev, apify: e.target.value }))}
                  />
                </div>
                <Button onClick={() => apiKeyInputs.apify && saveApiKey.mutate({ service: 'apify', apiKey: apiKeyInputs.apify })} disabled={!apiKeyInputs.apify}>
                  <Save className="w-4 h-4 mr-2" /> Save
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Settings */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Preferences</CardTitle>
                <CardDescription>Configure AI behavior for your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label>Default AI Model</Label>
                    <Select defaultValue={preferences?.preferred_ai_model || 'claude-haiku'} onValueChange={(v) => savePreferences.mutate({ preferred_ai_model: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claude-opus">Claude Opus 4.5 (Best)</SelectItem>
                        <SelectItem value="claude-sonnet">Claude Sonnet 4.5 (Balanced)</SelectItem>
                        <SelectItem value="claude-haiku">Claude Haiku (Fast)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Analysis Depth</Label>
                    <Select defaultValue={preferences?.ai_depth || 'balanced'} onValueChange={(v) => savePreferences.mutate({ ai_depth: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quick">Quick (1 call/property)</SelectItem>
                        <SelectItem value="balanced">Balanced (2-3 calls)</SelectItem>
                        <SelectItem value="deep">Deep (5+ calls)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* AI Tier Selection - Software Brain vs My Credits */}
                <div className="border-t pt-6 mt-6">
                  <Label className="text-base font-semibold mb-4 block">AI Provider</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Software Brain Option - FREE */}
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        preferences?.ai_tier === 'software' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-slate-300 hover:border-green-300'
                      }`}
                      onClick={() => savePreferences.mutate({ ai_tier: 'software' })}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">🧠 Software Brain</h3>
                        {preferences?.ai_tier === 'software' && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            ACTIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        FREE - Our server AI for all users
                      </p>
                    </div>

                    {/* My Credits Option - PAID */}
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        preferences?.ai_tier === 'credits' || !preferences?.ai_tier
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-300 hover:border-blue-300'
                      }`}
                      onClick={() => savePreferences.mutate({ ai_tier: 'credits' })}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">💳 My Credits</h3>
                        {(preferences?.ai_tier === 'credits' || !preferences?.ai_tier) && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                            ACTIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        Paid - Use your API credits
                      </p>
                    </div>
                  </div>

                  {/* Explanation */}
                  {preferences?.ai_tier === 'software' && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        ✅ Using Software Brain (FREE)
                      </h4>
                      <p className="text-sm text-slate-700">
                        Your AI operations are powered by our server's brain at no cost to you! 
                        Perfect for users without API credits. Quality: Great for property analysis, 
                        emails, and deal scoring.
                      </p>
                    </div>
                  )}

                  {preferences?.ai_tier === 'credits' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        💳 Using Your API Credits
                      </h4>
                      <p className="text-sm text-slate-700">
                        AI operations use your API key. You'll be charged per request based on 
                        your monthly budget settings. Quality: Premium (Claude Opus, GPT-4).
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label className="cursor-help border-b border-dotted border-slate-400">Monthly Budget</Label>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Sets your monthly spending limit for AI API calls (e.g., Claude, OpenAI). If you use local Ollama, this budget won't be consumed.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex items-center gap-4 mt-1">
                    <Input type="number" className="w-32" defaultValue={budget} onChange={(e) => savePreferences.mutate({ max_monthly_spend: parseFloat(e.target.value) })} />
                    <span className="text-slate-500">USD/month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Automation</CardTitle>
                <CardDescription>Configure email sending behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-send generated emails</Label>
                    <p className="text-sm text-slate-500">Automatically send AI-generated emails without manual approval</p>
                  </div>
                  <Switch checked={preferences?.auto_send_emails || false} onCheckedChange={(v) => savePreferences.mutate({ auto_send_emails: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require approval before send</Label>
                    <p className="text-sm text-slate-500">Review each email before it's sent</p>
                  </div>
                  <Switch checked={preferences?.require_approval_before_send !== false} onCheckedChange={(v) => savePreferences.mutate({ require_approval_before_send: v })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Usage This Month</CardTitle>
                <CardDescription>Track your AI API consumption</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-100 rounded-lg">
                    <p className="text-2xl font-bold">${monthlySpend.toFixed(2)}</p>
                    <p className="text-sm text-slate-500">Total Spent</p>
                  </div>
                  <div className="text-center p-4 bg-slate-100 rounded-lg">
                    <p className="text-2xl font-bold">{totalCalls}</p>
                    <p className="text-sm text-slate-500">API Calls</p>
                  </div>
                  <div className="text-center p-4 bg-slate-100 rounded-lg">
                    <p className="text-2xl font-bold">${budget}</p>
                    <p className="text-sm text-slate-500">Budget</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Budget Used</span>
                    <span>{budgetUsed.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${Math.min(budgetUsed, 100)}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
