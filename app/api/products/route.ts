import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/data/products';
import { ApiResponse, Product } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const inStock = searchParams.get('inStock');
    
    let filtered = products;
    
    // Filter by category
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    
    // Filter by stock status
    if (inStock === 'true') {
      filtered = filtered.filter(p => p.inStock);
    } else if (inStock === 'false') {
      filtered = filtered.filter(p => !p.inStock);
    }
    
    const response: ApiResponse<Product[]> = {
      success: true,
      data: filtered,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<Product[]> = {
      success: false,
      error: {
        message: 'Failed to fetch products',
        code: 'INTERNAL_ERROR',
      },
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Add Zod validation
    // TODO: Add to database (currently using hardcoded data)
    
    const newProduct: Product = {
      ...body,
      id: `product-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // In a real app, save to database
    products.push(newProduct);
    
    const response: ApiResponse<Product> = {
      success: true,
      data: newProduct,
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const response: ApiResponse<Product> = {
      success: false,
      error: {
        message: 'Failed to create product',
        code: 'INTERNAL_ERROR',
      },
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
