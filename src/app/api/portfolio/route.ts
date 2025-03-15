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
    const { amount, type } = await request.json();
    const portfolio = await prisma.portfolio.findFirst();

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    const updatedPortfolio = await prisma.$transaction(async (tx) => {
      // Create transaction record
      await tx.transaction.create({
        data: {
          type,
          amount: Number(amount),
        },
      });

      // Update portfolio balance
      const newBalance = type === 'deposit' 
        ? portfolio.balance + Number(amount)
        : portfolio.balance - Number(amount);

      return tx.portfolio.update({
        where: { id: portfolio.id },
        data: { balance: newBalance },
      });
    });

    return NextResponse.json(updatedPortfolio);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}
