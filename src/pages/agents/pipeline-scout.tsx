// Pipeline Scout Agent Page
// Cleans and prepares property lists for processing

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { 
  Upload, FileSpreadsheet, CheckCircle, AlertCircle, 
  RefreshCw, Trash2, Database, Edit2, Save, X,
  Search, TrendingUp, DollarSign, FileSignature, Mail, Target, ArrowRight
} from 'lucide-react'

interface PropertyPreview {
  address: string
  city: string
  state: string
  zip: string
  price: string
  bedrooms: string
  bathrooms: string
  sqft: string
  agent_email: string
  agent_name: string
  status: 'valid' | 'warning' | 'error'
  issues: string[]
}

interface Dataset {
  id: string
  name: string
  status: 'pending' | 'processing' | 'processed' | 'error'
  total_properties: number
  processed_properties: number
  created_at: string
}

// Pipeline agent definitions
const PIPELINE_AGENTS = [
  {
    id: 'pipeline-scout',
    name: 'Pipeline Scout',
    tagline: 'Data processing & opportunity identification',
    description: 'Find the needles in the haystack',
    icon: Search,
    path: '/agent/pipeline-scout',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'market-scout',
    name: 'Market Scout',
    tagline: 'Market research, comps, ARV calculation',
    description: 'Conduct deep market analysis',
    icon: TrendingUp,
    path: '/agent/market-scout',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  {
    id: 'underwriter',
    name: 'Underwriter',
    tagline: 'Deal vetting & creative finance analysis',
    description: 'Separate gold from garbage',
    icon: DollarSign,
    path: '/agent/underwriter',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30'
  },
  {
    id: 'contract-specialist',
    name: 'Contract Specialist',
    tagline: 'Offer creation & legal document generation',
    description: 'Create offers and bulletproof agreements',
    icon: FileSignature,
    path: '/agent/contract-specialist',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30'
  },
  {
    id: 'email-closer',
    name: 'Email Closer',
    tagline: 'Negotiation & relationship management',
    description: 'Close deals through communication',
    icon: Mail,
    path: '/agent/email-closer',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30'
  },
  {
    id: 'dispo-agent',
    name: 'Dispo Agent',
    tagline: 'Property disposition & buyer matching',
    description: 'Match properties with end buyers',
    icon: Target,
    path: '/agent/dispo-agent',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30'
  }
]

export default function PipelineScoutPage() {
  const [files, setFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<PropertyPreview[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Get recent datasets
  const { data: datasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('datasets')
        .select('*')
        .eq('account_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10)
      return data || []
    }
  })

  // Rename dataset mutation
  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('datasets')
        .update({ name })
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
      setEditingId(null)
      setEditName('')
    }
  })

  // Parse CSV file
  const parseCSV = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.trim().split('\n')
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
      
      const properties: PropertyPreview[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        if (values.length >= headers.length) {
          const getValue = (col: string) => {
            const idx = headers.findIndex(h => h.includes(col) || h === col)
            return idx >= 0 ? values[idx]?.trim() : ''
          }

          const address = getValue('address') || getValue('property')
          const issues: string[] = []
          
          if (!address) issues.push('Missing address')
          if (!getValue('city')) issues.push('Missing city')
          if (!getValue('state')) issues.push('Missing state')
          if (getValue('price') && isNaN(parseFloat(getValue('price')))) {
            issues.push('Invalid price format')
          }

          properties.push({
            address,
            city: getValue('city') || '',
            state: getValue('state') || '',
            zip: getValue('zip') || '',
            price: getValue('price') || '',
            bedrooms: getValue('bedrooms') || '',
            bathrooms: getValue('bathrooms') || '',
            sqft: getValue('sqft') || '',
            agent_email: getValue('agent_email') || getValue('email') || '',
            agent_name: getValue('agent_name') || getValue('agent') || '',
            status: issues.length > 2 ? 'error' : issues.length > 0 ? 'warning' : 'valid',
            issues
          })
        }
      }
      
      setPreview(properties)
    }
    reader.readAsText(file)
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
    if (acceptedFiles.length > 0) {
      parseCSV(acceptedFiles[0])
    }
  }, [parseCSV])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1
  })

  // Upload and process CSV
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const file = files[0]
      const csvData = await file.text()

      setProcessing(true)
      setProgress(0)

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90))
      }, 500)

      const { data, error } = await supabase.functions.invoke('process-csv', {
        body: { csv_data: csvData, account_id: user.id }
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
      setFiles([])
      setPreview([])
      setProgress(0)
    },
    onError: (error) => {
      console.error('Upload failed:', error)
      setProcessing(false)
    }
  })

  const validCount = preview.filter(p => p.status === 'valid').length
  const warningCount = preview.filter(p => p.status === 'warning').length
  const errorCount = preview.filter(p => p.status === 'error').length

  const handleRename = (dataset: Dataset) => {
    setEditingId(dataset.id)
    setEditName(dataset.name || 'Untitled')
  }

  const saveRename = (id: string) => {
    if (editName.trim()) {
      renameMutation.mutate({ id, name: editName.trim() })
    } else {
      setEditingId(null)
      setEditName('')
    }
  }

  const cancelRename = () => {
    setEditingId(null)
    setEditName('')
  }

  const handleAgentClick = (agent: typeof PIPELINE_AGENTS[0]) => {
    navigate(agent.path)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gta-blue mb-2 flex items-center gap-3">
            <Search className="w-8 h-8 text-blue-500" />
            Pipeline Scout Agent
          </h1>
          <p className="text-muted-foreground">
            Upload, clean, and process property lists for your pipeline
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Property List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                    ${files.length > 0 ? 'border-green-500 bg-green-500/5' : ''}`}
                >
                  <input {...getInputProps()} />
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  {files.length > 0 ? (
                    <div>
                      <p className="font-medium">{files[0].name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(files[0].size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">Drag & drop CSV file</p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse
                      </p>
                    </div>
                  )}
                </div>

                {preview.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Property Preview</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="default" className="bg-green-500">
                          {validCount} Valid
                        </Badge>
                        <Badge variant="secondary" className="bg-yellow-500">
                          {warningCount} Warnings
                        </Badge>
                        <Badge variant="destructive">
                          {errorCount} Errors
                        </Badge>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="text-left p-3">Address</th>
                            <th className="text-left p-3">City</th>
                            <th className="text-left p-3">State</th>
                            <th className="text-right p-3">Price</th>
                            <th className="text-left p-3">Agent</th>
                            <th className="text-center p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.map((row, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="p-3">{row.address}</td>
                              <td className="p-3">{row.city}</td>
                              <td className="p-3">{row.state}</td>
                              <td className="p-3 text-right">
                                {row.price ? `$${parseFloat(row.price).toLocaleString()}` : '-'}
                              </td>
                              <td className="p-3 truncate max-w-[150px]">
                                {row.agent_name || '-'}
                              </td>
                              <td className="p-3 text-center">
                                {row.status === 'valid' && <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />}
                                {row.status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500 mx-auto" />}
                                {row.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500 mx-auto" />}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <Button variant="outline" onClick={() => { setFiles([]); setPreview([]) }}>
                        <Trash2 className="w-4 h-4 mr-2" /> Clear
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => parseCSV(files[0])}>
                          <RefreshCw className="w-4 h-4 mr-2" /> Re-parse
                        </Button>
                        <Button onClick={() => uploadMutation.mutate()} disabled={processing || validCount === 0}>
                          {processing ? <><Progress value={progress} className="w-20 h-2 mr-2" /> Processing...</> : <><Database className="w-4 h-4 mr-2" /> Process {validCount} Properties</>}
                        </Button>
                      </div>
                    </div>

                    {processing && (
                      <div className="mt-4">
                        <Progress value={progress} />
                        <p className="text-sm text-muted-foreground mt-1">
                          {progress < 50 ? 'Parsing and validating...' : progress < 80 ? 'Processing properties...' : 'Almost done...'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Recent Imports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Recent Imports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {datasets?.map((dataset: Dataset) => (
                    <div 
                      key={dataset.id} 
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer hover:border-primary/50"
                      onClick={() => navigate(`/heist-mission/${dataset.dataset_id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {editingId === dataset.id ? (
                          <div className="flex items-center gap-1 flex-1">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-7 text-sm"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === 'Enter') saveRename(dataset.id); if (e.key === 'Escape') cancelRename() }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); saveRename(dataset.id) }} className="h-7 w-7 p-0"><Save className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); cancelRename() }} className="h-7 w-7 p-0"><X className="w-3 h-3" /></Button>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium text-sm flex items-center gap-2">
                              <Database className="w-4 h-4 text-primary" />
                              {dataset.name || 'Untitled'}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => { e.stopPropagation(); handleRename(dataset) }} 
                              className="h-7 w-7 p-0"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {dataset.total_properties} properties
                        {dataset.processed_properties && <> • {dataset.processed_properties} processed</>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(dataset.created_at).toLocaleDateString()}
                        <span className="ml-2 text-primary">Click to view →</span>
                      </div>
                    </div>
                  ))}

                  {(!datasets || datasets.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No recent imports
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Processing Pipeline - Clickable */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5" />
                  Processing Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {PIPELINE_AGENTS.map((agent, index) => {
                    const Icon = agent.icon
                    return (
                      <div
                        key={agent.id}
                        onClick={() => handleAgentClick(agent)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${agent.bgColor} ${agent.borderColor}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${agent.bgColor}`}>
                            <Icon className={`w-5 h-5 ${agent.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium text-sm ${agent.color}`}>
                              {agent.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {agent.tagline}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to parse CSV line
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}