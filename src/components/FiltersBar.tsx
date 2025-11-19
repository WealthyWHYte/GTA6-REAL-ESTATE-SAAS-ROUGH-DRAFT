//src/components/FiltersBar.tsx
import { useState, useEffect } from "react";

export default function FiltersBar({ deals, onFilterChange }) {
  const [filters, setFilters] = useState({
    state: "",
    city: "",
    dealType: [],
    bedrooms: "",
    bathrooms: "",
    minPrice: "",
    maxPrice: ""
  });

  const uniqueValues = (key) =>
    [...new Set(deals.map((d) => d[key]).filter(Boolean))];

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const handleDealTypeChange = (type) => {
    setFilters((prev) => {
      const current = new Set(prev.dealType);
      current.has(type) ? current.delete(type) : current.add(type);
      return { ...prev, dealType: [...current] };
    });
  };

  const resetFilters = () => {
    setFilters({
      state: "",
      city: "",
      dealType: [],
      bedrooms: "",
      bathrooms: "",
      minPrice: "",
      maxPrice: ""
    });
  };

  return (
    <div className="bg-zinc-900 text-white p-4 rounded-xl shadow mb-6 space-y-4">
      <div className="flex flex-wrap gap-4">

        <select
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          className="bg-zinc-800 rounded px-3 py-2"
        >
          <option value="">All States</option>
          {uniqueValues("state").map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="bg-zinc-800 rounded px-3 py-2"
        >
          <option value="">All Cities</option>
          {uniqueValues("city").map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2">
          {uniqueValues("dealType").map((type) => (
            <label key={type} className="text-sm flex items-center gap-1">
              <input
                type="checkbox"
                value={type}
                checked={filters.dealType.includes(type)}
                onChange={() => handleDealTypeChange(type)}
              />
              {type}
            </label>
          ))}
        </div>

        <select
          value={filters.bedrooms}
          onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
          className="bg-zinc-800 rounded px-3 py-2"
        >
          <option value="">Any Beds</option>
          {uniqueValues("bedrooms").map((b) => (
            <option key={b} value={b}>{b} Beds</option>
          ))}
        </select>

        <select
          value={filters.bathrooms}
          onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
          className="bg-zinc-800 rounded px-3 py-2"
        >
          <option value="">Any Baths</option>
          {uniqueValues("bathrooms").map((b) => (
            <option key={b} value={b}>{b} Baths</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          className="bg-zinc-800 rounded px-3 py-2 w-32"
        />

        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          className="bg-zinc-800 rounded px-3 py-2 w-32"
        />

        <button onClick={resetFilters} className="bg-red-600 px-3 py-2 rounded">
          Reset Filters
        </button>
      </div>
    </div>
  );
}
