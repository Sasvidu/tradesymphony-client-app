import axios from 'axios';

const AI_API_URL = process.env.API_URL || 'http://localhost:5050/api';

export interface TradeResponse {
  status: string;
  message: string;
  data?: {
    processId?: string;
    name?: string;
    ticker?: string;
    industry?: {
      sector: string;
      subIndustry: string;
    };
    investmentThesis?: {
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
    };
    quantitativeData?: {
      financialRatios?: {
        profitMargin?: {
          value: number;
          unit: string;
        };
      };
    };
  };
}

export const tradingApi = {
  // AI Model API calls
  startTradeProcess: async (): Promise<string> => {
    const response = await axios.post<TradeResponse>(AI_API_URL);
    if (response.data.status === 'success' && response.data.data?.processId) {
      // Create trade in our database
      await axios.post('/api/trades', {
        processId: response.data.data.processId,
      });
      return response.data.data.processId;
    }
    throw new Error('Failed to start trade process');
  },

  checkTradeStatus: async (processId: string): Promise<TradeResponse> => {
    const response = await axios.get<TradeResponse>(`${AI_API_URL}/${processId}`);
    if (response.data.status === 'success' && response.data.data) {
      // Update trade in our database
      await axios.put(`/api/trades/${processId}`, response.data.data);
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
