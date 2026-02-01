import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/data/products';
import { ApiResponse, Product } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = products.find(p => p.id === id);
    
    if (!product) {
      const response: ApiResponse<Product> = {
        success: false,
        error: {
          message: 'Product not found',
          code: 'NOT_FOUND',
        },
      };
      
      return NextResponse.json(response, { status: 404 });
    }
    
    const response: ApiResponse<Product> = {
      success: true,
      data: product,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<Product> = {
      success: false,
      error: {
        message: 'Failed to fetch product',
        code: 'INTERNAL_ERROR',
      },
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      const response: ApiResponse<Product> = {
        success: false,
        error: {
          message: 'Product not found',
          code: 'NOT_FOUND',
        },
      };
      
      return NextResponse.json(response, { status: 404 });
    }
    
    // TODO: Add Zod validation
    const updatedProduct: Product = {
      ...products[index],
      ...body,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };
    
    products[index] = updatedProduct;
    
    const response: ApiResponse<Product> = {
      success: true,
      data: updatedProduct,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<Product> = {
      success: false,
      error: {
        message: 'Failed to update product',
        code: 'INTERNAL_ERROR',
      },
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: 'Product not found',
          code: 'NOT_FOUND',
        },
      };
      
      return NextResponse.json(response, { status: 404 });
    }
    
    products.splice(index, 1);
    
    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: {
        message: 'Failed to delete product',
        code: 'INTERNAL_ERROR',
      },
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
