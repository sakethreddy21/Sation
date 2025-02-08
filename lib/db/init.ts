import { setupDatabase } from './setup';
import { testConnection } from './queries';

export async function nitDatabase() {
    try {
        // Test connection
        const isConnected = await testConnection();
        if (!isConnected) {
            throw new Error('Database connection failed');
        }

        // Setup database tables
        await setupDatabase();

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
    }
} 