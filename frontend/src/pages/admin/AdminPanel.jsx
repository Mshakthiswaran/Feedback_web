import { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import {
    Users, FileText, Trash2, Shield, ShieldAlert,
    BarChart3, Loader2, AlertTriangle, CheckCircle2, UserX, User
} from 'lucide-react';
import adminService from '../../services/adminService';

export default function AdminPanel() {
    const [professors, setProfessors] = useState([]);
    const [stats, setStats] = useState(null);
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('professors');

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [profs, systemStats, allForms] = await Promise.all([
                adminService.getAllProfessors(),
                adminService.getSystemStats(),
                adminService.getAllForms()
            ]);
            setProfessors(profs);
            setStats(systemStats);
            setForms(allForms);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProfessor = async (id) => {
        if (!window.confirm('Are you sure you want to remove this professor? All their forms and submissions will be deleted.')) return;
        try {
            await adminService.deleteProfessor(id);
            setProfessors(professors.filter(p => p.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete professor');
        }
    };

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Securing admin environment…</p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                    <ShieldAlert className="text-red-500" size={32} />
                    System Administration
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Global oversight and professor management.</p>
            </div>

            {/* Admin Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Professors</p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats?.totalProfessors || 0}</h3>
                        <Users className="text-blue-500/20" size={32} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Forms</p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats?.totalForms || 0}</h3>
                        <FileText className="text-indigo-500/20" size={32} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Responses</p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats?.totalSubmissions || 0}</h3>
                        <CheckCircle2 className="text-emerald-500/20" size={32} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Active Forms</p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats?.activeForms || 0}</h3>
                        <BarChart3 className="text-emerald-500/20" size={32} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-100 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('professors')}
                    className={`pb-3 px-2 text-sm font-bold transition-colors relative ${activeTab === 'professors' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Professors
                    {activeTab === 'professors' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('forms')}
                    className={`pb-3 px-2 text-sm font-bold transition-colors relative ${activeTab === 'forms' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    System Forms
                    {activeTab === 'forms' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden animate-fade-in">
                {activeTab === 'professors' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-750">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Professor</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Forms</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {professors.map(prof => (
                                    <tr key={prof.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{prof.name}</p>
                                                    <p className="text-xs text-gray-500">{prof.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{prof.department || 'Not specified'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${prof.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {prof.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">{prof._count?.forms || 0}</td>
                                        <td className="p-4 text-right">
                                            {prof.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteProfessor(prof.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Remove Professor"
                                                >
                                                    <UserX size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-750">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Form Title</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created By</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Responses</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {forms.map(form => (
                                        <tr key={form.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors">
                                            <td className="p-4 font-bold text-gray-900 dark:text-white">{form.title}</td>
                                            <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{form.professor.name}</td>
                                            <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">{form._count.submissions}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${form.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {form.isActive ? 'Active' : 'Closed'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}
