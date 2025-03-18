import { Card, Title, DonutChart } from "@tremor/react";
import { useQuery } from "@tanstack/react-query";

interface Holding {
  ticker: string;
  name: string;
  sector: string;
  totalValue: number;
  percentage: number;
}

interface PortfolioDistribution {
  totalPortfolioValue: number;
  holdings: Holding[];
}

export function PortfolioDistribution() {
  const { data, isLoading, error } = useQuery<PortfolioDistribution>({
    queryKey: ["portfolioDistribution"],
    queryFn: () => fetch("/api/portfolio/distribution").then((res) => res.json()),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <Card className="mt-4">
        <Title>Portfolio Distribution</Title>
        <div className="h-52 flex items-center justify-center">
          Loading...
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="mt-4">
        <Title>Portfolio Distribution</Title>
        <div className="h-52 flex items-center justify-center text-red-500">
          Error loading portfolio distribution
        </div>
      </Card>
    );
  }

  const chartData = data.holdings.map((holding) => ({
    name: `${holding.name} (${holding.ticker})`,
    value: holding.percentage,
  }));

  return (
    <Card className="mt-4">
      <Title>Portfolio Distribution</Title>
      <DonutChart
        className="mt-6 h-52"
        data={chartData}
        category="value"
        index="name"
        valueFormatter={(value) => `${value.toFixed(1)}%`}
        colors={["slate", "violet", "indigo", "rose", "cyan", "amber"]}
      />
    </Card>
  );
}
