import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const PASSWORD = process.env.DASHBOARD_PASSWORD || 'secret';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }

        if (password !== PASSWORD) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        // Generate tokens
        const accessToken = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ role: 'admin' }, REFRESH_SECRET, { expiresIn: '7d' });

        const response = NextResponse.json({
            success: true,
            accessToken,
            refreshToken
        }, { status: 200 });

        // Set cookies
        response.cookies.set('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 // 15 minutes
        });

        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
