//src/pages/follow-up-queue.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mail,
  Phone,
  X,
  Bot,
  PhoneCall,
  BarChart3,
  Clock
} from "lucide-react";

interface FollowUpProperty {
  id: string;
  address: string;
  agentName: string;
  agentEmail: string;
  offerSentDate: string;
  lastContactDate: string;
  daysSinceContact: number;
  lastEmailSubject: string;
  status: 'urgent' | 'pending' | 'recent';
  priority: 'high' | 'medium' | 'low';
}

export default function FollowUpQueuePage() {
  const navigate = useNavigate();
  const [autoFollowEnabled, setAutoFollowEnabled] = useState(true);

  const [properties] = useState<FollowUpProperty[]>([
    {
      id: "1",
      address: "456 Palm Ave, Miami Beach",
      agentName: "John Smith",
      agentEmail: "john@realty.com",
      offerSentDate: "2025-01-10",
      lastContactDate: "2025-01-10",
      daysSinceContact: 7,
      lastEmailSubject: "Just checking in on our offer...",
      status: 'urgent',
      priority: 'high'
    },
    {
      id: "2",
      address: "789 Ocean Blvd, Fort Lauderdale",
      agentName: "Sarah Johnson",
      agentEmail: "sarah@coastal.com",
      offerSentDate: "2025-01-08",
      lastContactDate: "2025-01-12",
      daysSinceContact: 5,
      lastEmailSubject: "Following up on our proposal",
      status: 'pending',
      priority: 'medium'
    },
    {
      id: "3",
      address: "123 Beach St, Boca Raton",
      agentName: "Mike Davis",
      agentEmail: "mike@bocaraton.com",
      offerSentDate: "2025-01-14",
      lastContactDate: "2025-01-15",
      daysSinceContact: 2,
      lastEmailSubject: "Thank you for your time",
      status: 'recent',
      priority: 'low'
    },
    {
      id: "4",
      address: "234 Collins Ave, Miami Beach",
      agentName: "Lisa Chen",
      agentEmail: "lisa@miamirealestate.com",
      offerSentDate: "2025-01-05",
      lastContactDate: "2025-01-05",
      daysSinceContact: 12,
      lastEmailSubject: "Interest in your listing",
      status: 'urgent',
      priority: 'high'
    },
    {
      id: "5",
      address: "567 Washington Ave, Miami Beach",
      agentName: "Tom Wilson",
      agentEmail: "tom@wilsonproperties.com",
      offerSentDate: "2025-01-09",
      lastContactDate: "2025-01-13",
      daysSinceContact: 4,
      lastEmailSubject: "Any updates on our offer?",
      status: 'pending',
      priority: 'medium'
    }
  ]);

  const urgentCount = properties.filter(p => p.status === 'urgent').length;
  const pendingCount = properties.filter(p => p.status === 'pending').length;
  const recentCount = properties.filter(p => p.status === 'recent').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return 'text-red-400 border-red-400';
      case 'pending': return 'text-yellow-400 border-yellow-400';
      case 'recent': return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'urgent': return '🔴';
      case 'pending': return '🟡';
      case 'recent': return '🟢';
      default: return '⚫';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive" className="text-xs">HIGH</Badge>;
      case 'medium': return <Badge variant="outline" className="border-yellow-400 text-yellow-400 text-xs">MEDIUM</Badge>;
      case 'low': return <Badge variant="outline" className="border-green-400 text-green-400 text-xs">LOW</Badge>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/command-center")}
              className="border-vice-cyan text-vice-cyan hover:bg-vice-cyan hover:text-background"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              BACK TO COMMAND CENTER
            </Button>
            <div>
              <h1 className="text-4xl font-gta font-black text-transparent bg-gradient-neon bg-clip-text">
                FOLLOW-UP QUEUE
              </h1>
              <p className="text-vice-cyan font-body">Automated relationship management system</p>
            </div>
          </div>
        </div>

        {/* Auto-Follow Status */}
        <Card className="mission-card mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-vice-cyan" />
                <div>
                  <div className="font-gta text-vice-cyan">AUTOMATION STATUS</div>
                  <div className="text-sm text-muted-foreground">
                    {autoFollowEnabled ? '✅ Auto-follow enabled (every 48h)' : '❌ Auto-follow disabled'}
                  </div>
                </div>
              </div>
              <Button
                variant={autoFollowEnabled ? "neon-cyan" : "outline"}
                size="sm"
                onClick={() => setAutoFollowEnabled(!autoFollowEnabled)}
              >
                {autoFollowEnabled ? 'DISABLE' : 'ENABLE'} AUTO-FOLLOW
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="mission-card">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-gta text-red-400 mb-2">{urgentCount}</div>
              <div className="text-sm text-muted-foreground">URGENT</div>
              <div className="text-xs text-muted-foreground">No response in 7+ days</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-gta text-yellow-400 mb-2">{pendingCount}</div>
              <div className="text-sm text-muted-foreground">PENDING</div>
              <div className="text-xs text-muted-foreground">Last contacted 3-6 days ago</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-gta text-green-400 mb-2">{recentCount}</div>
              <div className="text-sm text-muted-foreground">RECENT</div>
              <div className="text-xs text-muted-foreground">Last contacted &lt;3 days ago</div>
            </CardContent>
          </Card>
        </div>

        {/* Properties List */}
        <div className="space-y-4 mb-8">
          {properties.map((property) => (
            <Card key={property.id} className="mission-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg">{getStatusIcon(property.status)}</span>
                      <h3 className="font-gta text-vice-cyan text-lg">{property.address}</h3>
                      {getPriorityBadge(property.priority)}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Agent:</div>
                        <div className="font-medium text-vice-cyan">{property.agentName}</div>
                        <div className="text-xs text-muted-foreground">{property.agentEmail}</div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Last Contact:</div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{property.lastContactDate}</span>
                          <span className={`text-sm font-medium ${property.daysSinceContact >= 7 ? 'text-red-400' : property.daysSinceContact >= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                            ({property.daysSinceContact} days ago)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/20 p-3 rounded-lg mb-4">
                      <div className="text-sm text-muted-foreground mb-1">Last Email:</div>
                      <div className="text-sm italic">"{property.lastEmailSubject}"</div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="neon-cyan" size="sm">
                        <Mail className="mr-2 w-4 h-4" />
                        SEND MANUAL FOLLOW-UP
                      </Button>
                      <Button variant="outline" size="sm" className="border-vice-orange text-vice-orange">
                        <PhoneCall className="mr-2 w-4 h-4" />
                        CALL AGENT
                      </Button>
                      <Button variant="outline" size="sm" className="border-red-400 text-red-400">
                        <X className="mr-2 w-4 h-4" />
                        WITHDRAW OFFER
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bulk Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="neon-pink" size="lg" className="px-8">
            <Bot className="mr-2 w-5 h-5" />
            AUTO-FOLLOW ALL ({properties.length})
          </Button>
          <Button variant="outline" size="lg" className="px-8 border-vice-cyan text-vice-cyan">
            <Phone className="mr-2 w-5 h-5" />
            CALL LIST ({urgentCount + pendingCount})
          </Button>
          <Button variant="outline" size="lg" className="px-8 border-vice-orange text-vice-orange">
            <BarChart3 className="mr-2 w-5 h-5" />
            RESPONSE ANALYTICS
          </Button>
        </div>
      </div>
    </div>
  );
}