import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        let settings = await prisma.settings.findFirst() as any;

        // If no settings exist, create default
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
                },
            } as any);
        }

        // Ensure JSON fields are returned as expected objects/arrays
        const safeSettings = {
            ...settings,
            conditionMultipliers: settings.conditionMultipliers || {
                'Temiz': 1.0,
                'Çizik': 0.85,
                'Kırık': 0.6
            },
            tradeInModels: settings.tradeInModels || []
        };

        return NextResponse.json({ success: true, data: safeSettings });
    } catch (error: any) {
        console.error('SETTINGS_GET_ERROR:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Ayarlar yüklenemedi',
                error: error.message
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const {
            whatsappNumber,
            defaultMessage,
            baseDiscountRate,
            conditionMultipliers,
            tradeInModels,
            instagramUrl,
            twitterUrl,
            facebookUrl,
            footerAbout
        } = body;

        if (!whatsappNumber || !defaultMessage) {
            return NextResponse.json(
                { success: false, message: 'Lütfen zorunlu alanları doldurun (WhatsApp ve Mesaj Şablonu)' },
                { status: 400 }
            );
        }

        // Helper to ensure numbers are strictly floats
        const parseStrict = (val: any): number => {
            if (val === null || val === undefined) return 0;
            if (typeof val === 'number') return val;
            const cleaned = String(val).replace(',', '.');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
        };

        const data = {
            whatsappNumber,
            defaultMessage,
            baseDiscountRate: parseStrict(baseDiscountRate),
            conditionMultipliers: conditionMultipliers || {},
            tradeInModels: (tradeInModels || []).map((m: any) => ({
                ...m,
                basePrice: parseStrict(m.basePrice)
            })),
            instagramUrl,
            twitterUrl,
            facebookUrl,
            footerAbout
        };

        // Clean multipliers explicitly
        if (data.conditionMultipliers) {
            Object.keys(data.conditionMultipliers).forEach(key => {
                data.conditionMultipliers[key] = parseStrict(data.conditionMultipliers[key]);
            });
        }

        const settings = await prisma.settings.findFirst() as any;

        let result;
        if (settings) {
            result = await prisma.settings.update({
                where: { id: settings.id },
                data
            });
        } else {
            result = await prisma.settings.create({
                data
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Ayarlar başarıyla güncellendi',
            data: result,
        });
    } catch (error: any) {
        console.error('SETTINGS_UPDATE_ERROR:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Güncelleme başarısız',
                error: error.message,
                details: error.meta?.cause || error.code
            },
            { status: 500 }
        );
    }
}
