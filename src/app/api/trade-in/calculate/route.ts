import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { brand, model, screenCondition, batteryHealth } = body;

        // Fetch settings for calculation logic
        let settings = await prisma.settings.findFirst() as any;

        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    whatsappNumber: '+905332352406',
                    defaultMessage: 'Merhaba, {productName} hakkında bilgi almak istiyorum.',
                    baseDiscountRate: 0.2,
                    conditionMultipliers: {
                        'Temiz': 1.0,
                        'Çizik': 0.85,
                        'Kırık': 0.6
                    },
                    tradeInModels: []
                } as any
            }) as any;
        }

        // Try to find specific model price from dynamic list
        const tradeInModels = (settings.tradeInModels as any[]) || [];
        const specificModel = tradeInModels.find(m =>
            String(m.brand).toLowerCase().trim() === String(brand).toLowerCase().trim() &&
            String(m.name).toLowerCase().trim() === String(model).toLowerCase().trim()
        );

        // Fallback brand prices if model not found
        const basePrices: Record<string, number> = {
            'Apple': 30000,
            'Samsung': 25000,
            'Xiaomi': 15000,
            'Huawei': 12000,
            'Oppo': 10000,
            'Realme': 9000,
            'Diğer': 8000
        };

        const basePrice = Number(specificModel?.basePrice) || basePrices[brand] || basePrices['Diğer'];

        // Apply multipliers from settings
        const multipliers = (settings.conditionMultipliers as any) || {
            'Temiz': 1.0,
            'Çizik': 0.85,
            'Kırık': 0.6
        };

        const conditionMultiplier = multipliers[screenCondition] || 1.0;

        // Ensure baseDiscountRate is treated as number
        const baseDiscountRate = Number(settings.baseDiscountRate) || 0.2;

        // Basic calculation logic
        let price = basePrice * (1 - baseDiscountRate) * conditionMultiplier;

        // Adjust for battery health if needed
        if (batteryHealth < 85) {
            price = price * 0.95;
        }

        const finalPrice = Math.round(price / 50) * 50;

        return NextResponse.json({
            success: true,
            estimatedPrice: finalPrice
        });

    } catch (error: any) {
        console.error('CALCULATE_ERROR:', error);
        return NextResponse.json(
            { success: false, message: 'Fiyat hesaplanamadı', error: error.message },
            { status: 500 }
        );
    }
}
