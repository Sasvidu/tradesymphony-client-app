import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';

export async function GET() {
  try {
    const portfolio = await prisma.portfolio.findFirst();
    if (!portfolio) {
      // Create initial portfolio if it doesn't exist
      const newPortfolio = await prisma.portfolio.create({
        data: {
          balance: 100000, // Initial balance of $100,000
        },
      });
      return NextResponse.json(newPortfolio);
    }
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { amount, type, tradeId } = await request.json();

    if (!amount || !type || (type === 'withdrawal' && !tradeId)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const portfolio = await prisma.portfolio.findFirst();
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // For withdrawals, verify trade exists
    if (type === 'withdrawal' && tradeId) {
      const trade = await prisma.trade.findUnique({
        where: { id: tradeId },
      });
      if (!trade) {
        return NextResponse.json(
          { error: 'Trade not found' },
          { status: 404 }
        );
      }
    }

    const updatedPortfolio = await prisma.$transaction(async (tx) => {
      // For withdrawals, create a trade transaction
      if (type === 'withdrawal' && tradeId) {
        await tx.transaction.create({
          data: {
            type: 'buy',
            amount: Number(amount),
            price: 0, // Market price will be updated later
            total: Number(amount),
            status: 'completed',
            tradeId,
          },
        });
      }

      // Update portfolio balance
      const newBalance = type === 'deposit' 
        ? portfolio.balance + Number(amount)
        : portfolio.balance - Number(amount);

      if (newBalance < 0) {
        throw new Error('Insufficient funds');
      }

      return tx.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: newBalance,
          totalTrades: type === 'withdrawal' 
            ? portfolio.totalTrades + 1 
            : portfolio.totalTrades,
        },
      });
    });

    return NextResponse.json(updatedPortfolio);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    if (error instanceof Error && error.message === 'Insufficient funds') {
      return NextResponse.json(
        { error: 'Insufficient funds' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}
