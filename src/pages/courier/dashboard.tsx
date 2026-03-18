import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Truck, Package, Users, DollarSign, Activity, 
  MapPin, Clock, CheckCircle, AlertCircle, 
  TrendingUp, RefreshCw, Play, Pause, Eye, Building2
} from 'lucide-react';

interface Stats {
  totalDrivers: number;
  availableDrivers: number;
  totalShippers: number;
  activeContracts: number;
  activeDeliveries: number;
  completedDeliveries: number;
  dailyRevenue: number;
  monthlyRevenue: number;
}

interface Contract {
  id: string;
  source_platform: string;
  contract_type: string;
  rate_amount: number;
  rate_type: string;
  vehicle_required: string;
  location_city: string;
  location_state: string;
  description: string;
  status: string;
  score: number;
  created_at: string;
}

interface Driver {
  id: string;
  name: string;
  vehicle_type: string;
  status: string;
  rating: number;
  total_deliveries: number;
}

interface AILog {
  id: string;
  agent_name: string;
  action: string;
  target_platform: string;
  status: string;
  started_at: string;
}

export default function CourierDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalDrivers: 0,
    availableDrivers: 0,
    totalShippers: 0,
    activeContracts: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
    dailyRevenue: 0,
    monthlyRevenue: 0,
  });
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [aiLogs, setAiLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: driversData } = await supabase
        .from('courier_drivers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (driversData) {
        setDrivers(driversData);
        setStats(prev => ({
          ...prev,
          totalDrivers: driversData.length,
          availableDrivers: driversData.filter(d => d.status === 'available').length,
        }));
      }

      const { data: contractsData } = await supabase
        .from('courier_contracts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (contractsData) {
        setContracts(contractsData);
        setStats(prev => ({
          ...prev,
          activeContracts: contractsData.filter(c => c.status === 'new' || c.status === 'active').length,
        }));
      }

      const { count: shippersCount } = await supabase
        .from('courier_shippers')
        .select('*', { count: 'exact', head: true });
      
      if (shippersCount !== null) {
        setStats(prev => ({ ...prev, totalShippers: shippersCount }));
      }

      const { data: aiLogsData } = await supabase
        .from('courier_ai_agent_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(5);
      
      if (aiLogsData) {
        setAiLogs(aiLogsData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car': return '🏎';
      case 'sprinter': return '🚐';
      case 'box_truck': return '📦';
      case 'semi': return '🚛';
      default: return '🚗';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'on_delivery': return 'bg-blue-500';
      case 'waiting': return 'bg-yellow-500';
      case 'off_duty': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'indeed': return '🔍';
      case 'google jobs': return '📋';
      case 'doordash': return '🍔';
      case 'uber': return '🚗';
      default: return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900/80 to-cyan-900/80 border-b border-cyan-500/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-black tracking-wider">
                GTA6 <span className="text-cyan-400">COURIER</span>
              </h1>
              <p className="text-xs text-cyan-300/70">NETWORK COMMAND CENTER</p>
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
              onClick={() => navigate('/mission-briefing')}
              variant="outline"
              size="sm"
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
            >
              ← Real Estate
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900/80 border-cyan-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Drivers</p>
                  <p className="text-3xl font-bold text-cyan-400">{stats.availableDrivers}</p>
                  <p className="text-xs text-gray-500">of {stats.totalDrivers} total</p>
                </div>
                <Users className="w-10 h-10 text-cyan-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Contracts</p>
                  <p className="text-3xl font-bold text-purple-400">{stats.activeContracts}</p>
                  <p className="text-xs text-gray-500">Available jobs</p>
                </div>
                <Package className="w-10 h-10 text-purple-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Shippers</p>
                  <p className="text-3xl font-bold text-green-400">{stats.totalShippers}</p>
                  <p className="text-xs text-gray-500">businesses</p>
                </div>
                <Building2 className="w-10 h-10 text-green-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-yellow-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    ${stats.monthlyRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">projected</p>
                </div>
                <DollarSign className="w-10 h-10 text-yellow-400/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - AI Agents & Contracts */}
          <div className="space-y-6">
            {/* AI Agent Status */}
            <Card className="bg-gray-900/80 border-cyan-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  🤖 AI Agent Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiLogs.length > 0 ? (
                  aiLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🤖</span>
                        <div>
                          <p className="text-white text-sm font-medium">{log.agent_name}</p>
                          <p className="text-gray-400 text-xs">{log.action} • {log.target_platform}</p>
                        </div>
                      </div>
                      <Badge variant={log.status === 'completed' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}
                        className={log.status === 'completed' ? 'bg-green-500' : ''}>
                        {log.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No AI agent activity yet</p>
                    <Button size="sm" className="mt-3 bg-cyan-600 hover:bg-cyan-500" onClick={() => navigate('/courier/ai-agents')}>
                      <Play className="w-4 h-4 mr-1" /> Start Agent
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Contracts */}
            <Card className="bg-gray-900/80 border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-400" />
                  New Contracts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {contracts.slice(0, 5).map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getPlatformIcon(contract.source_platform)}</span>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {contract.rate_amount ? `$${contract.rate_amount}` : 'TBD'} {contract.rate_type}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {contract.location_city}, {contract.location_state} • {getVehicleIcon(contract.vehicle_required)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-purple-500/50 text-purple-400">{contract.score}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Driver Status */}
          <div className="space-y-6">
            <Card className="bg-gray-900/80 border-cyan-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Driver Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Vehicle Type Filters */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20">
                    🏎 Car ({drivers.filter(d => d.vehicle_type === 'car').length})
                  </Button>
                  <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20">
                    🚐 Sprinter ({drivers.filter(d => d.vehicle_type === 'sprinter').length})
                  </Button>
                  <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20">
                    📦 Box Truck ({drivers.filter(d => d.vehicle_type === 'box_truck').length})
                  </Button>
                  <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20">
                    🚛 Semi ({drivers.filter(d => d.vehicle_type === 'semi').length})
                  </Button>
                </div>

                {/* Driver List */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {drivers.length > 0 ? (
                    drivers.map((driver) => (
                      <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(driver.status)}`} />
                          <div>
                            <p className="text-white text-sm font-medium">{driver.name}</p>
                            <p className="text-gray-400 text-xs">
                              {getVehicleIcon(driver.vehicle_type)} {driver.vehicle_type} • {driver.total_deliveries} deliveries
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 text-sm">★ {driver.rating}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No drivers yet</p>
                      <Button size="sm" className="mt-3 bg-cyan-600 hover:bg-cyan-500" onClick={() => navigate('/courier/login')}>
                        Invite Drivers
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-900/80 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button className="bg-purple-600 hover:bg-purple-500" onClick={() => navigate('/courier/contracts')}>
                  <Eye className="w-4 h-4 mr-1" /> View Contracts
                </Button>
                <Button className="bg-cyan-600 hover:bg-cyan-500" onClick={() => navigate('/courier/shippers')}>
                  <Users className="w-4 h-4 mr-1" /> Shippers
                </Button>
                <Button className="bg-green-600 hover:bg-green-500" onClick={() => navigate('/courier/drivers')}>
                  <Truck className="w-4 h-4 mr-1" /> Drivers
                </Button>
                <Button className="bg-yellow-600 hover:bg-yellow-500" onClick={() => navigate('/courier/ai-agents')}>
                  <Activity className="w-4 h-4 mr-1" /> AI Agents
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Live Map Placeholder & Revenue */}
          <div className="space-y-6">
            <Card className="bg-gray-900/80 border-cyan-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  Live Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-800/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Live tracking map</p>
                    <p className="text-xs">Coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Panel */}
            <Card className="bg-gray-900/80 border-yellow-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  Revenue Command
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Daily Revenue</span>
                  <span className="text-green-400 font-bold">${stats.dailyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Monthly</span>
                  <span className="text-yellow-400 font-bold">${stats.monthlyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-cyan-400 font-bold">{stats.completedDeliveries}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}