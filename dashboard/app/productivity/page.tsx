import { requireAuth } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import TodoManager from '../../components/TodoManager';

export default async function ProductivityPage() {
    await requireAuth();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                Productivity
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Manage your todo collections and stay on top of your tasks.
                            </p>
                        </div>
                    </div>

                    <TodoManager />
                </div>
            </main>
        </div>
    );
}
