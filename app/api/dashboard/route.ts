import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse, DashboardStats } from '@/types';

export async function GET() {
  try {
    // Get current date info for monthly stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Execute all queries in parallel
    const [
      totalOrders,
      pendingOrders,
      totalProducts,
      activeProducts,
      lowStockProducts,
      monthlyOrdersData,
      recentOrders,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),
      
      // Pending orders
      prisma.order.count({
        where: { status: 'PENDING' },
      }),
      
      // Total products
      prisma.product.count(),
      
      // Active products
      prisma.product.count({
        where: { isActive: true },
      }),
      
      // Low stock products (stock <= lowStockAlert)
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM products 
        WHERE stock_qty <= low_stock_alert AND is_active = true
      `,
      
      // Monthly revenue (sum of delivered orders this month)
      prisma.order.aggregate({
        where: {
          status: 'DELIVERED',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      
      // Recent orders (last 10)
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const stats: DashboardStats = {
      totalOrders,
      pendingOrders,
      totalProducts,
      activeProducts,
      lowStockProducts: Number(lowStockProducts[0]?.count || 0),
      monthlyRevenue: monthlyOrdersData._sum.totalAmount || 0,
      recentOrders: recentOrders as any,
    };

    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    const response: ApiResponse<DashboardStats> = {
      success: false,
      error: {
        message: 'Failed to fetch dashboard stats',
        code: 'INTERNAL_ERROR',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
