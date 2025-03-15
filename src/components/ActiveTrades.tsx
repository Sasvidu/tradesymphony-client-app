"use client";

import { Card, Title, Text, Badge } from "@tremor/react";
import { motion } from "framer-motion";
import { Trade } from "./TradingContext";

interface ActiveTradesProps {
  trades: Trade[];
}

export function ActiveTrades({ trades }: ActiveTradesProps) {
  return (
    <Card className="glass-card hover-scale purple-glow mt-6">
      <Title className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
        Active Trades
      </Title>
      <div className="mt-6 space-y-4">
        {trades.length === 0 ? (
          <div className="text-center py-8">
            <Text className="text-gray-400">No active trades</Text>
          </div>
        ) : (
          trades.map((trade, index) => (
            <motion.div
              key={trade.id}
              className="p-6 glass-card rounded-xl border border-purple-500/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Text className="text-xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
                    {trade.ticker ?? "Processing..."}
                  </Text>
                  {trade.name && (
                    <Text className="text-sm text-gray-400">
                      {trade.name}
                    </Text>
                  )}
                </div>
                <Badge
                  color={trade.status === "completed" ? "emerald" : "purple"}
                  className="capitalize px-3 py-1 text-sm font-medium rounded-full"
                  size="lg"
                >
                  {trade.status}
                </Badge>
              </div>
              {trade.recommendation && (
                <motion.div 
                  className="mt-4 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Text className="text-sm text-gray-300">
                    <span className="text-purple-400">Recommendation:</span> {trade.recommendation}
                  </Text>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
}
