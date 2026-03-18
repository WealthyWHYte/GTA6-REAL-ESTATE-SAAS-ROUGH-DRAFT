import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Truck, Package, MapPin, Clock, CheckCircle, 
  DollarSign, Building2, Plus, Navigation, 
  Phone, Mail, LogOut, PackageCheck
} from 'lucide-react';

interface Delivery {
  id: string;
  pickup_address: string;
  pickup_city: string;
  pickup_state: string;
  pickup_zip: string;
  dropoff_address: string;
  dropoff_city: string;
  dropoff_state: string;
  dropoff_zip: string;
  status: string;
  rate_amount: number;
  created_at: string;
  completed_at: string;
}

interface Shipper {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  account_type: string;
  balance: number;
}

interface NewDelivery {
  pickup_address: string;
  pickup_city: string;
  pickup_state: string;
  pickup_zip: string;
  dropoff_address: string;
  dropoff_city: string;
  dropoff_state: string;
  dropoff_zip: string;
  notes: string;
  rate_offer: number;
}

export default function ShipperPortalPage() {
  const navigate = useNavigate();
  const [shipper, setShipper] = useState<Shipper | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDelivery, setShowNewDelivery] = useState(false);
  const [newDelivery, setNewDelivery] = useState<NewDelivery>({
    pickup_address: '',
    pickup_city: '',
    pickup_state: '',
    pickup_zip: '',
    dropoff_address: '',
    dropoff_city: '',
    dropoff_state: '',
    dropoff_zip: '',
    notes: '',
    rate_offer: 0,
  });

  useEffect(() => {
    fetchShipperData();
  }, []);

  const fetchShipperData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/courier/login');
        return;
      }

      const { data: shipperData } = await supabase
        .from('courier_shippers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (shipperData) {
        setShipper(shipperData);

        const { data: deliveriesData } = await supabase
          .from('courier_deliveries')
          .select('*')
          .eq('shipper_id', shipperData.id)
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

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipper) return;

    try {
      const { error } = await supabase
        .from('courier_deliveries')
        .insert({
          shipper_id: shipper.id,
          pickup_address: newDelivery.pickup_address,
          pickup_city: newDelivery.pickup_city,
          pickup_state: newDelivery.pickup_state,
          pickup_zip: newDelivery.pickup_zip,
          dropoff_address: newDelivery.dropoff_address,
          dropoff_city: newDelivery.dropoff_city,
          dropoff_state: newDelivery.dropoff_state,
          dropoff_zip: newDelivery.dropoff_zip,
          notes: newDelivery.notes,
          rate_amount: newDelivery.rate_offer,
          status: 'assigned',
        });

      if (error) throw error;

      setShowNewDelivery(false);
      setNewDelivery({
        pickup_address: '',
        pickup_city: '',
        pickup_state: '',
        pickup_zip: '',
        dropoff_address: '',
        dropoff_city: '',
        dropoff_state: '',
        dropoff_zip: '',
        notes: '',
        rate_offer: 0,
      });
      fetchShipperData();
    } catch (error) {
      console.error('Error creating delivery:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned': return <Badge className="bg-blue-500">Assigned</Badge>;
      case 'pickup_confirmed': return <Badge className="bg-yellow-500">Pickup Confirmed</Badge>;
      case 'in_transit': return <Badge className="bg-purple-500">In Transit</Badge>;
      case 'delivered': return <Badge className="bg-cyan-500">Delivered</Badge>;
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
      case 'cancelled': return <Badge className="bg-red-500">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

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
            <Building2 className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-xl font-black tracking-wider">
                SHIPPER <span className="text-cyan-400">PORTAL</span>
              </h1>
              <p className="text-xs text-cyan-300/70">{shipper?.company_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={shipper?.account_type === 'enterprise' ? 'bg-purple-500' : 'bg-cyan-500'}>
              {shipper?.account_type?.toUpperCase()}
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
        {/* New Delivery Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Your Shipments</h2>
          <Button
            className="bg-cyan-600 hover:bg-cyan-500"
            onClick={() => setShowNewDelivery(!showNewDelivery)}
          >
            <Plus className="w-4 h-4 mr-1" /> New Shipment
          </Button>
        </div>

        {/* New Delivery Form */}
        {showNewDelivery && (
          <Card className="bg-gray-900/80 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-lg text-white">Create New Shipment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDelivery} className="space-y-4">
                {/* Pickup */}
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-medium">Pickup Location</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Address"
                      value={newDelivery.pickup_address}
                      onChange={(e) => setNewDelivery({...newDelivery, pickup_address: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                    <Input
                      placeholder="City"
                      value={newDelivery.pickup_city}
                      onChange={(e) => setNewDelivery({...newDelivery, pickup_city: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="State"
                      value={newDelivery.pickup_state}
                      onChange={(e) => setNewDelivery({...newDelivery, pickup_state: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                    <Input
                      placeholder="ZIP"
                      value={newDelivery.pickup_zip}
                      onChange={(e) => setNewDelivery({...newDelivery, pickup_zip: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                {/* Dropoff */}
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-medium">Drop-off Location</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Address"
                      value={newDelivery.dropoff_address}
                      onChange={(e) => setNewDelivery({...newDelivery, dropoff_address: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                    <Input
                      placeholder="City"
                      value={newDelivery.dropoff_city}
                      onChange={(e) => setNewDelivery({...newDelivery, dropoff_city: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="State"
                      value={newDelivery.dropoff_state}
                      onChange={(e) => setNewDelivery({...newDelivery, dropoff_state: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                    <Input
                      placeholder="ZIP"
                      value={newDelivery.dropoff_zip}
                      onChange={(e) => setNewDelivery({...newDelivery, dropoff_zip: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                {/* Rate & Notes */}
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Your offer ($)"
                    value={newDelivery.rate_offer}
                    onChange={(e) => setNewDelivery({...newDelivery, rate_offer: parseFloat(e.target.value)})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                  <Textarea
                    placeholder="Notes (package details, special instructions...)"
                    value={newDelivery.notes}
                    onChange={(e) => setNewDelivery({...newDelivery, notes: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500 flex-1">
                    Submit Shipment
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewDelivery(false)}
                    className="border-gray-600 text-gray-400"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Active Shipments */}
        {deliveries.filter(d => d.status !== 'completed' && d.status !== 'cancelled').length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Active Shipments</h3>
            {deliveries.filter(d => d.status !== 'completed' && d.status !== 'cancelled').map((delivery) => (
              <Card key={delivery.id} className="bg-gray-900/80 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-medium">
                        {delivery.pickup_city}, {delivery.pickup_state} → {delivery.dropoff_city}, {delivery.dropoff_state}
                      </p>
                      <p className="text-gray-400 text-sm">{delivery.pickup_address} → {delivery.dropoff_address}</p>
                    </div>
                    {getStatusBadge(delivery.status)}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-cyan-400 font-bold">${delivery.rate_amount}</p>
                    <p className="text-gray-500 text-xs">
                      Created {new Date(delivery.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Completed Shipments */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white">History</h3>
          {deliveries.filter(d => d.status === 'completed').length > 0 ? (
            deliveries.filter(d => d.status === 'completed').map((delivery) => (
              <Card key={delivery.id} className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white">
                        {delivery.pickup_city}, {delivery.pickup_state} → {delivery.dropoff_city}, {delivery.dropoff_state}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Completed {delivery.completed_at ? new Date(delivery.completed_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Badge className="bg-green-500">${delivery.rate_amount}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="py-8 text-center">
                <PackageCheck className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                <p className="text-gray-500">No completed shipments yet</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Info */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Need help?</p>
                <p className="text-white">Contact GTA6 Courier Support</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-cyan-500/50 text-cyan-400">
                  <Mail className="w-4 h-4 mr-1" /> Email
                </Button>
                <Button variant="outline" size="sm" className="border-cyan-500/50 text-cyan-400">
                  <Phone className="w-4 h-4 mr-1" /> Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
