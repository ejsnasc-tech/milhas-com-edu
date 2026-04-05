export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
}

export type CabinClass = "economy" | "business" | "first";

export type SearchMode = "money" | "miles";

export type MilesProgram = "LATAM Pass" | "Smiles" | "TudoAzul";

export interface Passengers {
  adults: number;
  children: number;
  infants: number;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: Passengers;
  cabinClass: CabinClass;
  searchMode: SearchMode;
}

export type Airline = "LATAM" | "Gol" | "Azul";

export interface Flight {
  id: string;
  airline: Airline;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopCities?: string[];
  priceMoneyBRL: number;
  priceMilesLatamPass?: number;
  priceMilesSmiles?: number;
  priceMilesTudoAzul?: number;
  cabinClass: CabinClass;
  availableSeats: number;
}

export interface FlightFilters {
  minPrice: number;
  maxPrice: number;
  stops: number[];
  airlines: Airline[];
  milesPrograms: MilesProgram[];
  departureTimeStart: string;
  departureTimeEnd: string;
}

export type SortOption = "price" | "duration" | "best";

export interface AirlineInfo {
  name: Airline;
  logo: string;
  color: string;
  purchaseUrl: string;
  milesUrl?: string;
  milesProgram?: MilesProgram;
}
