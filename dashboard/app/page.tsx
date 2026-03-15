import { requireAuth } from '../utils/auth';
import Navbar from '../components/Navbar';

export default async function DashboardPage() {
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Hey Boss 👋
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Welcome back to your Friday dashboard. Here is an overview of what's happening.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dashboard Cards Example */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300">Total Users</h3>
              <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">1,234</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-800/30">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">Active Sessions</h3>
              <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">56</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">System Status</h3>
              <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">Healthy</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
