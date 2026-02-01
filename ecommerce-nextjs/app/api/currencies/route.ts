import { NextResponse } from 'next/server';
import { currencies } from '@/data/products';
import { ApiResponse, Currency } from '@/types';

export async function GET() {
  try {
    const response: ApiResponse<Currency[]> = {
      success: true,
      data: currencies,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<Currency[]> = {
      success: false,
      error: {
        message: 'Failed to fetch currencies',
        code: 'INTERNAL_ERROR',
      },
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
