import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, User, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/slices/authSlice';

export default function Sidebar() {
    const role = useAuthStore((state) => state.user?.role);

    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Forms', path: '/dashboard/forms', icon: FileText },
        { name: 'Create Form', path: '/dashboard/create', icon: PlusCircle },
        { name: 'Profile Settings', path: '/dashboard/profile', icon: Settings },
    ];

    if (role === 'admin') {
        links.push({ name: 'Admin Panel', path: '/admin', icon: User });
    }

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full hidden md:flex flex-col shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">TF</span>
                    </div>
                    <span className="font-bold text-lg dark:text-white text-gray-800">Feedback Hub</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.path === '/dashboard'}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${isActive
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                    }`
                                }
                            >
                                <Icon className="h-5 w-5" />
                                {link.name}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}