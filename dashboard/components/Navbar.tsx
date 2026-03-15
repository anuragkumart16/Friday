"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative z-20 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="shrink-0 flex items-center group">
                            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md mr-3 group-hover:shadow-indigo-500/30 transition-shadow">
                                <span className="text-white font-bold text-lg leading-none">F</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Friday</span>
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            href="/"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/' ? 'bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                        >
                            Dashboard
                        </Link>

                        <Link
                            href="/productivity"
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/productivity') ? 'bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                        >
                            Productivity
                        </Link>

                        <div className="relative">
                            <button
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:outline-none transition-colors"
                                aria-haspopup="true"
                                aria-expanded={isSettingsOpen}
                            >
                                <span>Settings</span>
                                <svg className={`ml-1 h-5 w-5 transform transition-transform duration-200 ${isSettingsOpen ? 'rotate-180 text-indigo-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {isSettingsOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsSettingsOpen(false)}></div>
                                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20 overflow-hidden transform opacity-100 scale-100 transition-all duration-200">
                                        <div className="py-2" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Integrations
                                            </div>
                                            <Link
                                                href="/socials"
                                                onClick={() => setIsSettingsOpen(false)}
                                                className={`block px-4 py-2.5 text-sm transition-colors ${pathname === '/socials' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                                                role="menuitem"
                                            >
                                                <div className="flex items-center">
                                                    <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                                    </svg>
                                                    Socials
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="h-8 w-8 rounded-full bg-linear-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-white dark:ring-gray-900 cursor-pointer">
                            B
                        </div>
                    </div>

                    {/* Mobile hamburger button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu panel */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
                    <div className="px-4 py-3 space-y-1">
                        <Link
                            href="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === '/' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/productivity"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith('/productivity') ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                        >
                            Productivity
                        </Link>
                        <Link
                            href="/socials"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === '/socials' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                        >
                            Socials
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
