import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Utility function to check if the user is signed in.
 * If not signed in, this will redirect to the login page.
 * Place this on all pages that need to be protected.
 */
export async function requireAuth() {
    const cookieStore = await cookies();
    const hasAccessToken = cookieStore.has('accessToken');
    const hasRefreshToken = cookieStore.has('refreshToken');

    if (!hasAccessToken && !hasRefreshToken) {
        redirect('/login');
    }

    return true;
}
