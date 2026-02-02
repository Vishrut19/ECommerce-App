import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse, Product, ProductFilters, PaginatedResponse } from '@/types';
import { z } from 'zod';

// Validation schema for creating a product
const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  pricePerUnit: z.number().positive('Price must be positive'),
  unitType: z.enum(['KG', 'TON', 'BAG', 'CRATE', 'DOZEN', 'PIECE', 'LITER']).default('KG'),
  minOrderQty: z.number().int().positive().default(1),
  stockQty: z.number().int().min(0).default(0),
  images: z.array(z.string()).default([]),
  supplierName: z.string().optional(),
  isOrganic: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  lowStockAlert: z.number().int().min(0).default(10),
});

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters
    const filters: ProductFilters = {
      categoryId: searchParams.get('categoryId') || undefined,
      category: searchParams.get('category') || undefined,
      isOrganic: searchParams.get('isOrganic') === 'true' ? true : 
                 searchParams.get('isOrganic') === 'false' ? false : undefined,
      isActive: searchParams.get('isActive') === 'true' ? true :
                searchParams.get('isActive') === 'false' ? false : undefined,
      isFeatured: searchParams.get('isFeatured') === 'true' ? true : undefined,
      inStock: searchParams.get('inStock') === 'true' ? true :
               searchParams.get('inStock') === 'false' ? false : undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      search: searchParams.get('search') || undefined,
    };

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.category) {
      where.category = { name: filters.category };
    }

    if (filters.isOrganic !== undefined) {
      where.isOrganic = filters.isOrganic;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isFeatured) {
      where.isFeatured = true;
    }

    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        where.stockQty = { gt: 0 };
      } else {
        where.stockQty = 0;
      }
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.pricePerUnit = {};
      if (filters.minPrice !== undefined) {
        where.pricePerUnit.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.pricePerUnit.lte = filters.maxPrice;
      }
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { supplierName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Execute queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const response: PaginatedResponse<Product> = {
      success: true,
      data: products as unknown as Product[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get products error:', error);
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
    const validatedData = createProductSchema.parse(body);

    // Generate slug if not provided
    const slug = validatedData.slug || generateSlug(validatedData.name);

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
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

    // Verify category exists
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

    // Create product
    const product = await prisma.product.create({
      data: {
        ...validatedData,
        slug,
      },
      include: {
        category: true,
      },
    });

    const response: ApiResponse<Product> = {
      success: true,
      data: product as unknown as Product,
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

    console.error('Create product error:', error);
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
