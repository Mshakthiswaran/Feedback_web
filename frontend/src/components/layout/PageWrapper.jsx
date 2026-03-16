import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function PageWrapper({ children }) {
    return (
        <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden transition-colors duration-200">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}