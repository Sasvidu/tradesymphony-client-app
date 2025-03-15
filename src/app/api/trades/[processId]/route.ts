import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { Prisma } from '@prisma/client';

const tradeWithTransactions = Prisma.validator<Prisma.TradeDefaultArgs>()({
  include: { transactions: true },
});

type TradeWithTransactions = Prisma.TradeGetPayload<typeof tradeWithTransactions>;

export async function PUT(
  request: Request,
  { params }: { params: { processId: string } }
) {
  try {
    const data = await request.json();
    
    if (!params.processId) {
      return NextResponse.json(
        { error: 'Process ID is required' },
        { status: 400 }
      );
    }

    const trade = await prisma.trade.update({
      where: {
        processId: params.processId,
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
