import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, User, Building2, Mail, Phone, Lock, MapPin } from 'lucide-react';

export default function CourierLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Driver signup
  const [driverName, setDriverName] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverPassword, setDriverPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  
  // Shipper signup
  const [shipperCompany, setShipperCompany] = useState('');
  const [shipperName, setShipperName] = useState('');
  const [shipperEmail, setShipperEmail] = useState('');
  const [shipperPhone, setShipperPhone] = useState('');
  const [shipperPassword, setShipperPassword] = useState('');
  const [shipperCity, setShipperCity] = useState('');
  const [shipperState, setShipperState] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Check if user is driver or shipper and redirect
      navigate('/courier-dashboard');
    }
  };

  const handleDriverSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: driverEmail,
        password: driverPassword,
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');
      
      // Create driver record
      const { error: driverError } = await supabase
        .from('courier_drivers')
        .insert({
          user_id: authData.user.id,
          name: driverName,
          email: driverEmail,
          phone: driverPhone,
          vehicle_type: vehicleType,
          status: 'available',
        });
      
      if (driverError) throw driverError;
      
      navigate('/courier-dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShipperSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: shipperEmail,
        password: shipperPassword,
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');
      
      // Create shipper record
      const { error: shipperError } = await supabase
        .from('courier_shippers')
        .insert({
          user_id: authData.user.id,
          company_name: shipperCompany,
          contact_name: shipperName,
          email: shipperEmail,
          phone: shipperPhone,
          city: shipperCity,
          state: shipperState,
        });
      
      if (shipperError) throw shipperError;
      
      navigate('/courier-dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* GTA6 Miami Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz4KPC9zdmc+')] opacity-30" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Truck className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl font-black text-white tracking-wider">
              GTA6 <span className="text-cyan-400">COURIER</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg">NETWORK LOGIN</p>
        </div>
        
        <Card className="bg-gray-900/80 border-cyan-500/30 backdrop-blur">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-3 bg-gray-800/50 w-full">
              <TabsTrigger value="login" className="text-white data-[state=active]:bg-cyan-600">LOGIN</TabsTrigger>
              <TabsTrigger value="driver" className="text-white data-[state=active]:bg-cyan-600">DRIVER</TabsTrigger>
              <TabsTrigger value="shipper" className="text-white data-[state=active]:bg-cyan-600">SHIPPER</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-cyan-400" />
                  Access Portal
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your credentials to access the network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Email</label>
                    <Input
                      type="email"
                      placeholder="agent@gta6.courier"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3"
                  >
                    {loading ? 'ACCESSING...' : 'ENTER NETWORK'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            {/* Driver Signup Tab */}
            <TabsContent value="driver">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-cyan-400" />
                  Join as Driver
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Register your vehicle and start delivering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDriverSignup} className="space-y-3">
                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Full Name</label>
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Email</label>
                    <Input
                      type="email"
                      placeholder="driver@email.com"
                      value={driverEmail}
                      onChange={(e) => setDriverEmail(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Phone</label>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Vehicle Type</label>
                    <Select value={vehicleType} onValueChange={setVehicleType} required>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="car">🏎 Car</SelectItem>
                        <SelectItem value="sprinter">🚐 Sprinter Van</SelectItem>
                        <SelectItem value="box_truck">📦 Box Truck</SelectItem>
                        <SelectItem value="semi">🚛 Semi Truck</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={driverPassword}
                      onChange={(e) => setDriverPassword(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3"
                  >
                    {loading ? 'REGISTERING...' : 'JOIN NETWORK'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            {/* Shipper Signup Tab */}
            <TabsContent value="shipper">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  Join as Shipper
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Register your business to send packages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleShipperSignup} className="space-y-3">
                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Company Name</label>
                    <Input
                      type="text"
                      placeholder="Your company"
                      value={shipperCompany}
                      onChange={(e) => setShipperCompany(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Contact Name</label>
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={shipperName}
                      onChange={(e) => setShipperName(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Email</label>
                    <Input
                      type="email"
                      placeholder="business@company.com"
                      value={shipperEmail}
                      onChange={(e) => setShipperEmail(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Phone</label>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={shipperPhone}
                      onChange={(e) => setShipperPhone(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label className="text-gray-400 text-sm">City</label>
                      <Input
                        type="text"
                        placeholder="Miami"
                        value={shipperCity}
                        onChange={(e) => setShipperCity(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-400 text-sm">State</label>
                      <Input
                        type="text"
                        placeholder="FL"
                        value={shipperState}
                        onChange={(e) => setShipperState(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={shipperPassword}
                      onChange={(e) => setShipperPassword(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3"
                  >
                    {loading ? 'REGISTERING...' : 'JOIN NETWORK'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
        
        {/* Back to Real Estate */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-cyan-400 text-sm transition-colors"
          >
            ← Back to GTA6 Real Estate
          </button>
        </div>
      </div>
    </div>
  );
}
