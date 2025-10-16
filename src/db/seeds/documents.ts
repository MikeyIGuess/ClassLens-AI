import { db } from '@/db';
import { documents } from '@/db/schema';

async function main() {
    const sampleDocuments = [
        {
            courseId: 1,
            title: 'Lecture 1 - Introduction.pdf',
            fileKey: 'courses/1/lecture-1-intro.pdf',
            checksum: 'abc123def456',
            status: 'indexed',
            pages: 15,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            courseId: 1,
            title: 'Neural Networks Basics.pdf',
            fileKey: 'courses/1/neural-networks.pdf',
            checksum: 'xyz789ghi012',
            status: 'indexed',
            pages: 24,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            courseId: 1,
            title: 'Assignment 1 - Python Basics.pdf',
            fileKey: 'courses/1/assignment-1.pdf',
            checksum: 'jkl345mno678',
            status: 'indexed',
            pages: 8,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    await db.insert(documents).values(sampleDocuments);
    
    console.log('✅ Documents seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});