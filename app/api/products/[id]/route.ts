import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse, Product } from '@/types';
import { z } from 'zod';

// Validation schema for updating a product
const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional(),
  pricePerUnit: z.number().positive().optional(),
  unitType: z.enum(['KG', 'TON', 'BAG', 'CRATE', 'DOZEN', 'PIECE', 'LITER']).optional(),
  minOrderQty: z.number().int().positive().optional(),
  stockQty: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  supplierName: z.string().optional().nullable(),
  isOrganic: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  lowStockAlert: z.number().int().min(0).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to find by ID first, then by slug
    let product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    // If not found by ID, try slug
    if (!product) {
      product = await prisma.product.findUnique({
        where: { slug: id },
        include: {
          category: true,
        },
      });
    }

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
      data: product as unknown as Product,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get product error:', error);
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
    const validatedData = updateProductSchema.parse(body);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      const response: ApiResponse<Product> = {
        success: false,
        error: {
          message: 'Product not found',
          code: 'NOT_FOUND',
        },
      };

      return NextResponse.json(response, { status: 404 });
    }

    // If slug is being updated, check for duplicates
    if (validatedData.slug && validatedData.slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: validatedData.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'A product with this slug already exists',
              code: 'DUPLICATE_SLUG',
            },
          },
          { status: 400 }
        );
      }
    }

    // If categoryId is being updated, verify it exists
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Category not found',
              code: 'CATEGORY_NOT_FOUND',
            },
          },
          { status: 400 }
        );
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: validatedData,
      include: {
        category: true,
      },
    });

    const response: ApiResponse<Product> = {
      success: true,
      data: updatedProduct as unknown as Product,
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

    console.error('Update product error:', error);
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: 'Product not found',
          code: 'NOT_FOUND',
        },
      };

      return NextResponse.json(response, { status: 404 });
    }

    // Check if product is referenced in any orders
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemsCount > 0) {
      // Soft delete - just mark as inactive
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        data: null,
        message: 'Product deactivated (has existing orders)',
      });
    }

    // Hard delete if no orders reference it
    await prisma.product.delete({
      where: { id },
    });

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Delete product error:', error);
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

// PATCH for partial updates (e.g., stock quantity, active status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Allow only specific fields for PATCH
    const allowedFields = ['stockQty', 'isActive', 'isFeatured', 'pricePerUnit'];
    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No valid fields to update',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      const response: ApiResponse<Product> = {
        success: false,
        error: {
          message: 'Product not found',
          code: 'NOT_FOUND',
        },
      };

      return NextResponse.json(response, { status: 404 });
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    const response: ApiResponse<Product> = {
      success: true,
      data: updatedProduct as unknown as Product,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Patch product error:', error);
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
