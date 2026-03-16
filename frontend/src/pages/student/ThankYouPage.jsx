import { Link } from 'react-router-dom';
import { CheckCircle2, Home, Sparkles } from 'lucide-react';

export default function ThankYouPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4">
            <div className="text-center max-w-md animate-fade-in-up">
                {/* Success icon */}
                <div className="relative inline-flex mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                        <CheckCircle2 className="text-white" size={48} />
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" size={24} />
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
                    Thank You!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">
                    Your feedback has been submitted successfully.
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mb-8">
                    Your response helps improve teaching quality. Thank you for taking the time to share your thoughts.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.97]"
                    >
                        <Home size={18} />
                        Go to Home
                    </Link>
                </div>

                <p className="mt-8 text-xs text-gray-400 dark:text-gray-600">
                    Your submission is anonymous and confidential.
                </p>
            </div>
        </div>
    );
}
