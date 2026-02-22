import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const reviews = await prisma.review.findMany({
            where: {
                productId: id,
                isApproved: true
            },
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error('[REVIEWS_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session || !session.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { rating, comment } = body;

        if (!rating || rating < 1 || rating > 5) {
            return new NextResponse("Invalid rating", { status: 400 });
        }

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findFirst({
            where: {
                userId: session.user.id,
                productId: id
            }
        });

        if (existingReview) {
            return new NextResponse("Already reviewed", { status: 400 });
        }

        const review = await prisma.review.create({
            data: {
                userId: session.user.id,
                productId: id,
                rating,
                comment,
                isApproved: true // Auto-approve for now
            }
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error('[REVIEWS_POST]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
