"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchParams, CabinClass, SearchMode, Passengers } from "@/types";
import AirportInput from "./AirportInput";

export default function SearchForm() {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [passengers, setPassengers] = useState<Passengers>({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [cabinClass, setCabinClass] = useState<CabinClass>("economy");
  const [searchMode, setSearchMode] = useState<SearchMode>("money");
  const [showPassengers, setShowPassengers] = useState(false);

  const totalPassengers =
    passengers.adults + passengers.children + passengers.infants;

  const cabinLabels: Record<CabinClass, string> = {
    economy: "Econômica",
    business: "Executiva",
    first: "Primeira Classe",
  };

  const today = new Date().toISOString().split("T")[0];

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !departureDate) return;

    const params: SearchParams = {
      origin,
      destination,
      departureDate,
      returnDate: isRoundTrip ? returnDate : undefined,
      passengers,
      cabinClass,
      searchMode,
    };

    const queryString = new URLSearchParams({
      origin,
      destination,
      departureDate,
      ...(isRoundTrip && returnDate ? { returnDate } : {}),
      adults: String(passengers.adults),
      children: String(passengers.children),
      infants: String(passengers.infants),
      cabinClass,
      searchMode,
    }).toString();

    router.push(`/resultados?${queryString}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full">
      {/* Trip type toggle */}
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setIsRoundTrip(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !isRoundTrip
              ? "bg-primary-800 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          → Só ida
        </button>
        <button
          type="button"
          onClick={() => setIsRoundTrip(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            isRoundTrip
              ? "bg-primary-800 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          ⇄ Ida e volta
        </button>
      </div>

      <form onSubmit={handleSearch}>
        {/* Origin / Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 relative">
          <AirportInput
            label="Origem"
            placeholder="Cidade ou aeroporto de origem"
            value={origin}
            onChange={(iata) => setOrigin(iata)}
            icon="🛫"
          />
          <button
            type="button"
            onClick={handleSwap}
            className="hidden md:flex absolute left-1/2 top-8 -translate-x-1/2 z-10 bg-primary-100 hover:bg-primary-200 text-primary-800 rounded-full p-2 shadow transition-colors"
            title="Trocar origem e destino"
          >
            ⇄
          </button>
          <AirportInput
            label="Destino"
            placeholder="Cidade ou aeroporto de destino"
            value={destination}
            onChange={(iata) => setDestination(iata)}
            icon="🛬"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de ida
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              min={today}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de volta
              {!isRoundTrip && (
                <span className="text-gray-400 ml-1">(opcional)</span>
              )}
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={departureDate || today}
              disabled={!isRoundTrip}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white text-sm disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        </div>

        {/* Passengers, Cabin & Mode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Passengers */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passageiros
            </label>
            <button
              type="button"
              onClick={() => setShowPassengers(!showPassengers)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left text-sm text-gray-900 bg-white hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              👤 {totalPassengers}{" "}
              {totalPassengers === 1 ? "passageiro" : "passageiros"}
            </button>
            {showPassengers && (
              <div className="absolute z-20 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-full min-w-[220px]">
                {(
                  [
                    { key: "adults", label: "Adultos", sub: "12+ anos" },
                    { key: "children", label: "Crianças", sub: "2-11 anos" },
                    { key: "infants", label: "Bebês", sub: "0-1 ano" },
                  ] as const
                ).map(({ key, label, sub }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {label}
                      </div>
                      <div className="text-xs text-gray-500">{sub}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setPassengers((p) => ({
                            ...p,
                            [key]: Math.max(
                              key === "adults" ? 1 : 0,
                              p[key] - 1
                            ),
                          }))
                        }
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium w-4 text-center text-gray-900">
                        {passengers[key]}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPassengers((p) => ({
                            ...p,
                            [key]: p[key] + 1,
                          }))
                        }
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setShowPassengers(false)}
                  className="mt-3 w-full bg-primary-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-900 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            )}
          </div>

          {/* Cabin class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classe
            </label>
            <select
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value as CabinClass)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white text-sm"
            >
              <option value="economy">✈ Econômica</option>
              <option value="business">💼 Executiva</option>
              <option value="first">👑 Primeira Classe</option>
            </select>
          </div>

          {/* Search mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por
            </label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden h-[46px]">
              <button
                type="button"
                onClick={() => setSearchMode("money")}
                className={`flex-1 text-sm font-medium transition-colors ${
                  searchMode === "money"
                    ? "bg-primary-800 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                💰 R$
              </button>
              <button
                type="button"
                onClick={() => setSearchMode("miles")}
                className={`flex-1 text-sm font-medium transition-colors ${
                  searchMode === "miles"
                    ? "bg-accent-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                🏆 Milhas
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!origin || !destination || !departureDate}
          className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg"
        >
          🔍 Buscar Passagens
        </button>
      </form>
    </div>
  );
}
