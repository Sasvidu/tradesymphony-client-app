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
    <Card className="glass-card hover-scale purple-glow">
      <Title className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
        Portfolio Overview
      </Title>
      <div className="mt-6 space-y-6">
        <motion.div 
          className="flex justify-between items-center p-4 rounded-lg bg-opacity-10 bg-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Text className="text-gray-300">Balance</Text>
          <Text className="text-xl font-bold text-white">
            ${balance.toLocaleString()}
          </Text>
        </motion.div>
        <motion.div 
          className="flex justify-between items-center p-4 rounded-lg bg-opacity-10 bg-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Text className="text-gray-300">Total Trades</Text>
          <Text className="text-xl font-bold text-white">{totalTrades}</Text>
        </motion.div>
        <motion.div 
          className="flex justify-between items-center p-4 rounded-lg bg-opacity-10 bg-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Text className="text-gray-300">Active Trades</Text>
          <div className="flex items-center space-x-2">
            <Text className="text-xl font-bold text-white">{activeTradesCount}</Text>
            <Text className="text-sm text-purple-400">/3</Text>
          </div>
        </motion.div>
      </div>
    </Card>
  );
}
