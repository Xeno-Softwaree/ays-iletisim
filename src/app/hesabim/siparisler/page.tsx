import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import OrdersClient from './orders-client';

export default async function OrdersPage() {
    const session = await auth();
    if (!session?.user?.email) {
        redirect('/login?callbackUrl=/hesabim/siparisler');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });
    if (!user) redirect('/login');

    const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
            items: {
                include: {
                    product: { select: { name: true, images: true, slug: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Serialize Decimal/Date types to plain numbers/strings for client
    const serialized = orders.map((order) => ({
        id: order.id,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        discountAmount: Number(order.discountAmount),
        couponCode: order.couponCode,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        fullName: order.fullName,
        address: order.address,
        city: order.city,
        phone: order.phone,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: order.items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            price: Number(item.price),
            product: {
                name: item.product.name,
                images: item.product.images,
                slug: item.product.slug,
            },
        })),
    }));

    return (
        <div className="min-h-screen bg-slate-50">
            <OrdersClient orders={serialized} />
        </div>
    );
}
