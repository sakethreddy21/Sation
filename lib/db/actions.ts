'use server'

import pool from '../db'
import { Document } from './document-queries'

interface CreateDocumentData {
    title: string;
    userId: string;
    isArchived?: boolean;
    content?: string;
    coverimage?: string;
    icon?: string;
    isPublished?: boolean;
}

interface UpdateDocumentData {
    title?: string;
    isArchived?: boolean;
    content?: string;
    coverimage?: string;
    icon?: string;
    isPublished?: boolean;
}

export async function createDocument(data: CreateDocumentData): Promise<Document> {
    try {
        const result = await pool.query(
            `INSERT INTO documents (
                title, 
                userid, 
                isarchived, 
                content, 
                coverimage, 
                icon, 
                isPublished
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [
                data.title,
                data.userId,
                data.isArchived || false,
                data.content || '',
                data.coverimage || null,
                data.icon || null,
                data.isPublished || false
            ]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating document:', error);
        throw error;
    }
}

export async function updateDocument(id: string, data: UpdateDocumentData): Promise<Document> {
    try {
        // Build dynamic update query
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                updates.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });

        // Add updated_at
        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        // Add id as the last parameter
        values.push(id);

        const query = `
            UPDATE documents 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            throw new Error('Document not found');
        }

        return result.rows[0];
    } catch (error) {
        console.error('Error updating document:', error);
        throw error;
    }
}

export async function deleteDocument(id: string): Promise<boolean> {
    try {
        const result = await pool.query(
            'DELETE FROM documents WHERE id = $1 RETURNING *',
            [id]
        );

        return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
        console.error('Error deleting document:', error);
        throw error;
    }
}

export async function getDocument(id: string): Promise<Document | null> {
    try {
        const result = await pool.query(
            'SELECT * FROM documents WHERE id = $1',
            [id]
        );

        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching document:', error);
        throw error;
    }
}

export async function getUserDocuments(userId: string): Promise<Document[]> {
    try {
        const result = await pool.query(
            `SELECT * FROM documents 
             WHERE userId = $1 AND isarchived = false
             ORDER BY updated_at DESC`,
            [userId]
        );

        return result.rows;
    } catch (error) {
        console.error('Error fetching user documents:', error);
        throw error;
    }
}

export async function getArchivedDocuments(userId: string): Promise<Document[]> {
    try {
        const result = await pool.query(
            `SELECT * FROM documents 
             WHERE userid = $1 AND isarchived = true
             ORDER BY updated_at DESC`,
            [userId]
        );

        return result.rows;
    } catch (error) {
        console.error('Error fetching archived documents:', error);
        throw error;
    }
}

export async function getSidebarDocuments(parentDocumentId?: string) {
    try {
        const query = parentDocumentId
            ? `SELECT * FROM documents WHERE "parentdocument" = $1 AND "isarchived" = false ORDER BY "created_at" DESC`
            : `SELECT * FROM documents WHERE "parentdocument" IS NULL AND "isarchived" = false ORDER BY "created_at" DESC`;

        const result = await pool.query(query, parentDocumentId ? [parentDocumentId] : []);
        return result.rows.map(doc => ({
            ...doc,
            _id: doc.id,
            _creationTime: new Date(doc.created_at).getTime()
        }));
    } catch (error) {
        console.error('Error fetching sidebar documents:', error);
        throw error;
    }
}

export async function getTrashDocuments() {
    try {
        const result = await pool.query(
            `SELECT * FROM documents WHERE "isarchived" = true ORDER BY "updated_at" DESC`
        );
        return result.rows.map(doc => ({
            ...doc,
            _id: doc.id,
            _creationTime: new Date(doc.created_at).getTime()
        }));
    } catch (error) {
        console.error('Error fetching trash documents:', error);
        throw error;
    }
}

export async function archiveDocument(id: string) {
    try {
        const result = await pool.query(
            `UPDATE documents SET "isarchived" = true, "updated_at" = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id]
        );
        const doc = result.rows[0];
        return {
            ...doc,
            _id: doc.id,
            _creationTime: new Date(doc.created_at).getTime()
        };
    } catch (error) {
        console.error('Error archiving document:', error);
        throw error;
    }
}

export async function restoreDocument(id: string) {
    try {
        const result = await pool.query(
            `UPDATE documents SET "isarchived" = false, "updated_at" = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id]
        );
        const doc = result.rows[0];
        return {
            ...doc,
            _id: doc.id,
            _creationTime: new Date(doc.created_at).getTime()
        };
    } catch (error) {
        console.error('Error restoring document:', error);
        throw error;
    }
}

export async function createDocumentWithParent(data: CreateDocumentData & { parentDocument?: string }) {
    try {
        const result = await pool.query(
            `INSERT INTO documents (
                title, 
                userId, 
                "parentdocument",
                isarchived, 
                content, 
                coverimage, 
                icon, 
                isPublished
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [
                data.title,
                data.userId,
                data.parentDocument || null,
                data.isArchived || false,
                data.content || '',
                data.coverimage || null,
                data.icon || null,
                data.isPublished || false
            ]
        );
        const doc = result.rows[0];
        return {
            ...doc,
            _id: doc.id,
            _creationTime: new Date(doc.created_at).getTime()
        };
    } catch (error) {
        console.error('Error creating document:', error);
        throw error;
    }
}

export async function searchDocuments(userId: string) {
    try {
        const result = await pool.query(
            `SELECT * FROM documents 
             WHERE userId = $1 
             AND isarchived = false
             ORDER BY updated_at DESC`,
            [userId]
        );

        return result.rows.map(doc => ({
            ...doc,
            _id: doc.id,
            _creationTime: new Date(doc.created_at).getTime()
        }));
    } catch (error) {
        console.error('Error searching documents:', error);
        throw error;
    }
} 