import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Activity, Play, Pause, Trash2, Plus, 
  Bot, Globe, UserPlus, FileText, RefreshCw,
  CheckCircle, XCircle, Clock, AlertTriangle
} from 'lucide-react';

interface AILog {
  id: string;
  agent_name: string;
  action: string;
  target_platform: string;
  status: string;
  output: any;
  error_message: string;
  started_at: string;
  completed_at: string;
}

interface Platform {
  id: string;
  platform_name: string;
  status: string;
  last_used: string;
}

const PLATFORM_OPTIONS = [
  { name: 'Indeed', icon: '🔍', description: 'Job postings & contracts' },
  { name: 'Google Jobs', icon: '📋', description: 'Google job aggregator' },
  { name: 'DoorDash', icon: '🍔', description: 'Delivery gig platform' },
  { name: 'Uber', icon: '🚗', description: 'Rideshare & delivery' },
  { name: 'Instacart', icon: '🛒', description: 'Grocery delivery' },
  { name: 'Postmates', icon: '📦', description: 'Local delivery' },
  { name: 'Grubhub', icon: '🍕', description: 'Food delivery' },
  { name: 'Amazon Flex', icon: '📦', description: 'Amazon delivery' },
  { name: 'FedEx', icon: '🚛', description: 'Commercial contracts' },
  { name: 'UPS', icon: '📦', description: 'Delivery contracts' },
];

export default function AIAgentsPage() {
  const navigate = useNavigate();
  const [aiLogs, setAiLogs] = useState<AILog[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [agentRunning, setAgentRunning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: logsData } = await supabase
        .from('courier_ai_agent_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);

      if (logsData) {
        setAiLogs(logsData);
      }

      const { data: platformsData } = await supabase
        .from('courier_platform_credentials')
        .select('*')
        .order('platform_name');

      if (platformsData) {
        setPlatforms(platformsData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAgent = async () => {
    if (!selectedPlatform) return;
    
    setAgentRunning(true);
    
    // Create log entry
    const { data: log } = await supabase
      .from('courier_ai_agent_logs')
      .insert({
        agent_name: 'WealthanaireManus',
        action: `Creating account on ${selectedPlatform}`,
        target_platform: selectedPlatform,
        status: 'running',
      })
      .select()
      .single();

    if (log) {
      // Simulate agent running
      setTimeout(async () => {
        await supabase
          .from('courier_ai_agent_logs')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', log.id);
        
        // Save platform credentials
        await supabase
          .from('courier_platform_credentials')
          .insert({
            platform_name: selectedPlatform,
            status: 'active',
            last_used: new Date().toISOString(),
          });

        setAgentRunning(false);
        fetchData();
      }, 5000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900/80 to-cyan-900/80 border-b border-cyan-500/30 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-black tracking-wider">
                GTA6 <span className="text-cyan-400">AI AGENTS</span>
              </h1>
              <p className="text-xs text-cyan-300/70">AUTOMATED ACCOUNT CREATION</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={fetchData}
              variant="outline"
              size="sm"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => navigate('/courier-dashboard')}
              variant="outline"
              size="sm"
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
            >
              ← Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Agent Control */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-cyan-500/30 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-cyan-400" />
              🤖 WealthanaireManus Agent Controller
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-gray-400 text-sm mb-2 block">Select Platform</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  disabled={agentRunning}
                >
                  <option value="">Choose a platform...</option>
                  {PLATFORM_OPTIONS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.icon} {p.name} - {p.description}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                className="bg-cyan-600 hover:bg-cyan-500 px-8"
                onClick={startAgent}
                disabled={!selectedPlatform || agentRunning}
              >
                {agentRunning ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Agent
                  </>
                )}
              </Button>
            </div>
            
            {agentRunning && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-yellow-500 animate-pulse" />
                  <div>
                    <p className="text-yellow-400 font-medium">Agent is running...</p>
                    <p className="text-gray-400 text-sm">
                      Creating account on {selectedPlatform}. This may take a few minutes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-900/80 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Runs</p>
                  <p className="text-2xl font-bold text-cyan-400">{aiLogs.length}</p>
                </div>
                <Activity className="w-8 h-8 text-cyan-400/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/80 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-green-400">
                    {aiLogs.filter(l => l.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/80 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Failed</p>
                  <p className="text-2xl font-bold text-red-400">
                    {aiLogs.filter(l => l.status === 'failed').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-400/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/80 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Platforms Active</p>
                  <p className="text-2xl font-bold text-purple-400">{platforms.length}</p>
                </div>
                <Globe className="w-8 h-8 text-purple-400/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Log */}
          <Card className="bg-gray-900/80 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-lg text-white">Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {aiLogs.length > 0 ? (
                aiLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="text-white text-sm">{log.action}</p>
                        <p className="text-gray-400 text-xs">
                          {log.target_platform} • {new Date(log.started_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={log.status === 'completed' ? 'bg-green-500' : 
                                    log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}>
                      {log.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No agent activity yet</p>
                  <p className="text-sm">Start an agent to see activity here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform Status */}
          <Card className="bg-gray-900/80 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" />
                Platform Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {PLATFORM_OPTIONS.map((platform) => {
                const cred = platforms.find(p => p.platform_name === platform.name);
                return (
                  <div key={platform.name} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{platform.name}</p>
                        <p className="text-gray-400 text-xs">{platform.description}</p>
                      </div>
                    </div>
                    {cred ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-600 text-gray-400">Not Setup</Badge>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <Card className="bg-blue-900/20 border-blue-500/30 mt-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-400 font-medium">How the AI Agent Works</p>
                <p className="text-gray-400 text-sm mt-1">
                  The WealthanaireManus agent uses browser automation to navigate to gig platforms, 
                  fill out registration forms, verify email addresses, and set up your driver accounts. 
                  This allows you to scale your operations without manual account creation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
