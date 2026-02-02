import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse, Settings } from '@/types';
import { z } from 'zod';

// Validation schema for updating settings
const updateSettingsSchema = z.object({
  companyName: z.string().min(1).optional(),
  companyEmail: z.string().email().optional().nullable(),
  companyPhone: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  companyAddress: z.string().optional().nullable(),
  orderNotificationEmail: z.string().email().optional().nullable(),
  currency: z.string().optional(),
  currencySymbol: z.string().optional(),
});

export async function GET() {
  try {
    // Get or create default settings
    let settings = await prisma.settings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 'default',
          companyName: 'AgroOrder',
          currency: 'INR',
          currencySymbol: '₹',
        },
      });
    }

    const response: ApiResponse<Settings> = {
      success: true,
      data: settings as unknown as Settings,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get settings error:', error);
    const response: ApiResponse<Settings> = {
      success: false,
      error: {
        message: 'Failed to fetch settings',
        code: 'INTERNAL_ERROR',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateSettingsSchema.parse(body);

    // Update or create settings
    const settings = await prisma.settings.upsert({
      where: { id: 'default' },
      update: validatedData,
      create: {
        id: 'default',
        ...validatedData,
        companyName: validatedData.companyName || 'AgroOrder',
        currency: validatedData.currency || 'INR',
        currencySymbol: validatedData.currencySymbol || '₹',
      },
    });

    const response: ApiResponse<Settings> = {
      success: true,
      data: settings as unknown as Settings,
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

    console.error('Update settings error:', error);
    const response: ApiResponse<Settings> = {
      success: false,
      error: {
        message: 'Failed to update settings',
        code: 'INTERNAL_ERROR',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
