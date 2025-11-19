// src/components/GTAMoneyBar.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { DollarSign, FileText, TrendingUp, Home, Briefcase } from "lucide-react";

interface MoneyStats {
  totalValue: number;
  totalLists: number;
  wholesaleFees: number;
  sellerClosings: number;
  acquisitionFees: number;
}

export default function GTAMoneyBar() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<MoneyStats>({
    totalValue: 0,
    totalLists: 0,
    wholesaleFees: 0,
    sellerClosings: 0,
    acquisitionFees: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get total datasets (lists) - SECURE with account_id
      const { data: datasets } = await supabase
        .from("datasets")
        .select("*")
        .eq("account_id", user.id);

      // Get all properties - SECURE with account_id
      const { data: properties } = await supabase
        .from("properties")
        .select("list_price, assignment_fee, assignment_price, offer_terms")
        .eq("account_id", user.id);

      // Calculate stats
      const totalValue = properties?.reduce((sum, p) => sum + (p.list_price || 0), 0) || 0;
      const wholesaleFees = properties?.reduce((sum, p) => sum + (p.assignment_fee || 0), 0) || 0;
      const acquisitionFees = properties?.reduce((sum, p) => {
        const terms = p.offer_terms as any;
        return sum + (terms?.acquisition_fee || 0);
      }, 0) || 0;
      const sellerClosings = properties?.reduce((sum, p) => sum + (p.assignment_price || 0), 0) || 0;

      setStats({
        totalValue,
        totalLists: datasets?.length || 0,
        wholesaleFees,
        sellerClosings,
        acquisitionFees,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching money bar stats:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-gtaGreen/20 to-vice-yellow/20 border-b-2 border-vice-yellow/50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="animate-pulse text-vice-cyan text-sm">Loading stats...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-black via-gtaGreen/10 to-black border-b-4 border-vice-yellow/80 shadow-neon-yellow">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Portfolio Value */}
          <div
            className="flex items-center gap-3 group hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate('/portfolio-overview')}
          >
            <div className="bg-vice-green/20 p-3 rounded-lg border-2 border-vice-green">
              <DollarSign className="w-6 h-6 text-vice-green" />
            </div>
            <div>
              <div className="text-3xl font-gta font-black text-vice-green gta-text-shadow">
                {formatMoney(stats.totalValue)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Portfolio Value
              </div>
            </div>
          </div>

          {/* Active Lists */}
          <div
            className="flex items-center gap-3 group hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate('/active-lists')}
          >
            <div className="bg-vice-cyan/20 p-3 rounded-lg border-2 border-vice-cyan">
              <FileText className="w-6 h-6 text-vice-cyan" />
            </div>
            <div>
              <div className="text-3xl font-gta font-black text-vice-cyan gta-text-shadow">
                {stats.totalLists}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Active Lists
              </div>
            </div>
          </div>

          {/* Wholesale Fees */}
          <div
            className="flex items-center gap-3 group hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate('/wholesale-fees')}
          >
            <div className="bg-vice-orange/20 p-3 rounded-lg border-2 border-vice-orange">
              <TrendingUp className="w-6 h-6 text-vice-orange" />
            </div>
            <div>
              <div className="text-3xl font-gta font-black text-vice-orange gta-text-shadow">
                {formatMoney(stats.wholesaleFees)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Wholesale Fees
              </div>
            </div>
          </div>

          {/* Seller Closings */}
          <div
            className="flex items-center gap-3 group hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate('/seller-closings')}
          >
            <div className="bg-vice-pink/20 p-3 rounded-lg border-2 border-vice-pink">
              <Home className="w-6 h-6 text-vice-pink" />
            </div>
            <div>
              <div className="text-3xl font-gta font-black text-vice-pink gta-text-shadow">
                {formatMoney(stats.sellerClosings)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Seller Closings
              </div>
            </div>
          </div>

          {/* Acquisition Fees */}
          <div
            className="flex items-center gap-3 group hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate('/acquisition-fees')}
          >
            <div className="bg-vice-yellow/20 p-3 rounded-lg border-2 border-vice-yellow">
              <Briefcase className="w-6 h-6 text-vice-yellow" />
            </div>
            <div>
              <div className="text-3xl font-gta font-black text-vice-yellow gta-text-shadow">
                {formatMoney(stats.acquisitionFees)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Acquisition Fees
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}