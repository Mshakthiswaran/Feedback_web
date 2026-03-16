import { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import SummaryCards from '../../components/dashboard/SummaryCards';
import { Loader2, PlusCircle, ArrowRight, FileText, Calendar, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import formService from '../../services/formService';
import submissionService from '../../services/submissionService';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalSubmissions: 0,
        responseRate: 0,
        averageRating: 0,
        activeForms: 0
    });
    const [recentForms, setRecentForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const forms = await formService.getMyForms();
                setRecentForms(forms.slice(0, 3));

                // Calculate stats centrally for now
                const totalSubmissions = forms.reduce((sum, f) => sum + f._count.submissions, 0);
                const activeForms = forms.filter(f => f.isActive).length;

                // Average rating would need aggregated stats from backend
                // For now, let's just show total submissions and active forms
                setStats({
                    totalSubmissions,
                    activeForms,
                    responseRate: forms.length > 0 ? Math.round((totalSubmissions / (forms.length * 50)) * 100) : 0, // Dummy calc for rate
                    averageRating: 0 // Will wire later
                });
            } catch (err) {
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading dashboard overview...</p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Professor Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back. Here's an overview of your feedback collections.</p>
                </div>
                <Link
                    to="/dashboard/create"
                    className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] items-center gap-2"
                >
                    <PlusCircle size={20} />
                    <span>New Form</span>
                </Link>
            </div>

            <SummaryCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Recent Forms */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Forms</h2>
                        <Link to="/dashboard/forms" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-750">
                        {recentForms.length > 0 ? (
                            recentForms.map(form => (
                                <Link key={form.id} to={`/dashboard/results/${form.id}`} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                            <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{form.title}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{form.courseName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{form._count.submissions}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Responses</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <p>No forms yet. Click "New Form" to get started.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Tips or Stats */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-4">Improve Response Rates</h2>
                        <ul className="space-y-4">
                            <li className="flex gap-3 text-indigo-100">
                                <div className="p-1 h-fit bg-white/20 rounded-md">
                                    <Shield size={16} />
                                </div>
                                <p className="text-sm">Anonymous forms typically get 40% more responses from students.</p>
                            </li>
                            <li className="flex gap-3 text-indigo-100">
                                <div className="p-1 h-fit bg-white/20 rounded-md">
                                    <Calendar size={16} />
                                </div>
                                <p className="text-sm">Setting clear deadlines helps ensure students submit feedback on time.</p>
                            </li>
                        </ul>
                    </div>
                    <Link
                        to="/dashboard/create"
                        className="relative z-10 mt-8 bg-white text-indigo-600 font-bold py-3 px-6 rounded-xl text-center hover:bg-indigo-50 transition-colors shadow-lg self-start"
                    >
                        Create Your Next Form
                    </Link>

                    {/* Decorative blobs */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob"></div>
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-blob delay-2000"></div>
                </div>
            </div>
        </PageWrapper>
    );
}
