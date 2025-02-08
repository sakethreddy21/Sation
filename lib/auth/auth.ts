'use server'

import { hash, compare } from 'bcrypt';
import pool from '../db';

interface SignUpData {
    name: string;
    email: string;
    password: string;
}

interface LoginData {
    email: string;
    password: string;
}

export async function signUp(data: SignUpData) {
    try {
        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [data.email]
        );

        if (existingUser.rows.length > 0) {
            throw new Error('User already exists');
        }

        // Hash password with bcrypt
        const hashedPassword = await hash(data.password, 10);
        console.log('Hashed password:', hashedPassword); // Debug log

        // Create user with hashed password
        const result = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, name, email`,
            [data.name, data.email, hashedPassword]
        );

        return result.rows[0];
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
}

export async function login(data: LoginData) {
    try {
        // Find user with password
        const result = await pool.query(
            'SELECT id, name, email, password FROM users WHERE email = $1',
            [data.email]
        );

        const user = result.rows[0];

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Debug log (remove in production)
        console.log('Comparing passwords:', {
            provided: data.password,
            stored: user.password
        });

        // Verify password
        const isValid = data.password== user.password

        if (!isValid) {
            console.log('Password verification failed'); // Debug log
            throw new Error('Invalid credentials');
        }

        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        // Improve error logging
        if (error instanceof Error) {
            console.error('Login error:', error.message);
        } else {
            console.error('Unknown login error:', error);
        }
        throw new Error('Invalid credentials');
    }
}

// Add a helper function to create a test user
export async function createTestUser() {
    try {
        const testUser = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        };

        // Hash password
        const hashedPassword = await hash(testUser.password, 10);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO UPDATE 
             SET password = EXCLUDED.password
             RETURNING id, name, email`,
            [testUser.name, testUser.email, hashedPassword]
        );

        console.log('Test user created:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating test user:', error);
        throw error;
    }
} 