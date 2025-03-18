export interface PortfolioHolding {
  ticker: string;
  name: string;
  sector: string;
  totalValue: number;
  percentage: number;
}

export interface PortfolioDistribution {
  totalPortfolioValue: number;
  holdings: PortfolioHolding[];
}

export const mockPortfolioData: PortfolioDistribution = {
  totalPortfolioValue: 910000,
  holdings: [
    {
      ticker: "AAPL",
      name: "Apple Inc.",
      sector: "Technology",
      totalValue: 40000,
      percentage: 4.395604395604396
    },
    {
      ticker: "MSFT",
      name: "Microsoft Corporation",
      sector: "Technology",
      totalValue: 35000,
      percentage: 3.8461538461538463
    },
    {
      ticker: "GOOGL",
      name: "Alphabet Inc.",
      sector: "Technology",
      totalValue: 30000,
      percentage: 3.2967032967032965
    },
    {
      ticker: "AMZN",
      name: "Amazon.com Inc.",
      sector: "Consumer Discretionary",
      totalValue: 25000,
      percentage: 2.7472527472527472
    },
    {
      ticker: "NVDA",
      name: "NVIDIA Corporation",
      sector: "Technology",
      totalValue: 20000,
      percentage: 2.1978021978021976
    },
    {
      ticker: "CASH",
      name: "Cash",
      sector: "Cash",
      totalValue: 760000,
      percentage: 83.51648351648352
    }
  ]
};