import { NextResponse } from 'next/server';
import { createUser, testConnection } from '@/lib/db/queries';

export async function GET() {
    const isConnected = await testConnection();
    return NextResponse.json({ connected: isConnected });
}

export async function POST(request: Request) {
    try {
        const { name, email } = await request.json();
        const user = await createUser(name, email);
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
} 