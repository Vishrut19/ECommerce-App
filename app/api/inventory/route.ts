import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse, InventoryItem, PaginatedResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Filters
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true';
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { supplierName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get products
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [
        { stockQty: 'asc' }, // Show lowest stock first
        { name: 'asc' },
      ],
      skip,
      take: limit,
    });

    // Transform to inventory items
    let inventoryItems: InventoryItem[] = products.map((product) => ({
      product: product as any,
      stockQty: product.stockQty,
      lowStockAlert: product.lowStockAlert,
      isLowStock: product.stockQty <= product.lowStockAlert,
    }));

    // Filter low stock if requested
    if (lowStockOnly) {
      inventoryItems = inventoryItems.filter((item) => item.isLowStock);
    }

    // Get total count
    const total = lowStockOnly
      ? inventoryItems.length
      : await prisma.product.count({ where });

    const response: PaginatedResponse<InventoryItem> = {
      success: true,
      data: inventoryItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get inventory error:', error);
    const response: ApiResponse<InventoryItem[]> = {
      success: false,
      error: {
        message: 'Failed to fetch inventory',
        code: 'INTERNAL_ERROR',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// Bulk update stock quantities
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!Array.isArray(body.updates)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Updates array is required',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    // Update each product's stock
    const updates = body.updates as Array<{
      productId: string;
      stockQty?: number;
      isActive?: boolean;
    }>;

    const results = await prisma.$transaction(
      updates.map((update) =>
        prisma.product.update({
          where: { id: update.productId },
          data: {
            ...(update.stockQty !== undefined && { stockQty: update.stockQty }),
            ...(update.isActive !== undefined && { isActive: update.isActive }),
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: results.length,
      },
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to update inventory',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
