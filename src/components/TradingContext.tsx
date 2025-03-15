"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

export interface Trade {
  id: string;
  processId: string;
  status: "processing" | "completed" | "failed";
  ticker?: string;
  name?: string;
  sector?: string;
  subIndustry?: string;
  recommendation?: string;
  conviction?: string;
  expectedReturn?: number;
  timeframe?: string;
  riskLevel?: string;
  buyAmount?: number;
  buyPrice?: number;
  keyDrivers?: string[];
  createdAt: string;
  completedAt?: string;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  tradeId: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  total: number;
  createdAt: string;
  status: "pending" | "completed" | "failed";
}

interface Portfolio {
  balance: number;
  totalTrades: number;
}

interface TradingContextType {
  activeTrades: Trade[];
  allTrades: Trade[];
  portfolio: Portfolio;
  isTrading: boolean;
  setActiveTrades: Dispatch<SetStateAction<Trade[]>>;
  setAllTrades: Dispatch<SetStateAction<Trade[]>>;
  setPortfolio: Dispatch<SetStateAction<Portfolio>>;
  setIsTrading: Dispatch<SetStateAction<boolean>>;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export function TradingProvider({ children }: { children: ReactNode }) {
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>({
    balance: 100000,
    totalTrades: 0,
  });
  const [isTrading, setIsTrading] = useState(false);

  return (
    <TradingContext.Provider
      value={{
        activeTrades,
        allTrades,
        portfolio,
        isTrading,
        setActiveTrades,
        setAllTrades,
        setPortfolio,
        setIsTrading,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
}

export function useTradingContext() {
  const context = useContext(TradingContext);
  if (context === undefined) {
    throw new Error("useTradingContext must be used within a TradingProvider");
  }
  return context;
}
