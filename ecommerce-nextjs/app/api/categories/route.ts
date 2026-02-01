import { NextResponse } from 'next/server';
import { categories } from '@/data/products';
import { ApiResponse, Category } from '@/types';

export async function GET() {
  try {
    const response: ApiResponse<Category[]> = {
      success: true,
      data: categories,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<Category[]> = {
      success: false,
      error: {
        message: 'Failed to fetch categories',
        code: 'INTERNAL_ERROR',
      },
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
