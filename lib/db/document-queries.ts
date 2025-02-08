import { UUID } from 'crypto';
import pool from '../db'

export interface Document {
    id: string;
    title: string;
    userId: string;
    isArchived: boolean;
    content?: string;
    coverimage?: string;
    icon?: string;
    isPublished: boolean;
    created_at: Date;
    updated_at: Date;
    createdAt: number;
}

export async function createDocument(data: Omit<Document, 'id' | 'created_at' | 'updated_at'>) {
    try {
        const result = await pool.query(
            `INSERT INTO documents (
                title, userid, isArchived, content, 
                coverImage, icon, isPublished
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [
                data.title,
                data.userId,
                data.isArchived,
                data.content,
                data.coverimage,
                data.icon,
                data.isPublished
            ]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating document:', error);
        throw error;
    }
}

export async function getDocumentsByUserId(userId: string) {
    try {
        const result = await pool.query(
            'SELECT * FROM documents WHERE userId = $1 ORDER BY updated_at DESC',
            [userId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching documents:', error);
        throw error;
    }
} 