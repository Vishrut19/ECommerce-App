import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse, Category } from '@/types';
import { z } from 'zod';

// Validation schema for updating a category
const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  icon: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isOrganic: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const includeProducts = searchParams.get('includeProducts') === 'true';

    // Try to find by ID first, then by name (slug)
    let category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: includeProducts
          ? {
              where: { isActive: true },
              orderBy: { createdAt: 'desc' },
            }
          : false,
        _count: {
          select: { products: true },
        },
      },
    });

    // If not found by ID, try by name (slug)
    if (!category) {
      category = await prisma.category.findUnique({
        where: { name: id },
        include: {
          products: includeProducts
            ? {
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
              }
            : false,
          _count: {
            select: { products: true },
          },
        },
      });
    }

    if (!category) {
      const response: ApiResponse<Category> = {
        success: false,
        error: {
          message: 'Category not found',
          code: 'NOT_FOUND',
        },
      };

      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Category> = {
      success: true,
      data: category as unknown as Category,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get category error:', error);
    const response: ApiResponse<Category> = {
      success: false,
      error: {
        message: 'Failed to fetch category',
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
    const validatedData = updateCategorySchema.parse(body);

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      const response: ApiResponse<Category> = {
        success: false,
        error: {
          message: 'Category not found',
          code: 'NOT_FOUND',
        },
      };

      return NextResponse.json(response, { status: 404 });
    }

    // If name is being updated, check for duplicates
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const nameExists = await prisma.category.findUnique({
        where: { name: validatedData.name },
      });

      if (nameExists) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'A category with this name already exists',
              code: 'DUPLICATE_NAME',
            },
          },
          { status: 400 }
        );
      }
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const response: ApiResponse<Category> = {
      success: true,
      data: updatedCategory as unknown as Category,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues?.[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            message: firstIssue?.message || 'Validation error',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    console.error('Update category error:', error);
    const response: ApiResponse<Category> = {
      success: false,
      error: {
        message: 'Failed to update category',
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

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existingCategory) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: 'Category not found',
          code: 'NOT_FOUND',
        },
      };

      return NextResponse.json(response, { status: 404 });
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      // Soft delete - just mark as inactive
      await prisma.category.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        data: null,
        message: 'Category deactivated (has products)',
      });
    }

    // Hard delete if no products
    await prisma.category.delete({
      where: { id },
    });

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Delete category error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: {
        message: 'Failed to delete category',
        code: 'INTERNAL_ERROR',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
