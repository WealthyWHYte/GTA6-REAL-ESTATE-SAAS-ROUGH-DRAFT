import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AGENT_PERSONAS } from '@/lib/agent-personas';
import { runBatchSimulation, calculateStats, TrainingStats, SimulationResult } from '@/lib/training-engine';

export default function TrainingDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [results, setResults] = useState<SimulationResult[]>([]);

  const runTraining = async () => {
    setIsRunning(true);
    
    // Run 1000 simulations
    const simulationResults = runBatchSimulation(1000);
    const trainingStats = calculateStats(simulationResults);
    
    setResults(simulationResults);
    setStats(trainingStats);
    setIsRunning(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🧠 AI Training Center</h1>
          <p className="text-muted-foreground">
            Stress-test your AI against 10 different agent personas
          </p>
        </div>
        <Button onClick={runTraining} disabled={isRunning} size="lg">
          {isRunning ? '🔄 Training...' : '🚀 Run 1000 Simulations'}
        </Button>
      </div>

      {stats && (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{stats.totalSimulations}</div>
                  <div className="text-sm text-muted-foreground">Total Simulations</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600">{stats.avgDuration.toFixed(0)}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600">
                    {Object.keys(stats.byPersona).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Personas Tested</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success Rate Bar */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={stats.successRate} className="h-4" />
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-red-600">Failure: {(100 - stats.successRate).toFixed(1)}%</span>
                <span className="text-green-600">Success: {stats.successRate.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Persona Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>📊 Performance by Agent Persona</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.values(stats.byPersona)
                    .sort((a, b) => b.successRate - a.successRate)
                    .map((persona) => (
                      <div key={persona.name} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{persona.name}</span>
                          <span className="text-sm">
                            {persona.successRate.toFixed(0)}% ({persona.successes}/{persona.attempts})
                          </span>
                        </div>
                        <Progress 
                          value={persona.successRate} 
                          className="h-2"
                          style={{ 
                            backgroundColor: persona.successRate >= 70 ? '#22c55e' : persona.successRate >= 40 ? '#eab308' : '#ef4444'
                          }}
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Objection Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 Performance by Objection Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.byObjection)
                    .sort(([,a], [,b]) => b.successRate - a.successRate)
                    .map(([category, data]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between">
                          <Badge variant="outline">{category}</Badge>
                          <span className="text-sm">
                            {data.successRate.toFixed(0)}% ({data.successes}/{data.attempts})
                          </span>
                        </div>
                        <Progress 
                          value={data.successRate} 
                          className="h-2"
                          style={{ 
                            backgroundColor: data.successRate >= 70 ? '#22c55e' : data.successRate >= 40 ? '#eab308' : '#ef4444'
                          }}
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>💡 AI Training Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Object.values(stats.byPersona)
                  .filter(p => p.successRate < 40)
                  .map(p => (
                    <li key={p.name} className="text-red-700">
                      ⚠️ {p.name}: Only {p.successRate.toFixed(0)}% success - needs better response strategies
                    </li>
                  ))}
                {Object.values(stats.byPersona)
                  .filter(p => p.successRate >= 70)
                  .map(p => (
                    <li key={p.name} className="text-green-700">
                      ✅ {p.name}: {p.successRate.toFixed(0)}% success - AI handles well
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {!stats && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold mb-2">Ready to Train</h3>
            <p className="text-muted-foreground mb-4">
              Click the button above to run 1000 simulated conversations with different agent personas.
              <br />
              This will help identify weaknesses in your AI's negotiation strategies.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>You have {AGENT_PERSONAS.length} agent personas to test against:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {AGENT_PERSONAS.map(p => (
                  <Badge key={p.id} variant="secondary">{p.name}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
