import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60; // Cache the response for 60 seconds

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const productId = resolvedParams.id;

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        // Calculate start of day in Europe/Istanbul
        const now = new Date();
        const istanbulTimeStr = now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" });
        const istanbulDate = new Date(istanbulTimeStr);
        istanbulDate.setHours(0, 0, 0, 0);

        // Compute offset between Istanbul and local time if needed
        // The safest way to query UTC in DB based on a timezone boundary:
        // Using native Date object manipulated to the start of Istanbul day.

        // Let's create a UTC date corresponding to midnight in Istanbul
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Europe/Istanbul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });

        // Instead of string parsing, an easier approach is to find the midnight in IST:
        const currentIstanbul = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
        currentIstanbul.setHours(0, 0, 0, 0);
        // this is actually local midnight from the perspective of IST date.
        // It's cleaner to just calculate timezone offset manually.
        const offsetIST = 3 * 60 * 60 * 1000; // Istanbul is UTC+3 permanently
        const currentUTC = new Date().getTime();
        const istTime = currentUTC + offsetIST;
        const istDate = new Date(istTime);
        istDate.setUTCHours(0, 0, 0, 0); // Start of day in IST

        const startOfDayUTC = new Date(istDate.getTime() - offsetIST); // True UTC time for IST midnight

        // Aggregate quantity from OrderItems
        const result = await prisma.orderItem.aggregate({
            _sum: {
                quantity: true
            },
            where: {
                productId: productId,
                order: {
                    createdAt: {
                        gte: startOfDayUTC
                    },
                    status: {
                        not: 'CANCELLED' // Ignore cancelled orders
                    }
                }
            }
        });

        const count = result._sum.quantity || 0;

        return NextResponse.json({
            productId,
            todayPurchasedCount: count
        });
    } catch (error) {
        console.error('Error fetching today purchases:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
