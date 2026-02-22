import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const bankAccounts = await prisma.bankAccount.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(bankAccounts);
    } catch (error) {
        return NextResponse.json({ error: 'Banka hesapları getirilemedi' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bankName, accountHolder, iban, branchCode, accountNumber } = body;

        const newAccount = await prisma.bankAccount.create({
            data: {
                bankName,
                accountHolder,
                iban,
                branchCode,
                accountNumber
            }
        });

        return NextResponse.json(newAccount);
    } catch (error) {
        return NextResponse.json({ error: 'Banka hesabı oluşturulamadı' }, { status: 500 });
    }
}
