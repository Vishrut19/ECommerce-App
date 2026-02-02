import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse, Order, PaginatedResponse } from '@/types';
import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  unitType: z.string(),
  pricePerUnit: z.number(),
});

const orderSchema = z.object({
  buyerName: z.string().min(1, 'Name is required'),
  buyerEmail: z.string().email('Valid email is required'),
  buyerPhone: z.string().min(1, 'Phone is required'),
  buyerCompany: z.string().optional(),
  buyerAddress: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
});

function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AGO-${year}${month}${day}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = orderSchema.parse(body);

    // Calculate totals and validate products
    let totalAmount = 0;
    const orderItems: Array<{
      product: { connect: { id: string } };
      productName: string;
      quantity: number;
      unitType: any;
      pricePerUnit: number;
      subtotal: number;
    }> = [];

    for (const item of validatedData.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: { message: `Product not found: ${item.productId}`, code: 'PRODUCT_NOT_FOUND' } },
          { status: 400 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { success: false, error: { message: `Product ${product.name} is no longer available`, code: 'PRODUCT_INACTIVE' } },
          { status: 400 }
        );
      }

      if (item.quantity < product.minOrderQty) {
        return NextResponse.json(
          { success: false, error: { message: `Minimum order quantity for ${product.name} is ${product.minOrderQty}`, code: 'MIN_QTY_NOT_MET' } },
          { status: 400 }
        );
      }

      if (item.quantity > product.stockQty) {
        return NextResponse.json(
          { success: false, error: { message: `Insufficient stock for ${product.name}. Available: ${product.stockQty}`, code: 'INSUFFICIENT_STOCK' } },
          { status: 400 }
        );
      }

      const subtotal = item.quantity * item.pricePerUnit;
      totalAmount += subtotal;

      orderItems.push({
        product: { connect: { id: product.id } },
        productName: product.name,
        quantity: item.quantity,
        unitType: product.unitType,
        pricePerUnit: item.pricePerUnit,
        subtotal,
      });
    }

    // Create order and update stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          buyerName: validatedData.buyerName,
          buyerEmail: validatedData.buyerEmail,
          buyerPhone: validatedData.buyerPhone,
          buyerCompany: validatedData.buyerCompany || null,
          buyerAddress: validatedData.buyerAddress || null,
          notes: validatedData.notes || null,
          totalAmount,
          status: 'PENDING',
          items: {
            create: orderItems as any,
          },
        },
        include: {
          items: true,
        },
      });

      // Update stock quantities (reserve stock)
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.product.connect.id },
          data: {
            stockQty: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    const response: ApiResponse<{ orderNumber: string; orderId: string }> = {
      success: true,
      data: {
        orderNumber: order.orderNumber,
        orderId: order.id,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: error.issues?.[0]?.message || 'Validation error', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to create order', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filters
    const status = searchParams.get('status');
    const buyerEmail = searchParams.get('buyerEmail');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (buyerEmail) {
      where.buyerEmail = buyerEmail;
    }
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { buyerName: { contains: search, mode: 'insensitive' } },
        { buyerEmail: { contains: search, mode: 'insensitive' } },
        { buyerCompany: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Execute queries
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const response: PaginatedResponse<Order> = {
      success: true,
      data: orders as unknown as Order[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch orders', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
