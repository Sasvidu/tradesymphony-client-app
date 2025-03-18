import React from 'react';
import { Card, Title } from "@tremor/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { mockPortfolioData, PortfolioDistribution as PortfolioDistributionType } from "~/lib/portfolio";

const COLORS = ['#9333EA', // purple-600
               '#D946EF', // fuchsia-500
               '#8B5CF6', // violet-500
               '#EC4899', // pink-500
               '#6366F1', // indigo-500
               '#3B82F6'  // blue-500
];

export function PortfolioDistribution() {
  const { data, isLoading, error } = useQuery<PortfolioDistributionType>({
    queryKey: ["portfolioDistribution"],
    queryFn: async () => {
      // In production, use the API endpoint
      return fetch("/api/portfolio/distribution").then(res => res.json());
      
      // For now, use mock data
      // return Promise.resolve(mockPortfolioData);
    },
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
        <div className="mt-4 flex flex-col items-center">
          <PieChart width={800} height={300} className="z-10">
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="text-xs"
                />
              ))}
            </Pie>
          </PieChart>
          <div className="mt-6 grid grid-cols-2 gap-4 text-white">
            {chartData.map((item, index) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm truncate">{item.name} ({item.value.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}