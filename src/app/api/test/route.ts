import { NextResponse } from 'next/server';
import testConnection from '@/lib/testDb';

export async function GET() {
    try {
        const isConnected = await testConnection();
        
        return NextResponse.json({
            status: isConnected ? 'Connected' : 'Failed',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Connection test failed', details: error },
            { status: 500 }
        );
    }
}