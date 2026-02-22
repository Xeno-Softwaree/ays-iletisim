import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    datasource: {
        url: process.env.DATABASE_URL,
    },
    // Prisma 7'ye seed dosyasının yerini ve nasıl çalışacağını öğretiyoruz:
    migrations: {
        seed: 'tsx ./prisma/seed.ts',
    },
});