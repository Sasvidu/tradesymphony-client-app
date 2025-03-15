"use client";

import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, Title, Button } from "@tremor/react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { PortfolioCard } from "./PortfolioCard";
import { ActiveTrades } from "./ActiveTrades";
import { tradingApi } from "../lib/api";
import { useTradingContext, Trade } from "./TradingContext";

interface Portfolio {
  id: string;
  balance: number;
  totalTrades: number;
  createdAt: string;
  updatedAt: string;
}

export function TradingDashboard() {
  const {
    activeTrades,
    setActiveTrades,
    portfolio,
    setPortfolio,
    isTrading,
    setIsTrading,
  } = useTradingContext();

  // Fetch portfolio data
  const { data: portfolioData }: UseQueryResult<Portfolio> = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => tradingApi.getPortfolio() as Promise<Portfolio>,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (portfolioData) {
      setPortfolio({
        balance: portfolioData.balance,
        totalTrades: portfolioData.totalTrades,
      });
    }
  }, [portfolioData, setPortfolio]);

  // Fetch active trades
  const { data: tradesData }: UseQueryResult<Trade[]> = useQuery({
    queryKey: ["trades"],
    queryFn: () => tradingApi.getTrades() as Promise<Trade[]>,
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (tradesData) {
      const activeTrades = tradesData.filter(
        (trade: Trade) => trade.status === "processing"
      );
      setActiveTrades(activeTrades);
    }
  }, [tradesData, setActiveTrades]);

  const startNewTrade = useCallback(async () => {
    if (activeTrades.length >= 3) return;

    try {
      const processId = await tradingApi.startTradeProcess();
      const newTrade: Trade = {
        id: Math.random().toString(),
        processId,
        status: "processing",
      };

      setActiveTrades((prev) => [...prev, newTrade]);
    } catch (error) {
      console.error("Failed to start trade:", error);
    }
  }, [activeTrades.length, setActiveTrades]);

  useEffect(() => {
    if (!isTrading) return;

    const interval = setInterval(async () => {
      const updatedTrades = await Promise.all(
        activeTrades.map(async (trade: Trade) => {
          if (trade.status === "completed") return trade;

          try {
            const response = await tradingApi.checkTradeStatus(trade.processId);
            if (response.status === "success" && response.data) {
              // Update portfolio when trade completes
              if (trade.status === "processing") {
                setPortfolio((prev) => ({
                  ...prev,
                  totalTrades: prev.totalTrades + 1,
                }));
              }

              return {
                ...trade,
                status: "completed",
                ticker: response.data.ticker,
                name: response.data.name,
                recommendation: response.data.investmentThesis?.recommendation,
              };
            }
          } catch (error) {
            console.error("Error checking trade status:", error);
          }
          return trade;
        })
      );

      setActiveTrades(updatedTrades);

      // Start new trade if we have less than 3 active trades
      if (updatedTrades.filter((t) => t.status === "processing").length < 3) {
        startNewTrade();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isTrading, activeTrades, setActiveTrades, setPortfolio, startNewTrade]);

  const defaultBalance = 100000;
  const defaultTotalTrades = 0;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <PortfolioCard
          balance={portfolioData?.balance ?? defaultBalance}
          totalTrades={portfolioData?.totalTrades ?? defaultTotalTrades}
          activeTradesCount={activeTrades.length}
        />
        <Card className="bg-white shadow-md">
          <Title>Trading Controls</Title>
          <div className="mt-4">
            <Button
              onClick={() => setIsTrading((prev) => !prev)}
              color={isTrading ? "red" : "blue"}
              className="w-full"
            >
              {isTrading ? "Stop Trading" : "Start Trading"}
            </Button>
          </div>
        </Card>
      </motion.div>

      <ActiveTrades trades={activeTrades} />
    </div>
  );
}
