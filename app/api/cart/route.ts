import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// AgroOrder Cart API
// For B2B wholesale, cart stores product IDs and quantities
// Order form handles buyer details

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartStorage {
  items: CartItem[];
  updatedAt: string;
}

// In-memory cart storage (for demo - use Redis/database in production)
const carts = new Map<string, CartStorage>();

// Helper to get cart ID from cookies
function getCartId(request: NextRequest): string {
  return request.cookies.get('cart-id')?.value || 'anonymous';
}

// GET /api/cart - Get current cart with product details
export async function GET(request: NextRequest) {
  try {
    const cartId = getCartId(request);
    const cart = carts.get(cartId);

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          total: 0,
          itemCount: 0,
          currency: 'INR',
          currencySymbol: '₹',
        },
      });
    }

    // Fetch product details for each cart item
    const productIds = cart.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    // Build cart response with product details
    const items = cart.items.map(cartItem => {
      const product = products.find(p => p.id === cartItem.productId);
      if (!product) return null;

      return {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        quantity: cartItem.quantity,
        pricePerUnit: product.pricePerUnit,
        unitType: product.unitType,
        minOrderQty: product.minOrderQty,
        stockQty: product.stockQty,
        subtotal: product.pricePerUnit * cartItem.quantity,
        imageUrl: product.images[0] || null,
        categoryName: product.category?.displayName || '',
        isOrganic: product.isOrganic,
      };
    }).filter(Boolean);

    const total = items.reduce((sum, item) => sum + (item?.subtotal || 0), 0);
    const itemCount = items.reduce((sum, item) => sum + (item?.quantity || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        itemCount,
        currency: 'INR',
        currencySymbol: '₹',
      },
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch cart', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid product ID or quantity', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: { message: 'Product not found or unavailable', code: 'PRODUCT_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Check minimum order quantity
    if (quantity < product.minOrderQty) {
      return NextResponse.json(
        { success: false, error: { message: `Minimum order quantity is ${product.minOrderQty}`, code: 'MIN_QTY_NOT_MET' } },
        { status: 400 }
      );
    }

    // Check stock availability
    if (quantity > product.stockQty) {
      return NextResponse.json(
        { success: false, error: { message: `Only ${product.stockQty} units available`, code: 'INSUFFICIENT_STOCK' } },
        { status: 400 }
      );
    }

    const cartId = getCartId(request);
    let cart = carts.get(cartId);

    if (!cart) {
      cart = { items: [], updatedAt: new Date().toISOString() };
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity = quantity;
    } else {
      // Add new item
      cart.items.push({ productId, quantity });
    }

    cart.updatedAt = new Date().toISOString();
    carts.set(cartId, cart);

    // Return updated cart
    return GET(request);
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to add to cart', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: { message: 'Product ID is required', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    const cartId = getCartId(request);
    const cart = carts.get(cartId);

    if (!cart) {
      return NextResponse.json(
        { success: false, error: { message: 'Cart not found', code: 'CART_NOT_FOUND' } },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex < 0) {
      return NextResponse.json(
        { success: false, error: { message: 'Item not in cart', code: 'ITEM_NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Verify product and stock
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        cart.items.splice(itemIndex, 1);
      } else {
        if (quantity < product.minOrderQty) {
          return NextResponse.json(
            { success: false, error: { message: `Minimum order quantity is ${product.minOrderQty}`, code: 'MIN_QTY_NOT_MET' } },
            { status: 400 }
          );
        }

        if (quantity > product.stockQty) {
          return NextResponse.json(
            { success: false, error: { message: `Only ${product.stockQty} units available`, code: 'INSUFFICIENT_STOCK' } },
            { status: 400 }
          );
        }

        cart.items[itemIndex].quantity = quantity;
      }
    }

    cart.updatedAt = new Date().toISOString();
    carts.set(cartId, cart);

    return GET(request);
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to update cart', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove item or clear cart
export async function DELETE(request: NextRequest) {
  try {
    const cartId = getCartId(request);
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (productId) {
      // Remove specific item
      const cart = carts.get(cartId);
      if (cart) {
        cart.items = cart.items.filter(item => item.productId !== productId);
        cart.updatedAt = new Date().toISOString();
        carts.set(cartId, cart);
      }
    } else {
      // Clear entire cart
      carts.delete(cartId);
    }

    return GET(request);
  } catch (error) {
    console.error('Error deleting from cart:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to delete from cart', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
