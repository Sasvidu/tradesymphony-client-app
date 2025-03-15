"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface Trade {
  id: string;
  processId: string;
  status: string;
  ticker?: string;
  name?: string;
  recommendation?: string;
}

interface TradingContextType {
  activeTrades: Trade[];
  setActiveTrades: Dispatch<SetStateAction<Trade[]>>;
  portfolio: {
    balance: number;
    totalTrades: number;
  };
  setPortfolio: Dispatch<SetStateAction<{ balance: number; totalTrades: number }>>;
  isTrading: boolean;
  setIsTrading: Dispatch<SetStateAction<boolean>>;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export function TradingProvider({ children }: { children: ReactNode }) {
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [portfolio, setPortfolio] = useState({ balance: 100000, totalTrades: 0 });
  const [isTrading, setIsTrading] = useState(false);

  return (
    <TradingContext.Provider
      value={{
        activeTrades,
        setActiveTrades,
        portfolio,
        setPortfolio,
        isTrading,
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
    throw new Error('useTradingContext must be used within a TradingProvider');
  }
  return context;
}

export type { Trade };
