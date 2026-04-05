import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">✈️</span>
            <div>
              <span className="text-xl font-bold text-primary-800">Milhas</span>
              <span className="text-xl font-bold text-accent-500"> com Edu</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-primary-700 font-medium transition-colors"
            >
              Buscar Voos
            </Link>
            <a
              href="https://www.latampass.latam.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary-700 font-medium transition-colors"
            >
              LATAM Pass
            </a>
            <a
              href="https://www.smiles.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary-700 font-medium transition-colors"
            >
              Smiles
            </a>
            <a
              href="https://www.tudoazul.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary-700 font-medium transition-colors"
            >
              TudoAzul
            </a>
          </nav>

          <Link
            href="/"
            className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Buscar Agora
          </Link>
        </div>
      </div>
    </header>
  );
}
