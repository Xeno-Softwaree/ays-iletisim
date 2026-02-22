import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { ProductCondition } from '@prisma/client';
import { sendStockAlertEmail } from '@/lib/brevo';
import { logger } from '@/lib/logger';

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;

        if (!id) {
            return NextResponse.json({ success: false, message: 'Geçersiz ID' }, { status: 400 });
        }

        await prisma.product.delete({
            where: { id },
        });
        return NextResponse.json({ success: true, message: 'Ürün silindi' });
    } catch (error) {
        console.error('API_ERROR (DELETE):', error);
        return NextResponse.json({ success: false, message: 'Silme işlemi başarısız', error }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;
        const body = await request.json();

        // Fetch current product to check stock before update
        const currentProduct = await prisma.product.findUnique({
            where: { id },
            select: { stock: true, name: true, slug: true }
        });

        if (!currentProduct) {
            return NextResponse.json({ success: false, message: 'Ürün bulunamadı' }, { status: 404 });
        }

        // Ensure numeric types
        const price = parseFloat(body.price);
        const stock = parseInt(body.stock);

        if (isNaN(price) || isNaN(stock)) {
            return NextResponse.json({ success: false, message: 'Geçersiz fiyat veya stok değeri' }, { status: 400 });
        }

        // Validate Condition Enum - handle both English and Turkish
        let condition: ProductCondition = ProductCondition.NEW;
        if (body.condition === 'USED' || body.condition === 'İkinci El') {
            condition = ProductCondition.USED;
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                price: price,
                stock: stock,
                categoryId: body.categoryId,
                brandId: body.brandId || null,
                condition: condition,
                batteryHealth: body.batteryHealth ?? null,
                warrantyStatus: body.warrantyStatus || null,
                colors: body.colors ?? [],
                images: body.images || [],
            },
        });

        // Diagnostic file logging
        const fs = require('fs');
        const path = require('path');
        const logFile = path.join(process.cwd(), 'stock-alert-debug.log');
        const log = (msg: string) => {
            const time = new Date().toISOString();
            fs.appendFileSync(logFile, `[${time}] ${msg}\n`);
            logger.info(msg);
        };

        log(`Stock Update Check: Product=${id}, Old=${currentProduct.stock}, New=${stock}`);

        // Stock Alert Logic: If stock was 0 and is now > 0, notify subscribers
        if (currentProduct.stock <= 0 && stock > 0) {
            const alerts = await (prisma as any).stockAlert.findMany({
                where: {
                    productId: id,
                    isNotified: false
                }
            });

            log(`Found ${alerts.length} pending stock alerts for product ${id}`);

            if (alerts.length > 0) {
                const emailPromises = alerts.map((alert: any) =>
                    sendStockAlertEmail({
                        email: alert.email,
                        productName: currentProduct.name,
                        productSlug: currentProduct.slug
                    }).then(res => {
                        log(`Stock Alert Email to ${alert.email}: ${res.success ? 'Success' : 'Failed'}`);
                        if (!res.success) log(`Error Details: ${JSON.stringify(res.error)}`);
                        return res;
                    })
                );

                const results = await Promise.allSettled(emailPromises);

                await (prisma as any).stockAlert.updateMany({
                    where: {
                        id: { in: alerts.map((a: any) => a.id) }
                    },
                    data: { isNotified: true }
                });

                log(`Successfully processed ${results.length} stock alerts.`);
            }
        }

        return NextResponse.json({ success: true, product: updatedProduct });
    } catch (error) {
        console.error('API_ERROR (PUT):', error);
        return NextResponse.json({ success: false, message: 'Güncelleme başarısız', error }, { status: 500 });
    }
}
