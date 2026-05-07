import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, User, Settings, Layers, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../store/slices/authSlice';

export default function Sidebar() {
    const role = useAuthStore((state) => state.user?.role);

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all text-sm ${isActive
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
        }`;

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full hidden md:flex flex-col shadow-sm">
            {/* Logo */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow">
                        <MessageCircle className="text-white h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg dark:text-white text-gray-800">Feedback Hub</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-3">
                <nav className="px-3 space-y-0.5">
                    {/* Dashboard */}
                    <NavLink to="/dashboard" end className={linkClass}>
                        <LayoutDashboard className="h-4 w-4" />Dashboard
                    </NavLink>

                    {/* Feedback Forms section */}
                    <div className="pt-4 pb-1">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-1.5">
                            Feedback Forms
                        </p>
                        <NavLink to="/dashboard/forms" className={linkClass}>
                            <FileText className="h-4 w-4" />My Matrix Forms
                        </NavLink>
                        <NavLink to="/dashboard/create" className={linkClass}>
                            <PlusCircle className="h-4 w-4" />Create Matrix Form
                        </NavLink>
                    </div>

                    {/* Google Forms section */}
                    <div className="pt-4 pb-1">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-1.5">
                            Google Forms
                        </p>
                        <NavLink to="/dashboard/gforms" end className={linkClass}>
                            <Layers className="h-4 w-4" />My Google Forms
                        </NavLink>
                        <NavLink to="/dashboard/gforms/create" className={linkClass}>
                            <PlusCircle className="h-4 w-4" />Create Google Form
                        </NavLink>
                    </div>

                    {/* Bottom links */}
                    <div className="pt-4">
                        <NavLink to="/dashboard/profile" className={linkClass}>
                            <Settings className="h-4 w-4" />Profile Settings
                        </NavLink>
                        {role === 'admin' && (
                            <NavLink to="/admin" className={linkClass}>
                                <User className="h-4 w-4" />Admin Panel
                            </NavLink>
                        )}
                    </div>
                </nav>
            </div>

            {/* Google Forms badge */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-xl p-3 text-center">
                    <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">✨ Google Forms Mode</p>
                    <p className="text-[10px] text-indigo-500 mt-0.5">Multiple question types</p>
                </div>
            </div>
        </aside>
    );
}