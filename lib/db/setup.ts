import pool from '../db'

export async function setupDatabase() {
    try {
        // First enable UUID extension
        await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

        // Check if table exists
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'documents'
            );
        `);

        if (!tableExists.rows[0].exists) {
            // Create documents table with UUID
            await pool.query(`
                CREATE TABLE documents (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    title VARCHAR(255) NOT NULL,
                    userId VARCHAR(255) NOT NULL,
                    "parentDocument" UUID REFERENCES documents(id),
                    isArchived BOOLEAN DEFAULT false,
                    content TEXT,
                    coverImage TEXT,
                    icon TEXT,
                    isPublished BOOLEAN DEFAULT false,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                -- Create index for user-based queries
                CREATE INDEX idx_documents_userId ON documents(userId);
            `);
            console.log('Documents table created successfully');
        } else {
            console.log('Documents table already exists');
        }

        return true;
    } catch (error) {
        console.error('Error setting up database:', error);
        return false;
    }
}

// Run setup
setupDatabase(); 