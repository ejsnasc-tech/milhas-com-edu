"use client";

import { FlightFilters, SearchMode, Airline, MilesProgram } from "@/types";

interface FiltersProps {
  filters: FlightFilters;
  onFiltersChange: (filters: FlightFilters) => void;
  searchMode: SearchMode;
  maxPrice: number;
}

const airlines: Airline[] = ["LATAM", "Gol", "Azul"];
const milesPrograms: MilesProgram[] = ["LATAM Pass", "Smiles", "TudoAzul"];

export default function Filters({
  filters,
  onFiltersChange,
  searchMode,
  maxPrice,
}: FiltersProps) {
  const updateFilter = <K extends keyof FlightFilters>(
    key: K,
    value: FlightFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayItem = <T,>(arr: T[], item: T): T[] => {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  };

  const priceLabel =
    searchMode === "money" ? `R$ ${filters.maxPrice.toLocaleString("pt-BR")}` : `${filters.maxPrice.toLocaleString("pt-BR")} milhas`;

  return (
    <aside className="bg-white rounded-xl shadow-md p-5 h-fit sticky top-24">
      <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
        🎛 Filtros
      </h2>

      {/* Price */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold text-gray-700">
            {searchMode === "money" ? "Preço máximo" : "Milhas máximas"}
          </label>
          <span className="text-sm font-bold text-accent-500">{priceLabel}</span>
        </div>
        <input
          type="range"
          min={0}
          max={maxPrice}
          step={searchMode === "money" ? 50 : 1000}
          value={filters.maxPrice}
          onChange={(e) => updateFilter("maxPrice", Number(e.target.value))}
          className="w-full accent-accent-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>{searchMode === "money" ? `R$ ${maxPrice.toLocaleString("pt-BR")}` : `${maxPrice.toLocaleString("pt-BR")} mi`}</span>
        </div>
      </div>

      {/* Stops */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Número de paradas
        </label>
        <div className="space-y-2">
          {[
            { value: 0, label: "✈ Direto" },
            { value: 1, label: "1 parada" },
            { value: 2, label: "2+ paradas" },
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.stops.includes(value)}
                onChange={() =>
                  updateFilter("stops", toggleArrayItem(filters.stops, value))
                }
                className="w-4 h-4 accent-primary-700"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Airlines */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Companhias aéreas
        </label>
        <div className="space-y-2">
          {airlines.map((airline) => (
            <label key={airline} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.airlines.includes(airline)}
                onChange={() =>
                  updateFilter(
                    "airlines",
                    toggleArrayItem(filters.airlines, airline)
                  )
                }
                className="w-4 h-4 accent-primary-700"
              />
              <span className="text-sm text-gray-700">{airline}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Miles Programs */}
      {searchMode === "miles" && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Programa de milhas
          </label>
          <div className="space-y-2">
            {milesPrograms.map((program) => (
              <label key={program} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.milesPrograms.includes(program)}
                  onChange={() =>
                    updateFilter(
                      "milesPrograms",
                      toggleArrayItem(filters.milesPrograms, program)
                    )
                  }
                  className="w-4 h-4 accent-primary-700"
                />
                <span className="text-sm text-gray-700">{program}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Departure time */}
      <div className="mb-2">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Horário de partida
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">De</label>
            <input
              type="time"
              value={filters.departureTimeStart}
              onChange={(e) =>
                updateFilter("departureTimeStart", e.target.value)
              }
              className="w-full mt-1 px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Até</label>
            <input
              type="time"
              value={filters.departureTimeEnd}
              onChange={(e) => updateFilter("departureTimeEnd", e.target.value)}
              className="w-full mt-1 px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
