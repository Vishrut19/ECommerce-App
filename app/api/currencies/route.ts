import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse, Settings } from '@/types';

// For AgroOrder, we return the default currency from settings
export async function GET() {
  try {
    // Get settings for currency info
    let settings = await prisma.settings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 'default',
          companyName: 'AgroOrder',
          currency: 'INR',
          currencySymbol: '₹',
        },
      });
    }

    // Return single currency (INR for Indian wholesale market)
    const currency = {
      label: settings.currency,
      symbol: settings.currencySymbol,
    };

    return NextResponse.json({
      success: true,
      data: [currency],
    });
  } catch (error) {
    console.error('Get currencies error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch currencies',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
