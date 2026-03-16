import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4">
            <div className="text-center max-w-md animate-fade-in-up">
                <div className="relative inline-flex mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-slate-400 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center shadow-xl">
                        <FileQuestion className="text-white" size={48} />
                    </div>
                </div>

                <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-2">404</h1>
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">Page Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    The page you're looking for doesn't exist or may have been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.97]"
                    >
                        <Home size={18} />
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
