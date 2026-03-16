import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.professor.upsert({
        where: { email: 'admin@test.com' },
        update: { role: 'admin' },
        create: {
            name: 'System Admin',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'admin',
            department: 'Administration',
            designation: 'Super Admin'
        }
    });
    console.log('Admin user created/updated:', admin.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
