"use client";

import { useEffect, useState } from "react";
import { Card, Title, Text, Metric, Flex, AreaChart, Color } from "@tremor/react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import { useTradingContext, Trade } from "./TradingContext";
import axios from "axios";
import { format, parseISO } from "date-fns";

interface StockData {
  symbol: string;
  startDate: string;
  endDate: string;
  initialPrice: number;
  currentPrice: number;
  priceChangePercent: number;
  chartData: {
    date: string;
    price: number;
  }[];
}

export function StockPerformance() {
  const { allTrades } = useTradingContext();
  const [oldestTrade, setOldestTrade] = useState<Trade | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find the oldest completed trade with a ticker
  useEffect(() => {
    if (allTrades.length > 0) {
      const completedTrades = allTrades.filter(
        (trade) => trade.status === "completed" && trade.ticker
      );
      
      if (completedTrades.length > 0) {
        // Sort by createdAt date (oldest first)
        const sorted = [...completedTrades].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        setOldestTrade(sorted[0]);
      }
    }
  }, [allTrades]);

  // Fetch stock data when oldest trade is found
  useEffect(() => {
    if (oldestTrade?.ticker) {
      setLoading(true);
      setError(null);
      
      axios
        .get(`/api/stocks?symbol=${oldestTrade.ticker}&startDate=${oldestTrade.createdAt}`)
        .then((response) => {
          setStockData(response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching stock data:", err);
          setError("Failed to fetch stock data");
          setLoading(false);
        });
    }
  }, [oldestTrade]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy");
  };

  // Determine color based on price change
  const getColorClass = (): Color => {
    if (!stockData) return "gray";
    return stockData.priceChangePercent >= 0 ? "emerald" : "red";
  };

  if (!oldestTrade || !oldestTrade.ticker) {
    return (
      <Card className="glass-card hover-scale purple-glow">
        <Title className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-6">
          Stock Performance
        </Title>
        <Text>No completed trades found with ticker symbols.</Text>
      </Card>
    );
  }

  return (
    <Card className="glass-card hover-scale purple-glow">
      <Title className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-6">
        Stock Performance Since First Trade
      </Title>
      
      <div className="space-y-4">
        <Flex>
          <div>
            <Text>Oldest Trade</Text>
            <Metric className="text-white">{oldestTrade.ticker}</Metric>
            <Text className="text-gray-400">
              {oldestTrade.name} • {formatDate(oldestTrade.createdAt)}
            </Text>
          </div>
          
          {loading ? (
            <div className="animate-pulse h-16 w-32 bg-gray-700 rounded-md"></div>
          ) : error ? (
            <Text className="text-red-400">{error}</Text>
          ) : stockData ? (
            <div className="text-right">
              <Text>Price Change</Text>
              <Flex justifyContent="end" alignItems="baseline">
                <Metric className={stockData.priceChangePercent >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {stockData.priceChangePercent.toFixed(2)}%
                </Metric>
                {stockData.priceChangePercent >= 0 ? (
                  <ArrowUpIcon className="h-5 w-5 text-emerald-400" />
                ) : (
                  <ArrowDownIcon className="h-5 w-5 text-red-400" />
                )}
              </Flex>
              <Text className="text-gray-400">
                ${stockData.initialPrice.toFixed(2)} → ${stockData.currentPrice.toFixed(2)}
              </Text>
            </div>
          ) : null}
        </Flex>
        
        {!loading && !error && stockData && (
          <div className="mt-6">
            <Text className="mb-2">Price History</Text>
            <AreaChart
              className="h-72 mt-4"
              data={stockData.chartData}
              index="date"
              categories={["price"]}
              colors={[getColorClass()]}
              valueFormatter={(value) => `$${value.toFixed(2)}`}
              showLegend={false}
              showAnimation={true}
              curveType="natural"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
