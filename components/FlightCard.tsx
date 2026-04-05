import { Flight, SearchMode } from "@/types";
import { airlineInfo } from "@/data/flights";

interface FlightCardProps {
  flight: Flight;
  searchMode: SearchMode;
}

const airlineColors: Record<string, string> = {
  LATAM: "bg-red-600",
  Gol: "bg-orange-500",
  Azul: "bg-blue-700",
};

const airlineBgLight: Record<string, string> = {
  LATAM: "bg-red-50 border-red-100",
  Gol: "bg-orange-50 border-orange-100",
  Azul: "bg-blue-50 border-blue-100",
};

export default function FlightCard({ flight, searchMode }: FlightCardProps) {
  const info = airlineInfo[flight.airline];

  const getMilesPrice = () => {
    if (flight.airline === "LATAM") return flight.priceMilesLatamPass;
    if (flight.airline === "Gol") return flight.priceMilesSmiles;
    if (flight.airline === "Azul") return flight.priceMilesTudoAzul;
    return undefined;
  };

  const milesPrice = getMilesPrice();
  const hasMilesPrice = milesPrice !== undefined;

  const purchaseUrl =
    searchMode === "miles" && info.milesUrl ? info.milesUrl : info.purchaseUrl;

  const stopsLabel =
    flight.stops === 0
      ? "Direto"
      : flight.stops === 1
        ? `1 parada${flight.stopCities ? ` (${flight.stopCities.join(", ")})` : ""}`
        : `${flight.stops} paradas`;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Airline */}
          <div className="flex items-center gap-3 min-w-[120px]">
            <div
              className={`${airlineColors[flight.airline]} text-white text-xs font-bold px-3 py-1.5 rounded-lg`}
            >
              {flight.airline}
            </div>
            <div>
              <div className="text-xs text-gray-500">{flight.flightNumber}</div>
              {flight.cabinClass === "business" && (
                <div className="text-xs text-blue-600 font-medium">Executiva</div>
              )}
              {flight.cabinClass === "first" && (
                <div className="text-xs text-purple-600 font-medium">1ª Classe</div>
              )}
            </div>
          </div>

          {/* Flight times */}
          <div className="flex items-center gap-4 flex-1 justify-center">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {flight.departureTime}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {flight.origin}
              </div>
            </div>

            <div className="flex flex-col items-center px-2">
              <div className="text-xs text-gray-400">{flight.duration}</div>
              <div className="flex items-center gap-1 w-24">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-gray-400 text-sm">✈</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
              <div
                className={`text-xs font-medium ${flight.stops === 0 ? "text-green-600" : "text-amber-600"}`}
              >
                {stopsLabel}
              </div>
            </div>

            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">
                {flight.arrivalTime}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {flight.destination}
              </div>
            </div>
          </div>

          {/* Price & Buy button */}
          <div className="flex flex-col items-end gap-2 min-w-[140px]">
            {searchMode === "money" ? (
              <div>
                <div className="text-xs text-gray-500">a partir de</div>
                <div className="text-2xl font-bold text-accent-500">
                  R${" "}
                  {flight.priceMoneyBRL.toLocaleString("pt-BR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-xs text-gray-500">por pessoa</div>
              </div>
            ) : (
              <div>
                {hasMilesPrice ? (
                  <>
                    <div className="text-xs text-gray-500">a partir de</div>
                    <div className="text-2xl font-bold text-accent-500">
                      {milesPrice!.toLocaleString("pt-BR")}
                    </div>
                    <div className="text-xs text-gray-500">
                      milhas • {info.milesProgram}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-400 italic">
                    Milhas não disponíveis
                  </div>
                )}
              </div>
            )}

            <a
              href={purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent-500 hover:bg-accent-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap shadow"
            >
              Comprar agora →
            </a>

            <div className="text-xs text-gray-400">
              {flight.availableSeats <= 5
                ? `⚠️ Últimos ${flight.availableSeats} assentos!`
                : `${flight.availableSeats} assentos disponíveis`}
            </div>
          </div>
        </div>

        {/* Miles secondary info */}
        {searchMode === "money" && hasMilesPrice && (
          <div
            className={`mt-3 px-3 py-2 rounded-lg border text-xs ${airlineBgLight[flight.airline]}`}
          >
            <span className="text-gray-600">
              Também disponível em milhas:{" "}
              <strong className="text-gray-900">
                {milesPrice!.toLocaleString("pt-BR")} {info.milesProgram}
              </strong>{" "}
              •{" "}
              <a
                href={info.milesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-700 hover:underline"
              >
                Ver no site
              </a>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
