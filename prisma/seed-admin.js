const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@ays.com';
    const password = 'admin'; // Change this in production

    const hashedPassword = await hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            isAdmin: true,
            password: hashedPassword
        },
        create: {
            email,
            fullName: 'Sistem Yöneticisi',
            password: hashedPassword,
            phone: '+905550000000',
            isAdmin: true,
        },
    });

    console.log({ admin });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
