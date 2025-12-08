import { NextRequest, NextResponse } from 'next/server';
import { connectDB, getConnectionStatus } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Test database connection
        await connectDB();
        const isConnected = getConnectionStatus();

        // Get environment info (without sensitive data)
        const envInfo = {
            nodeEnv: process.env.NODE_ENV || 'development',
            mongodbUriConfigured: !!process.env.MONGODB_URI,
            jwtSecretConfigured: !!process.env.JWT_SECRET,
            jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
        };

        // Get database stats
        const mongoose = (await import('mongoose')).default;
        const dbStats = {
            connectionState: mongoose.connection.readyState,
            databaseName: mongoose.connection.name,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
        };

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: envInfo,
            database: {
                connected: isConnected,
                ...dbStats,
            },
            services: {
                mongodb: isConnected ? 'operational' : 'disconnected',
                authentication: envInfo.jwtSecretConfigured ? 'configured' : 'not configured',
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            environment: {
                nodeEnv: process.env.NODE_ENV || 'development',
                mongodbUriConfigured: !!process.env.MONGODB_URI,
                jwtSecretConfigured: !!process.env.JWT_SECRET,
            },
            database: {
                connected: false,
            }
        }, { status: 503 });
    }
}
