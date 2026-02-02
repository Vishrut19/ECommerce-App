import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse, Category } from '@/types';
import { z } from 'zod';

// Validation schema for creating a category
const createCategorySchema = z.object({
  name: z.string().min(1, 'Slug name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  icon: z.string().optional(),
  description: z.string().optional(),
  isOrganic: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// Validation schema for updating a category
const updateCategorySchema = createCategorySchema.partial();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // Default to true

    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        products: includeProducts
          ? {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                slug: true,
                pricePerUnit: true,
                unitType: true,
                stockQty: true,
                images: true,
              },
            }
          : false,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const response: ApiResponse<Category[]> = {
      success: true,
      data: categories as unknown as Category[],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get categories error:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // Check if category with same name exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: validatedData.name },
    });

    if (existingCategory) {
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

    // Create category
    const category = await prisma.category.create({
      data: validatedData,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const response: ApiResponse<Category> = {
      success: true,
      data: category as unknown as Category,
    };

    return NextResponse.json(response, { status: 201 });
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

    console.error('Create category error:', error);
    const response: ApiResponse<Category> = {
      success: false,
      error: {
        message: 'Failed to create category',
        code: 'INTERNAL_ERROR',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
