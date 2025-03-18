import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';

export async function GET() {
  try {
    // Get all completed transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'completed',
      },
      include: {
        trade: {
          select: {
            ticker: true,
            name: true,
            sector: true,
          },
        },
      },
    });

    // Get current portfolio balance
    const portfolio = await prisma.portfolio.findFirst();
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Aggregate transactions by company
    const holdings = transactions.reduce((acc, transaction) => {
      const ticker = transaction.trade.ticker;
      if (!ticker) return acc;

      if (!acc[ticker]) {
        acc[ticker] = {
          ticker,
          name: transaction.trade.name || ticker,
          sector: transaction.trade.sector || 'Unknown',
          totalValue: 0,
        };
      }

      // Add for buys, subtract for sells
      acc[ticker].totalValue += transaction.type === 'buy' 
        ? transaction.total 
        : -transaction.total;

      return acc;
    }, {} as Record<string, { ticker: string; name: string; sector: string; totalValue: number; }>);

    // Convert to array and calculate percentages
    const holdingsArray = Object.values(holdings)
      .filter(holding => holding.totalValue > 0) // Only include positive holdings
      .map(holding => ({
        ...holding,
        percentage: (holding.totalValue / portfolio.balance) * 100,
      }));

    // Calculate cash position
    const totalInvested = holdingsArray.reduce((sum, holding) => sum + holding.totalValue, 0);
    const cashPosition = {
      ticker: 'CASH',
      name: 'Cash',
      sector: 'Cash',
      totalValue: portfolio.balance - totalInvested,
      percentage: ((portfolio.balance - totalInvested) / portfolio.balance) * 100,
    };

    // Add cash position to holdings if there is any cash
    if (cashPosition.totalValue > 0) {
      holdingsArray.push(cashPosition);
    }

    return NextResponse.json({
      totalPortfolioValue: portfolio.balance,
      holdings: holdingsArray,
    });
  } catch (error) {
    console.error('Error fetching portfolio distribution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio distribution' },
      { status: 500 }
    );
  }
}
