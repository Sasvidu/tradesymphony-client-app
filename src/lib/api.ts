import axios from 'axios';

const AI_API_URL = process.env.API_URL || 'http://localhost:5050/api';

interface ReturnExpectationComponent {
  type: string;
  value: number;
  description: string;
}

export interface TradeResponse {
  status: string;
  message: string;
  data: {
    name: string;
    ticker: string;
    industry: {
      sector: string;
      subIndustry: string;
    };
    metadata: {
      founded: string | null;
      headquarters: string | null;
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
        factors: string[];
      };
      monitoringTriggers: string[];
    };
    quantitativeData: {
      valuationMetrics: {
        marketCap: number | null;
        peRatio: number | null;
        pbRatio: number | null;
      };
      growthRates: {
        revenueGrowth: {
          value: number | null;
          timeframe: string | null;
        };
      };
      financialRatios: {
        profitMargin: {
          value: number;
          unit: string;
        };
      };
      riskMetrics: {
        probability: number | null;
        impact: number | null;
      };
    };
    investmentRecommendationDetails: {
      priceTarget: number | null;
      timeframes: {
        startDate: string | null;
        endDate: string | null;
      };
      returnExpectations: {
        components: ReturnExpectationComponent[] | null;
      };
      positionSizingGuidance: {
        rationale: string;
        allocationPercentage: number;
        maximumDollarAmount: number;
        minimumDollarAmount: number;
        notes: string;
      };
    };
  };
}

export const tradingApi = {
  // AI Model API calls
  startTradeProcess: async (): Promise<string> => {
    try {
      // First, create a trade in our database with a unique processId
      const processId = `TRADE_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const dbTrade = await axios.post('/api/trades', { processId });
      
      // Then, start the AI trade process
      const response = await axios.post<TradeResponse>(AI_API_URL);
      if (response.data.status === 'success' && response.data.data) {
        // Update trade with AI response data
        await axios.put(`/api/trades/${processId}`, {
          ticker: response.data.data.ticker,
          name: response.data.data.name,
          sector: response.data.data.industry.sector,
          subIndustry: response.data.data.industry.subIndustry,
          recommendation: response.data.data.investmentThesis.recommendation,
          conviction: response.data.data.investmentThesis.conviction,
          expectedReturn: response.data.data.investmentThesis.expectedReturn.value,
          timeframe: response.data.data.investmentThesis.expectedReturn.timeframe,
          riskLevel: response.data.data.investmentThesis.riskAssessment.level,
          keyDrivers: response.data.data.investmentThesis.keyDrivers,
          tradeData: response.data.data,
        });
        return processId;
      }
      throw new Error('Failed to start trade process');
    } catch (error) {
      console.error('Error in startTradeProcess:', error);
      throw error;
    }
  },

  checkTradeStatus: async (processId: string): Promise<TradeResponse> => {
    const response = await axios.get<TradeResponse>(`${AI_API_URL}/${processId}`);
    if (response.data.status === 'success' && response.data.data) {
      // Update trade in our database
      await axios.put(`/api/trades/${processId}`, {
        ticker: response.data.data.ticker,
        name: response.data.data.name,
        sector: response.data.data.industry.sector,
        subIndustry: response.data.data.industry.subIndustry,
        recommendation: response.data.data.investmentThesis.recommendation,
        conviction: response.data.data.investmentThesis.conviction,
        expectedReturn: response.data.data.investmentThesis.expectedReturn.value,
        timeframe: response.data.data.investmentThesis.expectedReturn.timeframe,
        riskLevel: response.data.data.investmentThesis.riskAssessment.level,
        keyDrivers: response.data.data.investmentThesis.keyDrivers,
        tradeData: response.data.data,
      });
    }
    return response.data;
  },

  // Local database API calls
  getPortfolio: async () => {
    const response = await axios.get('/api/portfolio');
    return response.data;
  },

  updatePortfolio: async (amount: number, type: 'deposit' | 'withdrawal') => {
    const response = await axios.post('/api/portfolio', { amount, type });
    return response.data;
  },

  getTrades: async () => {
    const response = await axios.get('/api/trades');
    return response.data;
  },
};
