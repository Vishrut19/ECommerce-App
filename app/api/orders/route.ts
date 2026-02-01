import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema for creating an order
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    attributes: z.record(z.string(), z.string()).optional(),
  })).min(1, 'Order must contain at least one item'),
  currency: z.string().default('USD'),
});

// Schema for updating order status
const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
});

// GET /api/orders - List all orders (admin)
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Calculate total
    const total = validatedData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create order with items
    const order = await prisma.order.create({
      data: {
        total,
        currency: validatedData.currency,
        status: 'pending',
        items: {
          create: validatedData.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            attributes: item.attributes || {},
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders - Update order status (with order ID in body)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const validatedData = updateOrderStatusSchema.parse(data);

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: validatedData.status,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
