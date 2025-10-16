import { db } from '@/db';
import { enrollments } from '@/db/schema';

async function main() {
    const sampleEnrollments = [
        {
            userId: 1,
            courseId: 1,
            role: 'student',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 2,
            courseId: 1,
            role: 'instructor',
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(enrollments).values(sampleEnrollments);
    
    console.log('✅ Enrollments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});