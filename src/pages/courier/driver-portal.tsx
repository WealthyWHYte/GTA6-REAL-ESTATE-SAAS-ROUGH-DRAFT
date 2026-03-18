import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Truck, Package, MapPin, Clock, CheckCircle, 
  Play, Mic, Camera, MessageSquare, DollarSign, 
  Navigation, Phone, LogOut
} from 'lucide-react';

interface Delivery {
  id: string;
  pickup_address: string;
  pickup_city: string;
  pickup_state: string;
  dropoff_address: string;
  dropoff_city: string;
  dropoff_state: string;
  status: string;
  rate_amount: number;
  created_at: string;
  milestone_history: any[];
}

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  status: string;
  rating: number;
  total_deliveries: number;
}

export default function DriverPortalPage() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [voiceInput, setVoiceInput] = useState('');

  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/courier/login');
        return;
      }

      // Fetch driver profile
      const { data: driverData } = await supabase
        .from('courier_drivers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (driverData) {
        setDriver(driverData);

        // Fetch deliveries
        const { data: deliveriesData } = await supabase
          .from('courier_deliveries')
          .select('*')
          .eq('driver_id', driverData.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (deliveriesData) {
          setDeliveries(deliveriesData);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDriverStatus = async (newStatus: string) => {
    if (!driver) return;
    
    const { error } = await supabase
      .from('courier_drivers')
      .update({ status: newStatus })
      .eq('id', driver.id);

    if (!error) {
      setDriver({ ...driver, status: newStatus });
    }
  };

  const updateDeliveryStatus = async (deliveryId: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    
    if (newStatus === 'in_transit') {
      updates.started_at = new Date().toISOString();
    } else if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('courier_deliveries')
      .update(updates)
      .eq('id', deliveryId);

    if (!error) {
      fetchDriverData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-500';
      case 'pickup_confirmed': return 'bg-yellow-500';
      case 'in_transit': return 'bg-purple-500';
      case 'delivered': return 'bg-cyan-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const activeDelivery = deliveries.find(d => 
    d.status !== 'completed' && d.status !== 'cancelled'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900/80 to-cyan-900/80 border-b border-cyan-500/30 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-xl font-black tracking-wider">
                DRIVER <span className="text-cyan-400">PORTAL</span>
              </h1>
              <p className="text-xs text-cyan-300/70">{driver?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={driver?.status === 'available' ? 'bg-green-500' : 'bg-gray-500'}>
              {driver?.status?.toUpperCase()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
              onClick={() => supabase.auth.signOut().then(() => navigate('/courier/login'))}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Status Controls */}
        <Card className="bg-gray-900/80 border-cyan-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Your Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant={driver?.status === 'available' ? 'default' : 'outline'}
                className={driver?.status === 'available' ? 'bg-green-600' : 'border-green-500/50 text-green-400'}
                onClick={() => updateDriverStatus('available')}
              >
                <CheckCircle className="w-4 h-4 mr-1" /> Available
              </Button>
              <Button
                variant={driver?.status === 'on_delivery' ? 'default' : 'outline'}
                className={driver?.status === 'on_delivery' ? 'bg-blue-600' : 'border-blue-500/50 text-blue-400'}
                onClick={() => updateDriverStatus('on_delivery')}
              >
                <Truck className="w-4 h-4 mr-1" /> On Delivery
              </Button>
              <Button
                variant={driver?.status === 'waiting' ? 'default' : 'outline'}
                className={driver?.status === 'waiting' ? 'bg-yellow-600' : 'border-yellow-500/50 text-yellow-400'}
                onClick={() => updateDriverStatus('waiting')}
              >
                <Clock className="w-4 h-4 mr-1" /> Waiting
              </Button>
              <Button
                variant={driver?.status === 'off_duty' ? 'default' : 'outline'}
                className={driver?.status === 'off_duty' ? 'bg-gray-600' : 'border-gray-500/50 text-gray-400'}
                onClick={() => updateDriverStatus('off_duty')}
              >
                <LogOut className="w-4 h-4 mr-1" /> Off Duty
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Delivery */}
        {activeDelivery ? (
          <Card className="bg-gradient-to-br from-purple-900/50 to-cyan-900/50 border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-purple-400" />
                Active Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pickup */}
              <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">PICKUP</p>
                  <p className="text-white font-medium">{activeDelivery.pickup_address}</p>
                  <p className="text-gray-400 text-sm">{activeDelivery.pickup_city}, {activeDelivery.pickup_state}</p>
                </div>
              </div>

              {/* Dropoff */}
              <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5" />
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">DROP-OFF</p>
                  <p className="text-white font-medium">{activeDelivery.dropoff_address}</p>
                  <p className="text-gray-400 text-sm">{activeDelivery.dropoff_city}, {activeDelivery.dropoff_state}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                {activeDelivery.status === 'assigned' && (
                  <Button
                    className="bg-yellow-600 hover:bg-yellow-500 col-span-3"
                    onClick={() => updateDeliveryStatus(activeDelivery.id, 'pickup_confirmed')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Confirm Pickup
                  </Button>
                )}
                {activeDelivery.status === 'pickup_confirmed' && (
                  <Button
                    className="bg-purple-600 hover:bg-purple-500 col-span-3"
                    onClick={() => updateDeliveryStatus(activeDelivery.id, 'in_transit')}
                  >
                    <Truck className="w-4 h-4 mr-1" /> Start Transit
                  </Button>
                )}
                {activeDelivery.status === 'in_transit' && (
                  <Button
                    className="bg-cyan-600 hover:bg-cyan-500 col-span-3"
                    onClick={() => updateDeliveryStatus(activeDelivery.id, 'delivered')}
                  >
                    <MapPin className="w-4 h-4 mr-1" /> Confirm Delivery
                  </Button>
                )}
                {activeDelivery.status === 'delivered' && (
                  <Button
                    className="bg-green-600 hover:bg-green-500 col-span-3"
                    onClick={() => updateDeliveryStatus(activeDelivery.id, 'completed')}
                  >
                    <DollarSign className="w-4 h-4 mr-1" /> Complete & Get Paid
                  </Button>
                )}
              </div>

              {/* Rate */}
              <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                <p className="text-gray-400 text-sm">Earnings</p>
                <p className="text-3xl font-bold text-green-400">${activeDelivery.rate_amount}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-900/80 border-gray-700">
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg">No active deliveries</p>
              <p className="text-gray-500 text-sm">Set yourself to Available to receive new missions</p>
            </CardContent>
          </Card>
        )}

        {/* Voice Update */}
        <Card className="bg-gray-900/80 border-cyan-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-cyan-400" />
              Voice Update
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Tap mic and speak your update..."
                value={voiceInput}
                onChange={(e) => setVoiceInput(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button className="bg-cyan-600 hover:bg-cyan-500">
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Voice-to-text coming soon. Use for milestone updates and issue reporting.
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gray-900/80 border-gray-700">
            <CardContent className="p-4 text-center">
              <p className="text-gray-400 text-sm">Total Deliveries</p>
              <p className="text-2xl font-bold text-cyan-400">{driver?.total_deliveries || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/80 border-gray-700">
            <CardContent className="p-4 text-center">
              <p className="text-gray-400 text-sm">Rating</p>
              <p className="text-2xl font-bold text-yellow-400">★ {driver?.rating || 5.0}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/80 border-gray-700">
            <CardContent className="p-4 text-center">
              <p className="text-gray-400 text-sm">Vehicle</p>
              <p className="text-2xl font-bold text-purple-400">
                {driver?.vehicle_type === 'car' ? '🏎' : 
                 driver?.vehicle_type === 'sprinter' ? '🚐' : 
                 driver?.vehicle_type === 'box_truck' ? '📦' : '🚛'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent History */}
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Recent Missions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {deliveries.filter(d => d.status === 'completed').slice(0, 5).map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-white text-sm">{delivery.pickup_city} → {delivery.dropoff_city}</p>
                  <p className="text-gray-400 text-xs">{new Date(delivery.completed_at).toLocaleDateString()}</p>
                </div>
                <Badge className="bg-green-500">+${delivery.rate_amount}</Badge>
              </div>
            ))}
            {deliveries.filter(d => d.status === 'completed').length === 0 && (
              <p className="text-gray-500 text-center py-4">No completed deliveries yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
