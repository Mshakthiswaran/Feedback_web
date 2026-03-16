import { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { PlusCircle, FileText, Users, Calendar, Trash2, Edit, BarChart2, ExternalLink, MoreVertical, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import formService from '../../services/formService';

export default function MyForms() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        setLoading(true);
        try {
            const data = await formService.getMyForms();
            setForms(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load forms');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) return;
        try {
            await formService.deleteForm(id);
            setForms(forms.filter(f => f.id !== id));
        } catch (err) {
            alert('Failed to delete form');
        }
    };

    const toggleActive = async (id) => {
        try {
            await formService.toggleFormActive(id);
            setForms(forms.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
        } catch (err) {
            alert('Failed to toggle form status');
        }
    };

    return (
        <PageWrapper>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Feedback Forms</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">View, manage, and analyze your feedback collections.</p>
                </div>
                <Link
                    to="/dashboard/create"
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <PlusCircle size={20} />
                    <span>Create New Form</span>
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your forms...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-2xl text-center">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                    <button onClick={fetchForms} className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">Try Again</button>
                </div>
            ) : forms.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="text-gray-400 dark:text-gray-500" size={28} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No forms created yet</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
                        Get started by creating your first teacher feedback form to collect responses from students.
                    </p>
                    <Link
                        to="/dashboard/create"
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                        Create your first form now <PlusCircle size={18} />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {forms.map((form) => (
                        <div
                            key={form.id}
                            className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                        >
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${form.isActive
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                        }`}>
                                        {form.isActive ? 'Active' : 'Archived'}
                                    </div>
                                    <button onClick={() => toggleActive(form.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {form.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">
                                    {form.courseName} · {form.semester}
                                </p>

                                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Users size={16} className="text-gray-400" />
                                        <span><span className="font-bold text-gray-900 dark:text-white">{form._count.submissions}</span> Responses</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar size={16} className="text-gray-400" />
                                        <span>Deadline: {new Date(form.deadline).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                                <div className="flex gap-1">
                                    <Link
                                        to={`/dashboard/results/${form.id}`}
                                        className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                        title="View Results"
                                    >
                                        <BarChart2 size={18} />
                                    </Link>
                                    <Link
                                        to={`/dashboard/edit/${form.id}`}
                                        className="p-2 text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Edit Form"
                                    >
                                        <Edit size={18} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(form.id)}
                                        className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        title="Delete Form"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <Link
                                    to={`/feedback/form/${form.id}`}
                                    target="_blank"
                                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                >
                                    View Form <ExternalLink size={14} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PageWrapper>
    );
}