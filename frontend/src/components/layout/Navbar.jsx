import { useAuthStore } from '../../store/slices/authSlice';
import { LogOut, User, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
            <div className="flex items-center gap-4">
                <MessageCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">
                    Teacher Feedback System
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <User className="h-5 w-5 bg-gray-100 dark:bg-gray-700 p-1 rounded-full" />
                    <span className="font-medium hidden sm:inline">{user?.name || 'Professor'}</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Logout"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </nav>
    );
}