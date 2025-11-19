import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgentStatus {
  id: string;
  name: string;
  progress: number;
  status: 'overload' | 'active' | 'standby' | 'idle';
  activity: string;
  route: string;
}

export default function IntensityMeter() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: 'pipeline-scout',
      name: 'PIPELINE SCOUT',
      progress: 95,
      status: 'overload',
      activity: 'Processing Miami Beach comps',
      route: '/agent/pipeline-scout'
    },
    {
      id: 'market-researcher',
      name: 'MARKET RESEARCHER',
      progress: 42,
      status: 'active',
      activity: 'Analyzing Miami Beach data',
      route: '/agent/market-researcher'
    },
    {
      id: 'underwriter',
      name: 'UNDERWRITER',
      progress: 18,
      status: 'standby',
      activity: 'Awaiting research completion',
      route: '/agent/underwriter'
    },
    {
      id: 'offer-generator',
      name: 'OFFER GENERATOR',
      progress: 0,
      status: 'idle',
      activity: 'Ready for deployment',
      route: '/agent/offer-generator'
    }
  ]);

  const [activityFeed, setActivityFeed] = useState([
    { time: '2s ago', message: 'Pipeline Scout processed 23 properties', color: 'text-vice-cyan' },
    { time: '8s ago', message: 'Market Researcher fetched 5 comps for 456 Palm Ave', color: 'text-vice-cyan' },
    { time: '12s ago', message: 'Underwriter scored 123 Ocean Dr as 4.2/5', color: 'text-vice-yellow' },
    { time: '15s ago', message: 'Offer sent to agent@realty.com', color: 'text-vice-green' }
  ]);

  const [systemMetrics, setSystemMetrics] = useState({
    temperature: 73,
    apiCalls: 847,
    processingSpeed: 2.3
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        progress: Math.min(100, agent.progress + Math.random() * 5 - 2.5)
      })));

      // Add random activity
      if (Math.random() > 0.7) {
        const activities = [
          'Pipeline Scout found new property target',
          'Market Researcher completed analysis',
          'Underwriter updated deal score',
          'Offer Generator created new proposal'
        ];
        const newActivity = {
          time: 'just now',
          message: activities[Math.floor(Math.random() * activities.length)],
          color: 'text-vice-cyan'
        };
        setActivityFeed(prev => [newActivity, ...prev.slice(0, 9)]);
      }

      // Update system metrics
      setSystemMetrics(prev => ({
        temperature: Math.max(45, Math.min(85, prev.temperature + (Math.random() - 0.5) * 2)),
        apiCalls: prev.apiCalls + Math.floor(Math.random() * 3),
        processingSpeed: Math.max(1.5, Math.min(4.0, prev.processingSpeed + (Math.random() - 0.5) * 0.2))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overload': return 'text-red-400';
      case 'active': return 'text-yellow-400';
      case 'standby': return 'text-green-400';
      case 'idle': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overload': return '🔴';
      case 'active': return '🟡';
      case 'standby': return '🟢';
      case 'idle': return '⚫';
      default: return '⚫';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'overload': return 'bg-red-500';
      case 'active': return 'bg-yellow-500';
      case 'standby': return 'bg-green-500';
      case 'idle': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="mission-card mb-8">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-gta text-vice-pink">
          🔥 AI INTENSITY METER
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Agent Progress Bars */}
          <div className="space-y-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="cursor-pointer hover:bg-muted/50 p-3 rounded-lg transition-all duration-300"
                onClick={() => navigate(agent.route)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-gta text-sm text-vice-cyan">{agent.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{getStatusIcon(agent.status)}</span>
                    <span className={`text-xs font-bold ${getStatusColor(agent.status)}`}>
                      {agent.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <Progress
                    value={agent.progress}
                    className="h-3 mb-1"
                  />
                  <div
                    className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-1000 ${getProgressColor(agent.status)}`}
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{agent.activity}</span>
                  <span>{Math.round(agent.progress)}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* System Metrics & Activity Feed */}
          <div className="space-y-4">
            {/* System Health */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-gta text-vice-cyan mb-3">SYSTEM HEALTH</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>SYSTEM TEMP:</span>
                  <span className={`font-mono ${systemMetrics.temperature > 60 ? 'text-red-400' : 'text-green-400'}`}>
                    🌡️ {systemMetrics.temperature}°C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>API CALLS:</span>
                  <span className="font-mono text-vice-cyan">
                    {systemMetrics.apiCalls}/1000 remaining
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>PROCESSING SPEED:</span>
                  <span className="font-mono text-vice-green">
                    ⚡ {systemMetrics.processingSpeed.toFixed(1)}s avg
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-gta text-vice-orange mb-3">REAL-TIME ACTIVITY FEED</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activityFeed.map((activity, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <span className="text-muted-foreground min-w-[4rem]">{activity.time}</span>
                    <span className={activity.color}>{activity.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
