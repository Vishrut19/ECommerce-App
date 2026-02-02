import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse, Order } from '@/types';
import { z } from 'zod';

// Valid order status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

// Validation schema for updating order status
const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'DELIVERED', 'CANCELLED']),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to find by ID first, then by orderNumber
    let order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                unitType: true,
                pricePerUnit: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If not found by ID, try by orderNumber
    if (!order) {
      order = await prisma.order.findUnique({
        where: { orderNumber: id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  unitType: true,
                  pricePerUnit: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    if (!order) {
      const response: ApiResponse<Order> = {
        success: false,
        error: {
          message: 'Order not found',
          code: 'NOT_FOUND',
        },
      };

      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Order> = {
      success: true,
      data: order as unknown as Order,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get order error:', error);
    const response: ApiResponse<Order> = {
      success: false,
      error: {
        message: 'Failed to fetch order',
        code: 'INTERNAL_ERROR',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// PATCH for status updates
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateOrderStatusSchema.parse(body);

    // Get existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      const response: ApiResponse<Order> = {
        success: false,
        error: {
          message: 'Order not found',
          code: 'NOT_FOUND',
        },
      };

      return NextResponse.json(response, { status: 404 });
    }

    // Validate status transition
    const allowedTransitions = STATUS_TRANSITIONS[existingOrder.status];
    if (!allowedTransitions.includes(validatedData.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Cannot transition from ${existingOrder.status} to ${validatedData.status}`,
            code: 'INVALID_STATUS_TRANSITION',
          },
        },
        { status: 400 }
      );
    }

    // Handle stock restoration on cancellation
    if (validatedData.status === 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        // Restore stock for cancelled orders
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQty: {
                increment: item.quantity,
              },
            },
          });
        }

        // Update order status
        await tx.order.update({
          where: { id },
          data: {
            status: validatedData.status,
            notes: validatedData.notes
              ? `${existingOrder.notes || ''}\n[${new Date().toISOString()}] ${validatedData.notes}`
              : existingOrder.notes,
          },
        });
      });
    } else {
      // Just update status
      await prisma.order.update({
        where: { id },
        data: {
          status: validatedData.status,
          notes: validatedData.notes
            ? `${existingOrder.notes || ''}\n[${new Date().toISOString()}] ${validatedData.notes}`
            : existingOrder.notes,
        },
      });
    }

    // Fetch updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
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
    });

    const response: ApiResponse<Order> = {
      success: true,
      data: updatedOrder as unknown as Order,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.issues?.[0]?.message || 'Validation error',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    console.error('Update order error:', error);
    const response: ApiResponse<Order> = {
      success: false,
      error: {
        message: 'Failed to update order',
        code: 'INTERNAL_ERROR',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE - Cancel order (same as PATCH with status CANCELLED)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: 'Order not found',
          code: 'NOT_FOUND',
        },
      };

      return NextResponse.json(response, { status: 404 });
    }

    // Can only cancel pending or confirmed orders
    if (!['PENDING', 'CONFIRMED'].includes(existingOrder.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Cannot cancel order with status ${existingOrder.status}`,
            code: 'INVALID_STATUS',
          },
        },
        { status: 400 }
      );
    }

    // Cancel order and restore stock
    await prisma.$transaction(async (tx) => {
      // Restore stock
      for (const item of existingOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQty: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update order status
      await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          notes: `${existingOrder.notes || ''}\n[${new Date().toISOString()}] Order cancelled`,
        },
      });
    });

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Cancel order error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: {
        message: 'Failed to cancel order',
        code: 'INTERNAL_ERROR',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
