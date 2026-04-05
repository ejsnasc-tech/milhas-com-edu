import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Milhas com Edu — Buscador de Passagens Aéreas",
  description:
    "Encontre as melhores passagens aéreas em dinheiro (R$) e milhas. Compare preços da LATAM, Gol e Azul e compre diretamente.",
  keywords: [
    "passagens aéreas",
    "milhas",
    "LATAM Pass",
    "Smiles",
    "TudoAzul",
    "voos baratos",
    "passagens baratas",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
