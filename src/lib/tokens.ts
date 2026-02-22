import { prisma } from "@/lib/prisma";

export const generateVerificationToken = async (email: string) => {
    // Generate a random 6-digit number
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 5 minutes from now
    const expiresAt = new Date(new Date().getTime() + 5 * 60 * 1000);

    // Check if a token already exists for this email
    const existingToken = await prisma.verificationToken.findFirst({
        where: { email }
    });

    if (existingToken) {
        await prisma.verificationToken.delete({
            where: {
                id: existingToken.id,
            },
        });
    }

    const verificationToken = await prisma.verificationToken.create({
        data: {
            email,
            token,
            expiresAt,
        }
    });

    return verificationToken;
};
