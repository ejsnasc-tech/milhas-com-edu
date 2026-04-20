"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Flight, FlightFilters, SearchMode, SortOption, Airline, MilesProgram } from "@/types";
import { getFlightsByRoute } from "@/data/flights";
import { getAirportByIata } from "@/data/airports";
import FlightCard from "@/components/FlightCard";
import Filters from "@/components/Filters";

const DEFAULT_MAX_PRICE_MONEY = 10000;
const DEFAULT_MAX_PRICE_MILES = 100000;

export default function ResultadosPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4 animate-pulse">✈️</div>
          <p className="text-gray-600 text-lg">Buscando voos...</p>
        </div>
      }
    >
      <ResultadosContent />
    </Suspense>
  );
}

function ResultadosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const departureDate = searchParams.get("departureDate") || "";
  const returnDate = searchParams.get("returnDate") || "";
  const adults = parseInt(searchParams.get("adults") || "1");
  const searchMode = (searchParams.get("searchMode") || "money") as SearchMode;
  const cabinClass = searchParams.get("cabinClass") || "economy";

  const originAirport = getAirportByIata(origin);
  const destinationAirport = getAirportByIata(destination);

  const allFlights = useMemo(() => getFlightsByRoute(origin, destination), [origin, destination]);

  const maxPriceForMode = searchMode === "money" ? DEFAULT_MAX_PRICE_MONEY : DEFAULT_MAX_PRICE_MILES;

  const [filters, setFilters] = useState<FlightFilters>({
    minPrice: 0,
    maxPrice: maxPriceForMode,
    stops: [0, 1, 2],
    airlines: ["LATAM", "Gol", "Azul"],
    milesPrograms: ["LATAM Pass", "Smiles", "TudoAzul"],
    departureTimeStart: "00:00",
    departureTimeEnd: "23:59",
  });

  const [sortBy, setSortBy] = useState<SortOption>("price");

  // Update max price when search mode changes
  useEffect(() => {
    setFilters((f) => ({ ...f, maxPrice: maxPriceForMode }));
  }, [maxPriceForMode]);

  const filteredFlights = useMemo(() => {
    let flights = allFlights.filter((flight) => {
      // Filter by airline
      if (!filters.airlines.includes(flight.airline as Airline)) return false;

      // Filter by stops (treat 2+ as anything >= 2)
      const stopCheck =
        filters.stops.includes(Math.min(flight.stops, 2));
      if (!stopCheck) return false;

      // Filter by departure time
      const depTime = flight.departureTime;
      if (depTime < filters.departureTimeStart || depTime > filters.departureTimeEnd)
        return false;

      // Filter by price
      if (searchMode === "money") {
        if (flight.priceMoneyBRL > filters.maxPrice) return false;
      } else {
        const milesPrice =
          flight.airline === "LATAM"
            ? flight.priceMilesLatamPass
            : flight.airline === "Gol"
              ? flight.priceMilesSmiles
              : flight.priceMilesTudoAzul;

        if (milesPrice === undefined) return false;
        if (milesPrice > filters.maxPrice) return false;

        // Filter by miles program
        const program: MilesProgram =
          flight.airline === "LATAM"
            ? "LATAM Pass"
            : flight.airline === "Gol"
              ? "Smiles"
              : "TudoAzul";
        if (!filters.milesPrograms.includes(program)) return false;
      }

      return true;
    });

    // Sort
    flights.sort((a, b) => {
      if (sortBy === "price") {
        if (searchMode === "money") {
          return a.priceMoneyBRL - b.priceMoneyBRL;
        } else {
          const aM =
            a.airline === "LATAM" ? a.priceMilesLatamPass :
            a.airline === "Gol" ? a.priceMilesSmiles : a.priceMilesTudoAzul;
          const bM =
            b.airline === "LATAM" ? b.priceMilesLatamPass :
            b.airline === "Gol" ? b.priceMilesSmiles : b.priceMilesTudoAzul;
          return (aM ?? Infinity) - (bM ?? Infinity);
        }
      } else if (sortBy === "duration") {
        const parseDur = (d: string) => {
          const [h, m] = d.replace("h", ":").split(":").map(Number);
          return h * 60 + (m || 0);
        };
        return parseDur(a.duration) - parseDur(b.duration);
      } else {
        // best: combination of price and stops
        const aScore = (searchMode === "money" ? a.priceMoneyBRL : (
          a.airline === "LATAM" ? a.priceMilesLatamPass :
          a.airline === "Gol" ? a.priceMilesSmiles : a.priceMilesTudoAzul) ?? Infinity) + a.stops * 500;
        const bScore = (searchMode === "money" ? b.priceMoneyBRL : (
          b.airline === "LATAM" ? b.priceMilesLatamPass :
          b.airline === "Gol" ? b.priceMilesSmiles : b.priceMilesTudoAzul) ?? Infinity) + b.stops * 500;
        return aScore - bScore;
      }
    });

    return flights;
  }, [allFlights, filters, sortBy, searchMode]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  if (!origin || !destination) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Nenhuma busca realizada
        </h1>
        <p className="text-gray-600 mb-6">
          Volte para a página inicial e faça uma busca.
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-accent-500 hover:bg-accent-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          ← Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Search summary bar */}
      <div className="bg-primary-800 text-white py-4 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">
                  {originAirport?.city || origin}
                </span>
                <span className="text-blue-300 text-xs">({origin})</span>
              </div>
              <span className="text-accent-400 text-xl font-bold">→</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">
                  {destinationAirport?.city || destination}
                </span>
                <span className="text-blue-300 text-xs">({destination})</span>
              </div>
              <span className="text-blue-200 text-sm">•</span>
              <span className="text-blue-100 text-sm">
                {formatDate(departureDate)}
              </span>
              {returnDate && (
                <>
                  <span className="text-blue-200 text-sm">→</span>
                  <span className="text-blue-100 text-sm">
                    {formatDate(returnDate)}
                  </span>
                </>
              )}
              <span className="text-blue-200 text-sm">•</span>
              <span className="text-blue-100 text-sm">
                {adults} {adults === 1 ? "adulto" : "adultos"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  searchMode === "money"
                    ? "bg-accent-500 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {searchMode === "money" ? "💰 Preço em R$" : "🏆 Preço em Milhas"}
              </span>
              <button
                onClick={() => router.push("/")}
                className="text-blue-200 hover:text-white text-sm underline transition-colors"
              >
                ✏️ Nova busca
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Filters sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <Filters
              filters={filters}
              onFiltersChange={setFilters}
              searchMode={searchMode}
              maxPrice={maxPriceForMode}
            />
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {filteredFlights.length === 0
                    ? "Nenhum voo encontrado"
                    : `${filteredFlights.length} ${filteredFlights.length === 1 ? "voo encontrado" : "voos encontrados"}`}
                </h1>
                <p className="text-sm text-gray-500">
                  {origin} → {destination} • {formatDate(departureDate)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">
                  Ordenar:
                </span>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-white">
                  {(
                    [
                      { value: "price", label: "Menor preço" },
                      { value: "duration", label: "Menor duração" },
                      { value: "best", label: "Melhor custo" },
                    ] as const
                  ).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setSortBy(value)}
                      className={`px-3 py-2 text-xs font-medium transition-colors ${
                        sortBy === value
                          ? "bg-primary-800 text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Flight list */}
            {filteredFlights.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">😔</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Nenhum voo encontrado
                </h2>
                <p className="text-gray-500 mb-6">
                  Tente ajustar os filtros ou escolha outra data.
                </p>
                <button
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      stops: [0, 1, 2],
                      airlines: ["LATAM", "Gol", "Azul"],
                      maxPrice: maxPriceForMode,
                    }))
                  }
                  className="bg-primary-800 hover:bg-primary-900 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    searchMode={searchMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
