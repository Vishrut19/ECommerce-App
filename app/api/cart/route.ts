import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  addToCartSchema, 
  updateCartItemSchema,
  CartResponse,
  CartItemResponse
} from '@/lib/validations/cart';

// Helper to get cart key from session/cookies
// For now, we'll use a simple session-based approach
// In production, this would be tied to user authentication
function getCartId(request: NextRequest): string {
  // Check for cart ID in cookies
  const cartId = request.cookies.get('cart-id')?.value;
  return cartId || 'anonymous';
}

// In-memory cart storage for demo (replace with database in production)
// Using a Map to store carts by cart ID
const carts = new Map<string, Map<string, { 
  productId: string; 
  quantity: number; 
  selectedAttributes: Record<string, string>;
}>>();

// GET /api/cart - Get current cart
export async function GET(request: NextRequest) {
  try {
    const cartId = getCartId(request);
    const cart = carts.get(cartId) || new Map();
    
    // Fetch product details for cart items
    const items: CartItemResponse[] = [];
    let total = 0;
    
    for (const [itemKey, item] of cart.entries()) {
      // Get product from database
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          prices: true,
        },
      });
      
      if (product) {
        // Get USD price (default)
        const price = product.prices.find((p: { currencyCode: string; amount: number }) => p.currencyCode === 'USD');
        const amount = price?.amount || 0;
        
        items.push({
          id: itemKey,
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price: amount,
          currency: 'USD',
          selectedAttributes: item.selectedAttributes,
          imageUrl: product.gallery[0],
        });
        
        total += amount * item.quantity;
      }
    }
    
    const response: CartResponse = {
      items,
      total,
      currency: 'USD',
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = addToCartSchema.parse(body);
    
    const cartId = getCartId(request);
    
    // Get or create cart
    if (!carts.has(cartId)) {
      carts.set(cartId, new Map());
    }
    const cart = carts.get(cartId)!;
    
    // Create unique key for item (productId + attributes)
    const itemKey = `${validatedData.productId}-${JSON.stringify(validatedData.selectedAttributes)}`;
    
    // Check if item exists
    const existingItem = cart.get(itemKey);
    
    if (existingItem) {
      // Update quantity
      existingItem.quantity += validatedData.quantity;
      cart.set(itemKey, existingItem);
    } else {
      // Add new item
      cart.set(itemKey, {
        productId: validatedData.productId,
        quantity: validatedData.quantity,
        selectedAttributes: validatedData.selectedAttributes,
      });
    }
    
    // Return updated cart
    const response = await GET(request);
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error },
        { status: 400 }
      );
    }
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateCartItemSchema.parse(body);
    
    const cartId = getCartId(request);
    const cart = carts.get(cartId);
    
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }
    
    const itemKey = `${validatedData.productId}-${JSON.stringify(validatedData.selectedAttributes)}`;
    
    if (validatedData.quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.delete(itemKey);
    } else {
      const existingItem = cart.get(itemKey);
      if (existingItem) {
        existingItem.quantity = validatedData.quantity;
        cart.set(itemKey, existingItem);
      }
    }
    
    // Return updated cart
    const response = await GET(request);
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error },
        { status: 400 }
      );
    }
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear entire cart or remove specific item
export async function DELETE(request: NextRequest) {
  try {
    const cartId = getCartId(request);
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const attributes = searchParams.get('attributes');
    
    if (productId) {
      // Remove specific item
      const cart = carts.get(cartId);
      if (cart) {
        const selectedAttributes = attributes ? JSON.parse(attributes) : {};
        const itemKey = `${productId}-${JSON.stringify(selectedAttributes)}`;
        cart.delete(itemKey);
      }
    } else {
      // Clear entire cart
      carts.delete(cartId);
    }
    
    // Return updated cart
    const response = await GET(request);
    return response;
  } catch (error) {
    console.error('Error deleting from cart:', error);
    return NextResponse.json(
      { error: 'Failed to delete from cart' },
      { status: 500 }
    );
  }
}
