import { requireAuth } from '../../utils/auth';
import Navbar from '../../components/Navbar';

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
                        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20 transition-all group flex items-start gap-4 cursor-pointer bg-white/50 dark:bg-gray-800/50">
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
                        </div>

                        {/* Another placeholder integration */}
                        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all group flex items-start gap-4 cursor-pointer bg-white/50 dark:bg-gray-800/50">
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
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
