import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { bankName, accountHolder, iban, branchCode, accountNumber, isActive } = body;

        const updatedAccount = await prisma.bankAccount.update({
            where: { id },
            data: {
                bankName,
                accountHolder,
                iban,
                branchCode,
                accountNumber,
                isActive
            }
        });

        return NextResponse.json(updatedAccount);
    } catch (error) {
        return NextResponse.json({ error: 'Banka hesabı güncellenemedi' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.bankAccount.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Banka hesabı silinemedi' }, { status: 500 });
    }
}
