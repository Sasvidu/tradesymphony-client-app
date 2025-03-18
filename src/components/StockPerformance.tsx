"use client";

import { useEffect, useState } from "react";
import { Card, Title, Text, Metric, Flex, AreaChart, Color } from "@tremor/react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
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

interface Trade {
  id: string;
  ticker: string;
  name: string;
  transactions: {
    id: string;
    createdAt: string;
    status: string;
  }[];
}

export function StockPerformance() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stockDataList, setStockDataList] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch completed trades
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await axios.get('/api/trades/completed');
        setTrades(response.data);
      } catch (err) {
        console.error('Error fetching trades:', err);
        setError('Failed to fetch trades');
      }
    };
    fetchTrades();
  }, []);

  // Fetch stock data for each trade
  useEffect(() => {
    const fetchStockData = async () => {
      if (trades.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        const stockDataPromises = trades.map(trade => {
          // Get the latest transaction date
          const latestTransaction = [...trade.transactions].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

          return axios.get(`/api/stocks?symbol=${trade.ticker}&startDate=${latestTransaction.createdAt}`);
        });

        const responses = await Promise.all(stockDataPromises);
        setStockDataList(responses.map(response => response.data));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to fetch stock data');
        setLoading(false);
      }
    };

    fetchStockData();
  }, [trades]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy");
  };

  // Determine color based on price change
  const getColorClass = (priceChangePercent: number): Color => {
    return priceChangePercent >= 0 ? "emerald" : "red";
  };

  if (loading) {
    return (
      <Card className="glass-card hover-scale purple-glow">
        <Title className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-6">
          Stock Performance
        </Title>
        <div className="animate-pulse h-16 w-32 bg-gray-700 rounded-md"></div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card hover-scale purple-glow">
        <Title className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-6">
          Stock Performance
        </Title>
        <Text className="text-red-400">{error}</Text>
      </Card>
    );
  }

  if (stockDataList.length === 0) {
    return (
      <Card className="glass-card hover-scale purple-glow">
        <Title className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-6">
          Stock Performance
        </Title>
        <Text>No stock data available.</Text>
      </Card>
    );
  }

  return (
    <Card className="glass-card hover-scale purple-glow">
      <Title className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-6">
        Stock Performance Since Investment
      </Title>
      
      <div className="space-y-8">
        {stockDataList.map((stockData, index) => {
          const trade = trades[index];
          const latestTransaction = [...trade.transactions].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

          return (
            <div key={stockData.symbol} className="border-b border-gray-800 pb-8 last:border-b-0">
              <Flex>
                <div>
                  <Text>Stock Symbol</Text>
                  <Metric className="text-white">{stockData.symbol}</Metric>
                  <Text className="text-gray-400">
                    {trade.name} • Invested on {formatDate(latestTransaction.createdAt)}
                  </Text>
                </div>
                
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
              </Flex>
              
              <div className="mt-6">
                <Text className="mb-2">Price History</Text>
                <AreaChart
                  className="h-72 mt-4"
                  data={stockData.chartData}
                  index="date"
                  categories={["price"]}
                  colors={[getColorClass(stockData.priceChangePercent)]}
                  valueFormatter={(value) => `$${value.toFixed(2)}`}
                  showLegend={false}
                  showAnimation={true}
                  curveType="natural"
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
