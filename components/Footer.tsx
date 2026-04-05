import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">✈️</span>
              <div>
                <span className="text-xl font-bold text-white">Milhas</span>
                <span className="text-xl font-bold text-accent-400"> com Edu</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              O melhor buscador de passagens aéreas do Brasil. Encontre os
              melhores preços em dinheiro e milhas, com link direto para compra.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Companhias</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.latamairlines.com/br/pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  LATAM Airlines
                </a>
              </li>
              <li>
                <a
                  href="https://www.voegol.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Gol
                </a>
              </li>
              <li>
                <a
                  href="https://www.voeazul.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Azul
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Programas de Milhas</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.latampass.latam.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  LATAM Pass
                </a>
              </li>
              <li>
                <a
                  href="https://www.smiles.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Smiles (Gol)
                </a>
              </li>
              <li>
                <a
                  href="https://www.tudoazul.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  TudoAzul (Azul)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2024 Milhas com Edu. Todos os direitos reservados.
          </p>
          <p className="text-gray-500 text-sm mt-2 md:mt-0">
            Os preços são simulados para fins de demonstração.
          </p>
        </div>
      </div>
    </footer>
  );
}
