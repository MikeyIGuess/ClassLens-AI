import { db } from '@/db';
import { courses } from '@/db/schema';

async function main() {
    const sampleCourses = [
        {
            name: 'Introduction to AI',
            term: 'Fall 2024',
            orgId: null,
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(courses).values(sampleCourses);
    
    console.log('✅ Courses seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});