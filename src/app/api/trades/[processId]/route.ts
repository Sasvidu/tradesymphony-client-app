import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { processId: string } }
) {
  try {
    const { processId } = params;
    const data = await request.json();

    const trade = await prisma.trade.findUnique({
      where: { processId },
    });

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      );
    }

    const updatedTrade = await prisma.trade.update({
      where: { processId },
      data: {
        status: 'completed',
        ticker: data.ticker,
        name: data.name,
        recommendation: data.investmentThesis?.recommendation,
        buyPrice: data.currentPrice,
        expectedReturn: data.investmentThesis?.expectedReturn?.value,
        timeframe: data.investmentThesis?.expectedReturn?.timeframe,
        riskLevel: data.investmentThesis?.riskAssessment?.level,
        completedAt: new Date(),
        tradeData: data,
      },
    });

    return NextResponse.json(updatedTrade);
  } catch (error) {
    console.error('Error updating trade:', error);
    return NextResponse.json(
      { error: 'Failed to update trade' },
      { status: 500 }
    );
  }
}
