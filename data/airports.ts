import { Airport } from "@/types";

export const airports: Airport[] = [
  // Brazil - Major airports
  { iata: "GRU", name: "Aeroporto Internacional de Guarulhos", city: "São Paulo", country: "Brasil", countryCode: "BR" },
  { iata: "CGH", name: "Aeroporto de Congonhas", city: "São Paulo", country: "Brasil", countryCode: "BR" },
  { iata: "VCP", name: "Aeroporto Internacional de Viracopos", city: "Campinas", country: "Brasil", countryCode: "BR" },
  { iata: "GIG", name: "Aeroporto Internacional do Galeão", city: "Rio de Janeiro", country: "Brasil", countryCode: "BR" },
  { iata: "SDU", name: "Aeroporto Santos Dumont", city: "Rio de Janeiro", country: "Brasil", countryCode: "BR" },
  { iata: "BSB", name: "Aeroporto Internacional de Brasília", city: "Brasília", country: "Brasil", countryCode: "BR" },
  { iata: "CNF", name: "Aeroporto Internacional de Confins", city: "Belo Horizonte", country: "Brasil", countryCode: "BR" },
  { iata: "PLU", name: "Aeroporto da Pampulha", city: "Belo Horizonte", country: "Brasil", countryCode: "BR" },
  { iata: "SSA", name: "Aeroporto Internacional de Salvador", city: "Salvador", country: "Brasil", countryCode: "BR" },
  { iata: "FOR", name: "Aeroporto Internacional de Fortaleza", city: "Fortaleza", country: "Brasil", countryCode: "BR" },
  { iata: "REC", name: "Aeroporto Internacional do Recife", city: "Recife", country: "Brasil", countryCode: "BR" },
  { iata: "POA", name: "Aeroporto Internacional de Porto Alegre", city: "Porto Alegre", country: "Brasil", countryCode: "BR" },
  { iata: "CWB", name: "Aeroporto Internacional de Curitiba", city: "Curitiba", country: "Brasil", countryCode: "BR" },
  { iata: "FLN", name: "Aeroporto Internacional de Florianópolis", city: "Florianópolis", country: "Brasil", countryCode: "BR" },
  { iata: "MAO", name: "Aeroporto Internacional de Manaus", city: "Manaus", country: "Brasil", countryCode: "BR" },
  { iata: "BEL", name: "Aeroporto Internacional de Belém", city: "Belém", country: "Brasil", countryCode: "BR" },
  { iata: "NAT", name: "Aeroporto Internacional de Natal", city: "Natal", country: "Brasil", countryCode: "BR" },
  { iata: "MCZ", name: "Aeroporto Internacional de Maceió", city: "Maceió", country: "Brasil", countryCode: "BR" },
  { iata: "AJU", name: "Aeroporto Internacional de Aracaju", city: "Aracaju", country: "Brasil", countryCode: "BR" },
  { iata: "THE", name: "Aeroporto Internacional de Teresina", city: "Teresina", country: "Brasil", countryCode: "BR" },
  { iata: "SLZ", name: "Aeroporto Internacional de São Luís", city: "São Luís", country: "Brasil", countryCode: "BR" },
  { iata: "CGB", name: "Aeroporto Internacional de Cuiabá", city: "Cuiabá", country: "Brasil", countryCode: "BR" },
  { iata: "CGR", name: "Aeroporto Internacional de Campo Grande", city: "Campo Grande", country: "Brasil", countryCode: "BR" },
  { iata: "PVH", name: "Aeroporto Internacional de Porto Velho", city: "Porto Velho", country: "Brasil", countryCode: "BR" },
  { iata: "RBR", name: "Aeroporto Internacional de Rio Branco", city: "Rio Branco", country: "Brasil", countryCode: "BR" },
  { iata: "MCP", name: "Aeroporto Internacional de Macapá", city: "Macapá", country: "Brasil", countryCode: "BR" },
  { iata: "BOA", name: "Aeroporto de Boa Vista", city: "Boa Vista", country: "Brasil", countryCode: "BR" },
  { iata: "PMW", name: "Aeroporto Internacional de Palmas", city: "Palmas", country: "Brasil", countryCode: "BR" },
  { iata: "GYN", name: "Aeroporto Internacional de Goiânia", city: "Goiânia", country: "Brasil", countryCode: "BR" },
  { iata: "VIX", name: "Aeroporto de Vitória", city: "Vitória", country: "Brasil", countryCode: "BR" },
  { iata: "JPA", name: "Aeroporto Internacional de João Pessoa", city: "João Pessoa", country: "Brasil", countryCode: "BR" },
  { iata: "IGU", name: "Aeroporto Internacional de Foz do Iguaçu", city: "Foz do Iguaçu", country: "Brasil", countryCode: "BR" },
  { iata: "UDI", name: "Aeroporto de Uberlândia", city: "Uberlândia", country: "Brasil", countryCode: "BR" },
  { iata: "LDB", name: "Aeroporto de Londrina", city: "Londrina", country: "Brasil", countryCode: "BR" },
  { iata: "MII", name: "Aeroporto de Marília", city: "Marília", country: "Brasil", countryCode: "BR" },

  // South America
  { iata: "EZE", name: "Aeroporto Internacional Ezeiza", city: "Buenos Aires", country: "Argentina", countryCode: "AR" },
  { iata: "AEP", name: "Aeroporto Jorge Newbery", city: "Buenos Aires", country: "Argentina", countryCode: "AR" },
  { iata: "SCL", name: "Aeroporto Internacional de Santiago", city: "Santiago", country: "Chile", countryCode: "CL" },
  { iata: "BOG", name: "Aeroporto Internacional El Dorado", city: "Bogotá", country: "Colômbia", countryCode: "CO" },
  { iata: "LIM", name: "Aeroporto Internacional Jorge Chávez", city: "Lima", country: "Peru", countryCode: "PE" },
  { iata: "MVD", name: "Aeroporto Internacional de Montevidéu", city: "Montevidéu", country: "Uruguai", countryCode: "UY" },
  { iata: "ASU", name: "Aeroporto Internacional de Assunção", city: "Assunção", country: "Paraguai", countryCode: "PY" },
  { iata: "GEO", name: "Aeroporto Internacional de Georgetown", city: "Georgetown", country: "Guiana", countryCode: "GY" },
  { iata: "CCS", name: "Aeroporto Internacional de Caracas", city: "Caracas", country: "Venezuela", countryCode: "VE" },
  { iata: "UIO", name: "Aeroporto Internacional de Quito", city: "Quito", country: "Equador", countryCode: "EC" },
  { iata: "GYE", name: "Aeroporto Internacional José Joaquín de Olmedo", city: "Guayaquil", country: "Equador", countryCode: "EC" },
  { iata: "VVI", name: "Aeroporto Internacional de Santa Cruz", city: "Santa Cruz de la Sierra", country: "Bolívia", countryCode: "BO" },

  // North America
  { iata: "MIA", name: "Aeroporto Internacional de Miami", city: "Miami", country: "Estados Unidos", countryCode: "US" },
  { iata: "JFK", name: "Aeroporto Internacional John F. Kennedy", city: "Nova York", country: "Estados Unidos", countryCode: "US" },
  { iata: "EWR", name: "Aeroporto Internacional Newark Liberty", city: "Nova Jersey", country: "Estados Unidos", countryCode: "US" },
  { iata: "LAX", name: "Aeroporto Internacional de Los Angeles", city: "Los Angeles", country: "Estados Unidos", countryCode: "US" },
  { iata: "ORD", name: "Aeroporto Internacional O'Hare", city: "Chicago", country: "Estados Unidos", countryCode: "US" },
  { iata: "ATL", name: "Aeroporto Internacional Hartsfield-Jackson", city: "Atlanta", country: "Estados Unidos", countryCode: "US" },
  { iata: "DFW", name: "Aeroporto Internacional Dallas/Fort Worth", city: "Dallas", country: "Estados Unidos", countryCode: "US" },
  { iata: "IAH", name: "Aeroporto Internacional George Bush", city: "Houston", country: "Estados Unidos", countryCode: "US" },
  { iata: "MCO", name: "Aeroporto Internacional de Orlando", city: "Orlando", country: "Estados Unidos", countryCode: "US" },
  { iata: "BOS", name: "Aeroporto Internacional Logan", city: "Boston", country: "Estados Unidos", countryCode: "US" },
  { iata: "SFO", name: "Aeroporto Internacional de São Francisco", city: "São Francisco", country: "Estados Unidos", countryCode: "US" },
  { iata: "SEA", name: "Aeroporto Internacional Seattle-Tacoma", city: "Seattle", country: "Estados Unidos", countryCode: "US" },
  { iata: "YYZ", name: "Aeroporto Internacional Pearson de Toronto", city: "Toronto", country: "Canadá", countryCode: "CA" },
  { iata: "YUL", name: "Aeroporto Internacional Pierre Elliott Trudeau", city: "Montreal", country: "Canadá", countryCode: "CA" },
  { iata: "MEX", name: "Aeroporto Internacional Benito Juárez", city: "Cidade do México", country: "México", countryCode: "MX" },
  { iata: "CUN", name: "Aeroporto Internacional de Cancún", city: "Cancún", country: "México", countryCode: "MX" },

  // Europe
  { iata: "LHR", name: "Aeroporto Internacional de Heathrow", city: "Londres", country: "Reino Unido", countryCode: "GB" },
  { iata: "LGW", name: "Aeroporto de Gatwick", city: "Londres", country: "Reino Unido", countryCode: "GB" },
  { iata: "CDG", name: "Aeroporto Internacional Charles de Gaulle", city: "Paris", country: "França", countryCode: "FR" },
  { iata: "ORY", name: "Aeroporto de Orly", city: "Paris", country: "França", countryCode: "FR" },
  { iata: "MAD", name: "Aeroporto Internacional Adolfo Suárez", city: "Madri", country: "Espanha", countryCode: "ES" },
  { iata: "BCN", name: "Aeroporto Internacional El Prat", city: "Barcelona", country: "Espanha", countryCode: "ES" },
  { iata: "LIS", name: "Aeroporto Internacional de Lisboa", city: "Lisboa", country: "Portugal", countryCode: "PT" },
  { iata: "OPO", name: "Aeroporto Internacional Francisco Sá Carneiro", city: "Porto", country: "Portugal", countryCode: "PT" },
  { iata: "FCO", name: "Aeroporto Internacional de Roma Fiumicino", city: "Roma", country: "Itália", countryCode: "IT" },
  { iata: "MXP", name: "Aeroporto Internacional de Milão Malpensa", city: "Milão", country: "Itália", countryCode: "IT" },
  { iata: "FRA", name: "Aeroporto Internacional de Frankfurt", city: "Frankfurt", country: "Alemanha", countryCode: "DE" },
  { iata: "MUC", name: "Aeroporto Internacional Franz Josef Strauss", city: "Munique", country: "Alemanha", countryCode: "DE" },
  { iata: "AMS", name: "Aeroporto Internacional de Amsterdã Schiphol", city: "Amsterdã", country: "Holanda", countryCode: "NL" },
  { iata: "ZRH", name: "Aeroporto Internacional de Zurique", city: "Zurique", country: "Suíça", countryCode: "CH" },
  { iata: "VIE", name: "Aeroporto Internacional de Viena", city: "Viena", country: "Áustria", countryCode: "AT" },

  // Africa
  { iata: "JNB", name: "Aeroporto Internacional O.R. Tambo", city: "Joanesburgo", country: "África do Sul", countryCode: "ZA" },
  { iata: "CPT", name: "Aeroporto Internacional da Cidade do Cabo", city: "Cidade do Cabo", country: "África do Sul", countryCode: "ZA" },
  { iata: "LOS", name: "Aeroporto Internacional Murtala Muhammed", city: "Lagos", country: "Nigéria", countryCode: "NG" },
  { iata: "CAI", name: "Aeroporto Internacional do Cairo", city: "Cairo", country: "Egito", countryCode: "EG" },
  { iata: "CMN", name: "Aeroporto Internacional Mohammed V", city: "Casablanca", country: "Marrocos", countryCode: "MA" },

  // Asia & Oceania
  { iata: "DXB", name: "Aeroporto Internacional de Dubai", city: "Dubai", country: "Emirados Árabes Unidos", countryCode: "AE" },
  { iata: "DOH", name: "Aeroporto Internacional Hamad", city: "Doha", country: "Catar", countryCode: "QA" },
  { iata: "NRT", name: "Aeroporto Internacional de Narita", city: "Tóquio", country: "Japão", countryCode: "JP" },
  { iata: "HND", name: "Aeroporto Internacional de Haneda", city: "Tóquio", country: "Japão", countryCode: "JP" },
  { iata: "PEK", name: "Aeroporto Internacional Capital de Pequim", city: "Pequim", country: "China", countryCode: "CN" },
  { iata: "PVG", name: "Aeroporto Internacional Pudong", city: "Xangai", country: "China", countryCode: "CN" },
  { iata: "SIN", name: "Aeroporto Internacional Changi", city: "Singapura", country: "Singapura", countryCode: "SG" },
  { iata: "BKK", name: "Aeroporto Internacional Suvarnabhumi", city: "Bangkok", country: "Tailândia", countryCode: "TH" },
  { iata: "SYD", name: "Aeroporto Internacional de Sydney", city: "Sydney", country: "Austrália", countryCode: "AU" },
  { iata: "MEL", name: "Aeroporto Internacional de Melbourne", city: "Melbourne", country: "Austrália", countryCode: "AU" },
];

export function searchAirports(query: string): Airport[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return airports.filter((a) => {
    const iata = a.iata.toLowerCase();
    const name = a.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const city = a.city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return iata.includes(q) || name.includes(q) || city.includes(q);
  }).slice(0, 8);
}

export function getAirportByIata(iata: string): Airport | undefined {
  return airports.find((a) => a.iata === iata.toUpperCase());
}
