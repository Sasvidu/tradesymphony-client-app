import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

// This is a mock implementation since we can't directly use yfinance in a Next.js API route
// In a real implementation, you would use a backend service with yfinance installed
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const startDate = searchParams.get('startDate');
    
    if (!symbol || !startDate) {
      return NextResponse.json(
        { error: 'Symbol and startDate are required' },
        { status: 400 }
      );
    }

    // Format date for Yahoo Finance API
    const formattedStartDate = format(parseISO(startDate), 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Use Yahoo Finance API to get historical data
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&period1=${Math.floor(new Date(formattedStartDate).getTime() / 1000)}&period2=${Math.floor(new Date().getTime() / 1000)}`;
    
    const response = await axios.get(url);
    
    if (response.data.chart.result) {
      const result = response.data.chart.result[0];
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];
      
      // Get current price and initial price
      const initialPrice = quotes.close[0];
      const currentPrice = quotes.close[quotes.close.length - 1];
      
      // Calculate price change percentage
      const priceChangePercent = ((currentPrice - initialPrice) / initialPrice) * 100;
      
      // Format data for chart
      const chartData = timestamps.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        price: quotes.close[index],
      }));
      
      return NextResponse.json({
        symbol,
        startDate: formattedStartDate,
        endDate: today,
        initialPrice,
        currentPrice,
        priceChangePercent,
        chartData: chartData,
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
