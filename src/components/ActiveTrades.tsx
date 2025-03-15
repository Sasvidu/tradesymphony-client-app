"use client";

import { Card, Title, Text, Badge } from "@tremor/react";
import { motion } from "framer-motion";
import { Trade } from "./TradingContext";

interface ActiveTradesProps {
  trades: Trade[];
}

export function ActiveTrades({ trades }: ActiveTradesProps) {
  return (
    <Card className="bg-white shadow-md">
      <Title>Active Trades</Title>
      <div className="mt-4 space-y-4">
        {trades.length === 0 ? (
          <Text>No active trades</Text>
        ) : (
          trades.map((trade, index) => (
            <motion.div
              key={trade.id}
              className="p-4 border rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <Text className="font-semibold">
                    {trade.ticker ?? "Processing..."}
                  </Text>
                  {trade.name && (
                    <Text className="text-sm text-gray-500">
                      {trade.name}
                    </Text>
                  )}
                </div>
                <Badge
                  color={trade.status === "completed" ? "green" : "blue"}
                  className="capitalize"
                >
                  {trade.status}
                </Badge>
              </div>
              {trade.recommendation && (
                <div className="mt-2">
                  <Text className="text-sm">
                    Recommendation: {trade.recommendation}
                  </Text>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
}
