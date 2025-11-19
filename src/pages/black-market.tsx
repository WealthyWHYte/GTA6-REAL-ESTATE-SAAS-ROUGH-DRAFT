// src/pages/black-market.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Inline mock data (so it always works)
const mockDeals = [
  {
    id: "deal-001",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400",
    address: "123 Vice City Blvd, Miami, FL",
    city: "Miami",
    state: "FL",
    price: 425000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1500,
    yearBuilt: 1995,
    rehab: "Light",
    dealType: "Creative Finance",
  },
  {
    id: "deal-002",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400",
    address: "456 Ocean Dr, Miami Beach, FL",
    city: "Miami Beach",
    state: "FL",
    price: 899000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2300,
    dealType: "Seller Finance",
  },
  {
    id: "deal-003",
    image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400",
    address: "789 Palm Ave, Coral Gables, FL",
    city: "Coral Gables",
    state: "FL",
    price: 650000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    dealType: "Subject-To",
  },
];

export default function BlackMarketPage() {
  const [filteredDeals, setFilteredDeals] = useState(mockDeals);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    state: "",
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);

    // Apply filters
    let filtered = mockDeals.filter((deal) => {
      const matchesMinPrice = !newFilters.minPrice || deal.price >= Number(newFilters.minPrice);
      const matchesMaxPrice = !newFilters.maxPrice || deal.price <= Number(newFilters.maxPrice);
      const matchesBedrooms = !newFilters.bedrooms || deal.bedrooms == Number(newFilters.bedrooms);
      const matchesState = !newFilters.state || deal.state === newFilters.state;

      return matchesMinPrice && matchesMaxPrice && matchesBedrooms && matchesState;
    });

    setFilteredDeals(filtered);
  };

  const resetFilters = () => {
    setFilters({ minPrice: "", maxPrice: "", bedrooms: "", state: "" });
    setFilteredDeals(mockDeals);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-gta font-black text-transparent bg-gradient-neon bg-clip-text mb-4">
            BLACK MARKET
          </h1>
          <p className="text-vice-cyan text-xl">Where deals go to disappear 🔥</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-vice-pink font-gta">TOTAL DEALS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-vice-cyan">{filteredDeals.length}</p>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-vice-orange font-gta">AVG PROFIT</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-vice-green">$45K</p>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-vice-yellow font-gta">ACTIVE LISTINGS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-vice-pink">{filteredDeals.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mission-card mb-8">
          <CardHeader>
            <CardTitle className="font-gta text-vice-cyan">🎯 FILTER DEALS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Min Price</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="$0"
                  className="w-full px-3 py-2 bg-muted border border-vice-cyan/20 rounded text-foreground"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Max Price</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="$999,999"
                  className="w-full px-3 py-2 bg-muted border border-vice-cyan/20 rounded text-foreground"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Bedrooms</label>
                <select
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-muted border border-vice-cyan/20 rounded text-foreground"
                >
                  <option value="">Any</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">State</label>
                <select
                  name="state"
                  value={filters.state}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-muted border border-vice-cyan/20 rounded text-foreground"
                >
                  <option value="">All States</option>
                  <option value="FL">Florida</option>
                  <option value="CA">California</option>
                  <option value="TX">Texas</option>
                </select>
              </div>
            </div>

            <Button
              onClick={resetFilters}
              variant="outline"
              className="mt-4"
            >
              🔄 Reset Filters
            </Button>
          </CardContent>
        </Card>

        {/* Deals Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredDeals.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-2xl text-muted-foreground">No deals match your filters</p>
            </div>
          ) : (
            filteredDeals.map((deal) => (
              <Link
                key={deal.id}
                to={`/black-market/${deal.id}`}
                className="group"
              >
                <Card className="mission-card hover:border-vice-pink transition-all overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.address}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-6">
                    <h2 className="text-xl font-gta text-vice-cyan mb-2 group-hover:text-vice-pink transition-colors">
                      {deal.address}
                    </h2>
                    <p className="text-2xl font-bold text-vice-green mb-3">
                      ${deal.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>🛏️ {deal.bedrooms}bd</span>
                      <span>🛁 {deal.bathrooms}ba</span>
                      <span>📐 {deal.sqft} sqft</span>
                    </div>
                    <Badge variant="outline" className="border-vice-orange text-vice-orange">
                      {deal.dealType}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-muted-foreground/30"
          >
            ← BACK
          </Button>
        </div>
      </div>
    </div>
  );
}