"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to login');
            }

            // Redirect on success
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-950">
            {/* Background glowing orb 1 */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply opacity-30 filter blur-[128px] animate-[blob_7s_infinite] pointer-events-none"></div>

            {/* Background glowing orb 2 */}
            <div
                className="absolute top-[20%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply opacity-30 filter blur-[128px] animate-[blob_7s_infinite] pointer-events-none"
                style={{ animationDelay: '2s' }}
            ></div>

            {/* Background glowing orb 3 */}
            <div
                className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply opacity-30 filter blur-[128px] animate-[blob_7s_infinite] pointer-events-none"
                style={{ animationDelay: '4s' }}
            ></div>

            <div className="relative z-10 w-full max-w-md p-8 sm:p-10 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-gray-200/50 dark:border-gray-800/50 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
                <div className="mb-10 text-center">
                    <div className="mx-auto w-14 h-14 bg-linear-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 transform -rotate-6">
                        <svg className="w-7 h-7 text-white transform rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Welcome back</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Please enter your details to sign in to the dashboard.</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-500">
                                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-11 block w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 transition duration-200"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Remember me for 30 days
                        </label>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transform hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
