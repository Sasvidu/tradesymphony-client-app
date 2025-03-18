import { Card, Title, DonutChart } from "@tremor/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

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
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <Card className="glass-card hover-scale purple-glow">
        <Title className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Portfolio Distribution
        </Title>
        <div className="h-52 flex items-center justify-center text-purple-400">
          Loading...
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="glass-card hover-scale purple-glow">
        <Title className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Portfolio Distribution
        </Title>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="glass-card hover-scale purple-glow">
        <Title className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Portfolio Distribution
        </Title>
        <DonutChart
          className="mt-6 h-52"
          data={chartData}
          category="value"
          index="name"
          valueFormatter={(value) => `${value.toFixed(1)}%`}
          colors={["purple", "violet", "indigo", "fuchsia", "pink", "rose"]}
          showAnimation={true}
          showTooltip={true}
          variant="donut"
        />
      </Card>
    </motion.div>
  );
}
