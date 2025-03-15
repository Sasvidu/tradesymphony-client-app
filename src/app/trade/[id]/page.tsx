"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, Title, Text, BarChart, DonutChart } from "@tremor/react";
import { useQuery } from "@tanstack/react-query";
import { tradingApi } from "../../../lib/api";
import { Trade, Transaction } from "../../../components/TradingContext";
import { useParams, useRouter } from "next/navigation";

interface ChartData {
  name: string;
  value: number;
}

export default function TradePage() {
  const router = useRouter();
  const { id } = useParams();
  const [trade, setTrade] = useState<Trade | null>(null);

  const { data: tradesData } = useQuery({
    queryKey: ["trades"],
    queryFn: () => tradingApi.getTrades() as Promise<Trade[]>,
  });

  useEffect(() => {
    if (tradesData && typeof id === "string") {
      const foundTrade = tradesData.find((t) => t.id === id);
      if (foundTrade) {
        setTrade(foundTrade);
      }
    }
  }, [tradesData, id]);

  if (!trade) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Text>Loading trade details...</Text>
      </div>
    );
  }

  const chartdata: ChartData[] = [
    {
      name: "Buy Amount",
      value: trade.buyAmount || 0,
    },
    {
      name: "Expected Return",
      value: (trade.buyAmount || 0) * ((trade.expectedReturn || 0) / 100),
    },
  ];

  const riskData: ChartData[] = [
    {
      name: "Investment",
      value: trade.buyAmount || 0,
    },
    {
      name: "Available Balance",
      value: 100000 - (trade.buyAmount || 0),
    },
  ];

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              {trade.ticker}
            </h1>
            <p className="text-gray-400">{trade.name}</p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all"
          >
            Back to Dashboard
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card hover-scale purple-glow">
              <Title className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-6">
                Trade Details
              </Title>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-purple-500/5">
                  <Text className="text-gray-400">Status</Text>
                  <Text className="text-xl font-bold text-white capitalize">
                    {trade.status}
                  </Text>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/5">
                  <Text className="text-gray-400">Sector</Text>
                  <Text className="text-xl font-bold text-white">
                    {trade.sector} - {trade.subIndustry}
                  </Text>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/5">
                  <Text className="text-gray-400">Recommendation</Text>
                  <Text className="text-xl font-bold text-white">
                    {trade.recommendation} ({trade.conviction} Conviction)
                  </Text>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/5">
                  <Text className="text-gray-400">Expected Return</Text>
                  <Text className="text-xl font-bold text-white">
                    {trade.expectedReturn}% in {trade.timeframe}
                  </Text>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/5">
                  <Text className="text-gray-400">Risk Level</Text>
                  <Text className="text-xl font-bold text-white">
                    {trade.riskLevel}
                  </Text>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card hover-scale purple-glow">
              <Title className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-6">
                Investment Analysis
              </Title>
              <div className="space-y-8">
                <BarChart
                  data={chartdata}
                  index="name"
                  categories={["value"]}
                  colors={["purple"]}
                  className="h-48"
                />
                <DonutChart
                  data={riskData}
                  index="name"
                  category="value"
                  variant="pie"
                  colors={["purple", "slate"]}
                  className="h-48"
                />
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="glass-card hover-scale purple-glow">
            <Title className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-6">
              Key Investment Drivers
            </Title>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trade.keyDrivers?.map((driver: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 rounded-lg bg-purple-500/5"
                >
                  <Text className="text-white">{driver}</Text>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="glass-card hover-scale purple-glow">
            <Title className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-6">
              Transaction History
            </Title>
            <div className="space-y-4">
              {trade.transactions?.map((transaction: Transaction) => (
                <motion.div
                  key={transaction.id}
                  className="p-4 rounded-lg bg-purple-500/5"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <Text className="text-gray-400">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </Text>
                      <Text className="text-xl font-bold text-white capitalize">
                        {transaction.type}
                      </Text>
                    </div>
                    <div className="text-right">
                      <Text className="text-gray-400">Amount</Text>
                      <Text className="text-xl font-bold text-white">
                        ${transaction.amount.toLocaleString()}
                      </Text>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
