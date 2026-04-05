"use client";

import { useState, useRef, useEffect } from "react";
import { Airport } from "@/types";
import { searchAirports } from "@/data/airports";

interface AirportInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (iata: string, airport: Airport | null) => void;
  icon?: string;
}

export default function AirportInput({
  label,
  placeholder,
  value,
  onChange,
  icon = "📍",
}: AirportInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value && !selectedAirport) {
      setQuery(value);
    }
  }, [value, selectedAirport]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedAirport(null);

    if (val.length >= 2) {
      const results = searchAirports(val);
      setSuggestions(results);
      setIsOpen(results.length > 0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }

    if (val === "") {
      onChange("", null);
    }
  };

  const handleSelect = (airport: Airport) => {
    setSelectedAirport(airport);
    setQuery(`${airport.iata} - ${airport.city}`);
    setSuggestions([]);
    setIsOpen(false);
    onChange(airport.iata, airport);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedAirport(null);
    setSuggestions([]);
    setIsOpen(false);
    onChange("", null);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white text-sm"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((airport) => (
            <button
              key={airport.iata}
              type="button"
              onClick={() => handleSelect(airport)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
            >
              <span className="bg-primary-800 text-white text-xs font-bold px-2 py-1 rounded min-w-[48px] text-center mt-0.5">
                {airport.iata}
              </span>
              <div>
                <div className="text-sm font-medium text-gray-900 leading-tight">
                  {airport.city}
                </div>
                <div className="text-xs text-gray-500 leading-tight">
                  {airport.name} • {airport.country}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
