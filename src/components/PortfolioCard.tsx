"use client";

import { Card, Title, Text } from "@tremor/react";
import { motion } from "framer-motion";

interface PortfolioCardProps {
  balance: number;
  totalTrades: number;
  activeTradesCount: number;
}

export function PortfolioCard({ balance, totalTrades, activeTradesCount }: PortfolioCardProps) {
  return (
    <Card className="bg-white shadow-md">
      <Title>Portfolio Overview</Title>
      <div className="mt-4 space-y-4">
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Text>Balance</Text>
          <Text className="font-semibold">
            ${balance.toLocaleString()}
          </Text>
        </motion.div>
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Text>Total Trades</Text>
          <Text className="font-semibold">{totalTrades}</Text>
        </motion.div>
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Text>Active Trades</Text>
          <Text className="font-semibold">{activeTradesCount}</Text>
        </motion.div>
      </div>
    </Card>
  );
}
