import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const settings = await (prisma.settings as any).findFirst({
            select: {
                instagramUrl: true,
                twitterUrl: true,
                facebookUrl: true,
                footerAbout: true,
                whatsappNumber: true
            }
        });

        return NextResponse.json({ success: true, data: settings });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
