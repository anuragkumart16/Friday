import { requireAuth } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default async function SocialsPage() {
    await requireAuth();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                Social Integrations
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Manage your connected social accounts and integrations.
                            </p>
                        </div>
                        <button className="px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            Add Account
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* WhatsApp Integration Card */}
                        <Link href="/socials/whatsapp" className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20 transition-all group flex items-start gap-4 cursor-pointer bg-white/50 dark:bg-gray-800/50">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-green-600 dark:text-green-400">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-500 transition-colors">WhatsApp Web JS</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Connect to your WhatsApp agent to process requests and filter out old messages.</p>
                                <div className="mt-3 flex items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Another placeholder integration */}
                        <Link href="/socials/twitter" className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all group flex items-start gap-4 cursor-pointer bg-white/50 dark:bg-gray-800/50">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">Twitter Filter</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Monitor and interact with Twitter conversations via the Friday engine.</p>
                                <div className="mt-3 flex items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                        Disconnected
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Slack Integration */}
                        <Link href="/socials/slack" className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all group flex items-start gap-4 cursor-pointer bg-white/50 dark:bg-gray-800/50">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">Slack</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Receive notifications and run slash commands directly from channels.</p>
                                <div className="mt-3 flex items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                        Disconnected
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Email Integration */}
                        <Link href="/socials/email" className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20 transition-all group flex items-start gap-4 cursor-pointer bg-white/50 dark:bg-gray-800/50">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-orange-600 dark:text-orange-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">Email</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Connect via SMTP/IMAP to automate responses and categorize mail.</p>
                                <div className="mt-3 flex items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                        Disconnected
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Instagram Integration */}
                        <Link href="/socials/instagram" className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20 transition-all group flex items-start gap-4 cursor-pointer bg-white/50 dark:bg-gray-800/50">
                            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-pink-600 dark:text-pink-400">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-pink-500 transition-colors">Instagram</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Reply to DMs and interact with followers automatically.</p>
                                <div className="mt-3 flex items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                        Disconnected
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Telegram Integration */}
                        <Link href="/socials/telegram" className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all group flex items-start gap-4 cursor-pointer bg-white/50 dark:bg-gray-800/50">
                            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-cyan-600 dark:text-cyan-400">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.662 8.647l-1.928 9.07c-.146.643-.532.802-1.07.498l-2.956-2.176-1.425 1.369c-.157.157-.289.289-.594.289l.213-3.003 5.467-4.944c.238-.213-.051-.33-.37-.118l-6.756 4.25-2.911-.908c-.633-.197-.646-.633.131-.941l11.378-4.385c.528-.198 1.002.115.821.999z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-500 transition-colors">Telegram</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Control bots and interact in groups or direct chats directly.</p>
                                <div className="mt-3 flex items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                        Disconnected
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Threads Integration */}
                        <Link href="/socials/threads" className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-black/50 hover:shadow-lg hover:shadow-black/20 dark:hover:border-white/50 dark:hover:shadow-white/20 transition-all group flex items-start gap-4 cursor-pointer bg-white/50 dark:bg-gray-800/50">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-900 dark:text-white">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.062 2.766c2.583 0 4.671-.059 6.22 1.393 1.583 1.48 1.602 3.738 1.602 6.069v2.245c0 3.744-1.127 6.435-3.036 8.019-1.637 1.357-3.699 1.769-5.755 1.764-1.996-.005-4.145-.487-5.594-1.785-1.543-1.38-2.022-3.411-2.022-5.32 0-3.35 1.942-5.558 5.604-5.558 1.789 0 3.12 1.096 3.667 2.656.764-.99 1.944-1.696 3.518-1.72 1.62-.025 2.802.68 3.528 1.968-.7-.954-1.93-1.421-3.213-1.282-1.396.15-2.535.955-3.047 2.378-.293.816-.307 1.722-.16 2.53.25 1.365 1.157 2.147 2.456 2.115 1.25-.03 2.544-.813 3.3-2.193.842-1.53.864-3.32.864-5.068v-1.7c0-2.316-.011-4.04-1.189-5.141-1.182-1.107-2.903-1.107-5.087-1.107H11.23c-1.956 0-3.791.01-5.08.777-1.112.662-1.84 1.768-2.148 3.094-.251 1.085-.357 2.47-.357 3.82 0 1.954.269 3.51.986 4.706C5.55 17.07 7.026 18H11.69c2.723 0 4.316-.838 5.286-2h1.666c-1.071 1.63-3.14 2.87-6.952 2.87-2.17 0-4.05-.536-5.464-1.724-1.543-1.302-1.91-3.208-1.91-5.394 0-1.697.106-3.344.606-4.708.826-2.254 2.62-3.805 5.518-4.22.846-.122 1.7-.132 2.573-.132h1.05zm-.4 9.079c-2.428-.403-3.593 1.144-3.585 2.52.008 1.282.88 2.067 2.181 2.035 1.242-.03 2.164-.78 2.508-1.84.38-1.168.17-2.161-1.104-2.715z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">Threads</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage and monitor conversations on Threads effortlessly.</p>
                                <div className="mt-3 flex items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                        Disconnected
                                    </span>
                                </div>
                            </div>
                        </Link>

                    </div>
                </div>
            </main>
        </div>
    );
}
