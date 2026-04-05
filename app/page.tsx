import SearchForm from "@/components/SearchForm";

const features = [
  {
    icon: "💰",
    title: "Menor Preço em R$",
    description:
      "Compare preços em reais entre todas as companhias aéreas e encontre a melhor oferta.",
  },
  {
    icon: "🏆",
    title: "Preço em Milhas",
    description:
      "Veja quantas milhas você precisa: LATAM Pass, Smiles (Gol) e TudoAzul (Azul).",
  },
  {
    icon: "🔗",
    title: "Compra Direta",
    description:
      "Clique em Comprar agora e vá direto ao site da companhia para finalizar sua compra.",
  },
  {
    icon: "✈️",
    title: "Todos os Aeroportos",
    description:
      "Busque em mais de 90 aeroportos brasileiros e internacionais com autocomplete.",
  },
];

const popularRoutes = [
  { from: "GRU", to: "GIG", fromCity: "São Paulo", toCity: "Rio de Janeiro" },
  { from: "GRU", to: "BSB", fromCity: "São Paulo", toCity: "Brasília" },
  { from: "GRU", to: "SSA", fromCity: "São Paulo", toCity: "Salvador" },
  { from: "GRU", to: "FOR", fromCity: "São Paulo", toCity: "Fortaleza" },
  { from: "GRU", to: "REC", fromCity: "São Paulo", toCity: "Recife" },
  { from: "GRU", to: "MIA", fromCity: "São Paulo", toCity: "Miami" },
];

export default function Home() {
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-sky-gradient overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">✈</div>
          <div className="absolute top-20 right-20 text-6xl rotate-45">✈</div>
          <div className="absolute bottom-10 left-1/4 text-5xl -rotate-12">✈</div>
          <div className="absolute bottom-20 right-1/3 text-7xl rotate-12">✈</div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
              Voe mais, pague menos
            </h1>
            <p className="text-blue-100 text-xl md:text-2xl max-w-2xl mx-auto">
              Compare passagens em <strong className="text-white">R$</strong> e{" "}
              <strong className="text-accent-300">milhas</strong>. Encontre as
              melhores ofertas e compre diretamente.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Popular routes */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ✈ Rotas Populares
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {popularRoutes.map((route) => (
              <a
                key={`${route.from}-${route.to}`}
                href={`/resultados?origin=${route.from}&destination=${route.to}&departureDate=${today}&adults=1&children=0&infants=0&cabinClass=economy&searchMode=money`}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center group"
              >
                <div className="text-2xl mb-2">🏙️</div>
                <div className="text-xs font-bold text-primary-800 group-hover:text-accent-500 transition-colors">
                  {route.from} → {route.to}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {route.fromCity}
                </div>
                <div className="text-xs text-gray-400">→ {route.toCity}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
            Por que usar o Milhas com Edu?
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            Encontre as melhores passagens em segundos e economize em cada
            viagem.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Airlines */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Companhias e Programas de Milhas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LATAM */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                  LATAM
                </div>
                <span className="text-gray-700 font-semibold">
                  LATAM Airlines
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                A maior companhia da América Latina. Voe para mais de 150
                destinos.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://www.latamairlines.com/br/pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  Comprar R$
                </a>
                <a
                  href="https://www.latampass.latam.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  LATAM Pass
                </a>
              </div>
            </div>

            {/* GOL */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                  GOL
                </div>
                <span className="text-gray-700 font-semibold">Gol Airlines</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Voos domésticos e internacionais com ótimo custo-benefício.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://www.voegol.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors font-medium"
                >
                  Comprar R$
                </a>
                <a
                  href="https://www.smiles.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  Smiles
                </a>
              </div>
            </div>

            {/* AZUL */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-700 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                  AZUL
                </div>
                <span className="text-gray-700 font-semibold">Azul Airlines</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Conectando o Brasil com a maior malha aérea doméstica do país.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://www.voeazul.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  Comprar R$
                </a>
                <a
                  href="https://www.tudoazul.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-cyan-50 text-cyan-700 px-3 py-1.5 rounded-lg hover:bg-cyan-100 transition-colors font-medium"
                >
                  TudoAzul
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
