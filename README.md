# ✈️ Milhas com Edu

**Buscador de passagens aéreas** com os melhores preços em dinheiro (R$) e milhas, com link direto para compra.

---

## 🚀 Funcionalidades

- 🔍 **Busca de voos** com origem, destino, data, passageiros e classe
- 💰 **Preço em R$** — compare entre LATAM, Gol e Azul
- 🏆 **Preço em milhas** — LATAM Pass, Smiles (Gol) e TudoAzul (Azul)
- ✈️ **+90 aeroportos** brasileiros e internacionais com autocomplete
- 🔗 **Links diretos** para compra no site de cada companhia
- 🎛️ **Filtros** por preço, paradas, companhia, horário e programa de milhas
- 📱 **Design responsivo** mobile-first

---

## 🛠 Tecnologias

- **[Next.js 15](https://nextjs.org/)** com App Router
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Tailwind CSS](https://tailwindcss.com/)**
- **React 18**

---

## 📂 Estrutura de arquivos

```
milhas-com-edu/
├── app/
│   ├── layout.tsx              # Layout principal com Header e Footer
│   ├── page.tsx                # Página inicial com formulário de busca
│   ├── resultados/
│   │   └── page.tsx            # Página de resultados dos voos
│   └── globals.css
├── components/
│   ├── Header.tsx              # Barra de navegação
│   ├── Footer.tsx              # Rodapé
│   ├── SearchForm.tsx          # Formulário de busca
│   ├── FlightCard.tsx          # Card de cada voo
│   ├── Filters.tsx             # Filtros laterais
│   └── AirportInput.tsx        # Input com autocomplete de aeroportos
├── data/
│   ├── airports.ts             # +90 aeroportos BR e internacionais
│   └── flights.ts              # Dados simulados de voos
├── types/
│   └── index.ts                # Tipos TypeScript
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## ⚙️ Instalação e execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/ejsnasc-tech/milhas-com-edu.git
cd milhas-com-edu

# 2. Instale as dependências
npm install

# 3. Execute o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🏗️ Build para produção

```bash
npm run build
npm start
```

---

## ✈️ Companhias e Programas de Milhas

| Companhia | Site | Programa de Milhas |
|-----------|------|--------------------|
| LATAM | [latamairlines.com](https://www.latamairlines.com/br/pt) | [LATAM Pass](https://www.latampass.latam.com) |
| Gol | [voegol.com.br](https://www.voegol.com.br) | [Smiles](https://www.smiles.com.br) |
| Azul | [voeazul.com.br](https://www.voeazul.com.br) | [TudoAzul](https://www.tudoazul.com.br) |

---

## ⚠️ Aviso

> Os preços e voos exibidos são **simulados** para fins de demonstração. Este projeto não possui integração com APIs reais de passagens aéreas.

---

## 📄 Licença

MIT
