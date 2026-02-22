import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: Request) {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const favorites = await prisma.favorite.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                product: {
                    include: {
                        cartItems: {
                            where: {
                                cart: {
                                    userId: session.user.id
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Format products similar to product list API
        const formattedFavorites = favorites.map(fav => ({
            ...fav.product,
            price: Number(fav.product.price),
            inCart: fav.product.cartItems.length > 0,
            isFavorite: true // Obviously true since fetched from favorites table
        }));

        return NextResponse.json(formattedFavorites);
    } catch (error) {
        console.error('[FAVORITES_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { productId } = body;

        if (!productId) {
            return new NextResponse("Product ID required", { status: 400 });
        }

        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId
                }
            }
        });

        if (existingFavorite) {
            await prisma.favorite.delete({
                where: {
                    id: existingFavorite.id
                }
            });
            return NextResponse.json({ isFavorite: false });
        } else {
            await prisma.favorite.create({
                data: {
                    userId: session.user.id,
                    productId
                }
            });
            return NextResponse.json({ isFavorite: true });
        }
    } catch (error) {
        console.error('[FAVORITES_POST]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
