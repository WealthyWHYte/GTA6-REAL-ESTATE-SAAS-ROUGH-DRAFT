// Knowledge Base Page
// Central hub for all strategy documents and guides

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { KNOWLEDGE_BASE } from '@/data/knowledge-base'
import { 
  BookOpen, 
  Target, 
  FileText, 
  Search, 
  ArrowLeft,
  DollarSign,
  Home,
  PenTool,
  FileSignature,
  Users,
  Scale,
  Bot,
  BarChart3,
  Shield,
  Award,
  Scroll,
  Calculator,
  Building,
  Wallet,
  Handshake,
  CreditCard,
  RefreshCw,
  Heart,
  Brain,
  MessageSquare,
  FileCheck,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Zap,
  Download,
  Mail,
  ExternalLink
} from 'lucide-react'

// Strategy icons mapping
const strategyIcons: Record<string, any> = {
  all_cash: DollarSign,
  seller_financing: Building,
  lease_option: PenTool,
  subject_to: FileSignature,
  assignment: FileText,
  hard_money: CreditCard,
  private_money: Handshake,
  wrap_around: RefreshCw,
  joint_venture: Heart
}

// Document icons mapping
const docIcons: Record<string, any> = {
  seller_scripts: MessageSquare,
  email_templates: FileText,
  deal_calculator: Calculator,
  agent_psychology: Brain,
  legal_due_diligence: Scale,
  ai_prompts: Bot,
  market_deep_dive: BarChart3,
  objection_handling: Shield,
  negotiation_flows: Zap,
  property_scoring: Award,
  contract_terms: Scroll
}

export default function KnowledgeBasePage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  // Filter strategies and documents by search
  const filteredStrategies = KNOWLEDGE_BASE.strategies.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredDocuments = KNOWLEDGE_BASE.documents.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle strategy click
  const handleStrategyClick = (strategy: any) => {
    setSelectedItem(strategy)
    setShowModal(true)
  }

  // Handle document click  
  const handleDocumentClick = (doc: any) => {
    setSelectedItem(doc)
    setShowModal(true)
  }

  // Open external doc file
  const openDocFile = (docFile: string) => {
    const path = `/docs/${docFile}`
    window.open(path, '_blank')
  }

  // Send doc to email
  const sendToEmail = (docFile: string, docName: string) => {
    const subject = encodeURIComponent(`GTA 6 - ${docName}`)
    const body = encodeURIComponent(`Please find attached: ${docName}\n\nFrom GTA 6 Real Estate Pipeline`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gta-blue flex items-center gap-3"> 
              <BookOpen className="w-8 h-8 text-blue-500" />
              Knowledge Base
            </h1>
            <p className="text-muted-foreground">
              Your brain - strategies, scripts, calculators, and guides
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search strategies and documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="strategies" className="space-y-6">
          <TabsList>
            <TabsTrigger value="strategies" className="gap-2">
              <Target className="w-4 h-4" />
              Creative Strategies
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="w-4 h-4" />
              Documents & Guides
            </TabsTrigger>
          </TabsList>

          {/* Creative Finance Strategies */}
          <TabsContent value="strategies">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStrategies.map((strategy) => {
                const Icon = strategyIcons[strategy.id] || Target
                return (
                  <Card 
                    key={strategy.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary/50"
                    onClick={() => handleStrategyClick(strategy)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="text-4xl">{strategy.icon}</div>
                        <Badge variant="outline" className="text-xs">
                          Strategy
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{strategy.name}</CardTitle>
                      <CardDescription>{strategy.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Documents & Guides */}
          <TabsContent value="documents">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => {
                const Icon = docIcons[doc.id] || FileText
                return (
                  <Card 
                    key={doc.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary/50"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Guide
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{doc.name}</CardTitle>
                      <CardDescription>{doc.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Open Document
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal for Strategy/Document Details */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedItem?.icon && <span className="text-3xl">{selectedItem.icon}</span>}
              {selectedItem?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Strategy/Doc Info */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">
                {selectedItem?.type === 'document' ? 'Document Details' : 'Strategy Overview'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {selectedItem?.fullDescription || selectedItem?.description}
              </p>
              {selectedItem?.keyPoints && (
                <ul className="mt-3 space-y-1">
                  {selectedItem.keyPoints.map((point: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Action Buttons */}
            {selectedItem?.docFile && (
              <div className="flex gap-3">
                <Button 
                  variant="default" 
                  className="flex-1 gap-2"
                  onClick={() => openDocFile(selectedItem.docFile)}
                >
                  <Download className="w-4 h-4" />
                  Download Doc
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={() => sendToEmail(selectedItem.docFile, selectedItem.name)}
                >
                  <Mail className="w-4 h-4" />
                  Send to Email
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
