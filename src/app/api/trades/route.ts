import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { Prisma } from '@prisma/client';

const tradeWithTransactions = Prisma.validator<Prisma.TradeDefaultArgs>()({
  include: { transactions: true },
});

type TradeWithTransactions = Prisma.TradeGetPayload<typeof tradeWithTransactions>;

export async function GET() {
  try {
    const trades = await prisma.trade.findMany({
      orderBy: { createdAt: 'desc' },
      include: { transactions: true },
    });
    return NextResponse.json(trades);
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { processId } = await request.json();
    
    if (!processId) {
      return NextResponse.json(
        { error: 'Process ID is required' },
        { status: 400 }
      );
    }

    const trade = await prisma.trade.create({
      data: {
        processId,
        status: 'processing',
      },
      include: { transactions: true },
    });
    return NextResponse.json(trade);
  } catch (error) {
    console.error('Error creating trade:', error);
    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { processId, ...data } = await request.json();
    
    if (!processId) {
      return NextResponse.json(
        { error: 'Process ID is required' },
        { status: 400 }
      );
    }

    const trade = await prisma.trade.update({
      where: {
        processId,
      },
      data,
      include: { transactions: true },
    });
    return NextResponse.json(trade);
  } catch (error) {
    console.error('Error updating trade:', error);
    return NextResponse.json(
      { error: 'Failed to update trade' },
      { status: 500 }
    );
  }
}
