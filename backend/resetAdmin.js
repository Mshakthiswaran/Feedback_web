import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.professor.update({
        where: { email: 'admin@test.com' },
        data: {
            password: hashedPassword,
            role: 'admin'
        }
    });
    console.log('Admin user password and role reset:', admin.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
