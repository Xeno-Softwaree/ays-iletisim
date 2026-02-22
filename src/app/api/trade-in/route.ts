import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const requests = await prisma.tradeInRequest.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ success: true, data: requests });
    } catch (error) {
        console.error('TRADE_IN_GET_ERROR:', error);
        return NextResponse.json({ success: false, message: 'Talepler yüklenemedi' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { brand, model, screenCondition, batteryHealth, estimatedPrice, customerPhone, customerName, customerEmail } = body;

        // Validation
        if (!brand || !model || !screenCondition || batteryHealth === undefined || !estimatedPrice || !customerPhone) {
            return NextResponse.json(
                { success: false, message: 'Tüm alanları doldurun' },
                { status: 400 }
            );
        }

        // Create trade-in request
        const tradeInRequest = await prisma.tradeInRequest.create({
            data: {
                brand,
                model,
                screenCondition,
                batteryHealth: parseInt(batteryHealth),
                estimatedPrice: parseFloat(estimatedPrice),
                customerPhone,
                customerName: customerName || null,
                customerEmail: customerEmail || null,
                status: 'Beklemede',
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Talebiniz başarıyla alındı. En kısa sürede size dönüş yapacağız.',
            data: tradeInRequest,
        });
    } catch (error) {
        console.error('TRADE_IN_ERROR:', error);
        return NextResponse.json(
            { success: false, message: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status, adminNote, finalOffer } = body;

        if (!id) {
            return NextResponse.json({ success: false, message: 'ID gerekli' }, { status: 400 });
        }

        const parseStrict = (val: any) => {
            if (val === null || val === undefined || val === '') return undefined;
            if (typeof val === 'number') return val;
            const cleaned = String(val).replace(',', '.');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? undefined : parsed;
        };

        // Use raw SQL to avoid "Unknown argument" errors from stale Prisma client
        if (status !== undefined) {
            await prisma.$executeRaw`UPDATE "TradeInRequest" SET "status" = ${status}, "updatedAt" = NOW() WHERE "id" = ${id}`;
        }

        if (adminNote !== undefined) {
            await prisma.$executeRaw`UPDATE "TradeInRequest" SET "adminNote" = ${adminNote}, "updatedAt" = NOW() WHERE "id" = ${id}`;
        }

        if (finalOffer !== undefined) {
            const val = parseStrict(finalOffer);
            if (val !== undefined) {
                await prisma.$executeRaw`UPDATE "TradeInRequest" SET "finalOffer" = ${val}, "updatedAt" = NOW() WHERE "id" = ${id}`;
            }
        }

        // Return updated record
        const updated = await prisma.tradeInRequest.findUnique({ where: { id } });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        console.error('TRADE_IN_PATCH_ERROR:', error);
        return NextResponse.json({
            success: false,
            message: 'Güncelleme hatası',
            error: error.message
        }, { status: 500 });
    }
}
