import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';

export async function GET() {
  try {
    const trades = await prisma.trade.findMany({
      orderBy: { createdAt: 'desc' },
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
    const trade = await prisma.trade.create({
      data: {
        processId,
        status: 'processing',
      },
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
