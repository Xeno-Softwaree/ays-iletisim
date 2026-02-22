import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const defaultContactInfo = {
    address: 'Ordu Caddesi No:12/B\nMerkez, Erzincan',
    phone: '+90 555 123 45 67',
    email: 'info@aysiletisim.com',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3056.666993685655!2d39.4895!3d39.7500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDQ1JzAwLjAiTiAzOcKwMjknMjIuMiJF!5e0!3m2!1str!2str!4v1635789000000!5m2!1str!2str',
};

// Get contact info (singleton row)
export async function GET() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let info = await (prisma as any).contactInfo.findFirst();

        if (!info) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            info = await (prisma as any).contactInfo.create({
                data: defaultContactInfo
            });
        }

        return NextResponse.json({ success: true, data: info });
    } catch (error: any) {
        console.error('Contact GET error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Update contact info
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { address, phone, email, mapEmbedUrl } = body;

        if (!address || !phone || !email) {
            return NextResponse.json({ success: false, error: 'Tüm alanlar zorunludur.' }, { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let info = await (prisma as any).contactInfo.findFirst();

        if (!info) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            info = await (prisma as any).contactInfo.create({
                data: { address, phone, email, mapEmbedUrl: mapEmbedUrl || '' }
            });
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            info = await (prisma as any).contactInfo.update({
                where: { id: info.id },
                data: { address, phone, email, mapEmbedUrl: mapEmbedUrl || '' }
            });
        }

        return NextResponse.json({ success: true, data: info });
    } catch (error: any) {
        console.error('Contact PUT error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
