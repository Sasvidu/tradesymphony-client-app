"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, Title, Button, Text } from "@tremor/react";
import { useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { PortfolioCard } from "./PortfolioCard";
import { ActiveTrades } from "./ActiveTrades";
import { tradingApi } from "../lib/api";
import { useTradingContext, Trade, Transaction } from "./TradingContext";
import { useRouter } from "next/navigation";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface Portfolio {
  id: string;
  balance: number;
  totalTrades: number;
  createdAt: string;
  updatedAt: string;
}

interface TradeResponse {
  status: string;
  message: string;
  data: {
    name: string;
    ticker: string;
    industry: {
      sector: string;
      subIndustry: string;
    };
    investmentThesis: {
      recommendation: string;
      conviction: string;
      keyDrivers: string[];
      expectedReturn: {
        value: number;
        timeframe: string;
      };
      riskAssessment: {
        level: string;
      };
    };
    investmentRecommendationDetails: {
      positionSizingGuidance: {
        allocationPercentage: number;
        maximumDollarAmount: number;
        minimumDollarAmount: number;
      };
    };
  };
}

export function TradingDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    activeTrades,
    allTrades,
    portfolio,
    isTrading,
    setActiveTrades,
    setAllTrades,
    setPortfolio,
    setIsTrading,
  } = useTradingContext();

  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

  // Track trade timeouts
  const tradeTimeouts = useRef<{ [key: string]: NodeJS.Timeout[] }>({});

  // Fetch portfolio data
  const { data: portfolioData }: UseQueryResult<Portfolio> = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => tradingApi.getPortfolio() as Promise<Portfolio>,
    refetchInterval: isTrading ? 5000 : false,
  });

  useEffect(() => {
    if (portfolioData) {
      setPortfolio({
        balance: portfolioData.balance,
        totalTrades: portfolioData.totalTrades,
      });
    }
  }, [portfolioData, setPortfolio]);

  // Fetch all trades
  const { data: tradesData }: UseQueryResult<Trade[]> = useQuery({
    queryKey: ["trades"],
    queryFn: () => tradingApi.getTrades() as Promise<Trade[]>,
    refetchInterval: isTrading ? 5000 : false,
  });

  useEffect(() => {
    if (tradesData) {
      // Only set trades that are actually in processing state
      const active = tradesData.filter(trade => 
        trade.status === "processing" && (!trade.transactions || trade.transactions.length === 0)
      );
      setActiveTrades(active);
      setAllTrades(tradesData);
    }
  }, [tradesData, setActiveTrades, setAllTrades]);

  const startNewTrade = useCallback(async () => {
    if (activeTrades.length >= 3) return;

    try {
      const processId = await tradingApi.startTradeProcess();
      const newTrade: Trade = {
        id: Math.random().toString(),
        processId,
        status: "processing",
        createdAt: new Date().toISOString(),
      };

      setActiveTrades((prev: Trade[]) => [...prev, newTrade]);
      setAllTrades((prev: Trade[]) => [...prev, newTrade]);

      // Wait 1 minute before starting to check
      const initialTimeout = setTimeout(async () => {
        let attempts = 0;
        const maxAttempts = 24; // 2 minutes with 5-second intervals

        const checkInterval = setInterval(async () => {
          attempts++;
          try {
            const response: TradeResponse = await tradingApi.checkTradeStatus(processId);
            
            if (response.status === "success" && response.data) {
              clearInterval(checkInterval);
              
              const tradeAmount = Math.min(
                response.data.investmentRecommendationDetails.positionSizingGuidance.maximumDollarAmount,
                portfolio.balance * (response.data.investmentRecommendationDetails.positionSizingGuidance.allocationPercentage / 100)
              );

              const transaction: Transaction = {
                id: Math.random().toString(),
                tradeId: newTrade.id,
                type: "buy",
                amount: tradeAmount,
                price: 0,
                total: tradeAmount,
                createdAt: new Date().toISOString(),
                status: "completed"
              };

              const updatedTrade: Trade = {
                ...newTrade,
                status: "completed",
                ticker: response.data.ticker,
                name: response.data.name,
                sector: response.data.industry.sector,
                subIndustry: response.data.industry.subIndustry,
                recommendation: response.data.investmentThesis.recommendation,
                conviction: response.data.investmentThesis.conviction,
                expectedReturn: response.data.investmentThesis.expectedReturn.value,
                timeframe: response.data.investmentThesis.expectedReturn.timeframe,
                riskLevel: response.data.investmentThesis.riskAssessment.level,
                buyAmount: tradeAmount,
                keyDrivers: response.data.investmentThesis.keyDrivers,
                completedAt: new Date().toISOString(),
                transactions: [transaction]
              };

              // Update portfolio first
              await tradingApi.updatePortfolio(tradeAmount, "withdrawal", newTrade.id);
              
              // Then update trade states
              setActiveTrades(prev => prev.filter(t => t.id !== newTrade.id));
              setAllTrades(prev => prev.map(t => t.id === newTrade.id ? updatedTrade : t));
              
              setPortfolio((prev) => ({
                ...prev,
                balance: prev.balance - tradeAmount,
                totalTrades: prev.totalTrades + 1
              }));

              queryClient.invalidateQueries({ queryKey: ["portfolio"] });
            }
          } catch (error) {
            console.error("Error checking trade status:", error);
            if (attempts >= maxAttempts) {
              clearInterval(checkInterval);
              const failedTrade: Trade = {
                ...newTrade,
                status: "failed",
                completedAt: new Date().toISOString()
              };
              setActiveTrades(prev => prev.filter(t => t.id !== newTrade.id));
              setAllTrades(prev => prev.map(t => t.id === newTrade.id ? failedTrade : t));
            }
          }
        }, 5000);

        tradeTimeouts.current[newTrade.id] = [initialTimeout, checkInterval];
      }, 60000);

      tradeTimeouts.current[newTrade.id] = [initialTimeout];
    } catch (error) {
      console.error("Failed to start trade:", error);
    }
  }, [activeTrades.length, setActiveTrades, setAllTrades, setPortfolio, portfolio.balance, queryClient]);

  // Handle trade status polling
  useEffect(() => {
    if (isTrading && activeTrades.length > 0) {
      const interval = window.setInterval(async () => {
        for (const trade of activeTrades) {
          // Skip if trade is not in processing state or already has transactions
          if (trade.status !== "processing" || (trade.transactions && trade.transactions.length > 0)) {
            continue;
          }
          
          try {
            const response = await tradingApi.checkTradeStatus(trade.processId);
            if (response.data && response.status === "success") {
              const tradeAmount = Math.min(
                response.data.investmentRecommendationDetails.positionSizingGuidance.maximumDollarAmount,
                portfolio.balance * (response.data.investmentRecommendationDetails.positionSizingGuidance.allocationPercentage / 100)
              );

              console.log("Creating transaction for trade:", trade.id);
              
              const transaction: Transaction = {
                id: Math.random().toString(),
                tradeId: trade.id,
                type: "buy",
                amount: tradeAmount,
                price: 0,
                total: tradeAmount,
                createdAt: new Date().toISOString(),
                status: "completed"
              };

              const completedTrade: Trade = {
                ...trade,
                status: "completed",
                ticker: response.data.ticker,
                name: response.data.name,
                sector: response.data.industry.sector,
                subIndustry: response.data.industry.subIndustry,
                recommendation: response.data.investmentThesis.recommendation,
                conviction: response.data.investmentThesis.conviction,
                expectedReturn: response.data.investmentThesis.expectedReturn.value,
                timeframe: response.data.investmentThesis.expectedReturn.timeframe,
                riskLevel: response.data.investmentThesis.riskAssessment.level,
                buyAmount: tradeAmount,
                keyDrivers: response.data.investmentThesis.keyDrivers,
                completedAt: new Date().toISOString(),
                transactions: [transaction]
              };

              console.log("Completing trade:", trade.id);

              // Update portfolio first
              await tradingApi.updatePortfolio(tradeAmount, "withdrawal", trade.id);
              
              // Then update trade states - ensure we remove from active trades
              setActiveTrades(prev => prev.filter(t => t.id !== trade.id));
              setAllTrades(prev => prev.map(t => t.id === trade.id ? completedTrade : t));
              
              // Update portfolio state
              setPortfolio((prev) => ({
                ...prev,
                balance: prev.balance - tradeAmount,
                totalTrades: prev.totalTrades + 1
              }));

              // Force refresh both queries to ensure states are in sync
              await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
              await queryClient.invalidateQueries({ queryKey: ["trades"] });
            }
          } catch (error) {
            console.error(`Error checking trade status for ${trade.processId}:`, error);
          }
        }
      }, 5000);

      setPollingInterval(interval);
      return () => {
        if (interval) window.clearInterval(interval);
        setPollingInterval(null);
      };
    }
  }, [isTrading, activeTrades, queryClient, setActiveTrades, setAllTrades, portfolio.balance, setPortfolio]);

  const startTrading = async () => {
    try {
      setIsTrading(true);
      const processId = await tradingApi.startTradeProcess();
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    } catch (error) {
      console.error("Error starting trade:", error);
      setIsTrading(false);
    }
  };

  const stopTrading = () => {
    setIsTrading(false);
    if (pollingInterval) {
      window.clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Clean up trades when stopping
  useEffect(() => {
    if (!isTrading) {
      Object.entries(tradeTimeouts.current).forEach(([tradeId, timeouts]) => {
        timeouts.forEach(clearTimeout);
        setActiveTrades((prev: Trade[]) => 
          prev.map(t => 
            t.id === tradeId && t.status === "processing" 
              ? { ...t, status: "failed", completedAt: new Date().toISOString() } 
              : t
          )
        );
        setAllTrades((prev: Trade[]) => 
          prev.map(t => 
            t.id === tradeId && t.status === "processing" 
              ? { ...t, status: "failed", completedAt: new Date().toISOString() } 
              : t
          )
        );
      });
      tradeTimeouts.current = {};
    }
  }, [isTrading, setActiveTrades, setAllTrades]);

  // Start new trades when possible
  useEffect(() => {
    if (!isTrading) return;

    const interval = setInterval(() => {
      if (activeTrades.filter(t => t.status === "processing").length < 3) {
        startNewTrade();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isTrading, activeTrades, startNewTrade]);

  return (
    <div className="min-h-screen p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            TradeSymphony
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              onClick={() => setIsTrading(!isTrading)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                isTrading
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
              }`}
            >
              {isTrading ? "Stop Trading" : "Start Trading"}
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PortfolioCard
              balance={portfolio.balance}
              totalTrades={portfolio.totalTrades}
              activeTradesCount={activeTrades.filter(t => t.status === "processing").length}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ActiveTrades trades={activeTrades} />
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
              Trade History
            </Title>
            <div className="space-y-4">
              {allTrades.map((trade) => (
                <motion.div
                  key={trade.id}
                  className="p-4 glass-card rounded-xl border border-purple-500/10 cursor-pointer hover:border-purple-500/30 transition-all"
                  onClick={() => router.push(`/trade/${trade.id}`)}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {trade.ticker || "Processing..."}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(trade.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {trade.buyAmount && (
                        <p className="text-purple-400">
                          ${trade.buyAmount.toLocaleString()}
                        </p>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          trade.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : trade.status === "failed"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-purple-500/20 text-purple-400"
                        }`}
                      >
                        {trade.status}
                      </span>
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
