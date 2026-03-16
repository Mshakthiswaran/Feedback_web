import { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { User, Mail, Building2, BookOpen, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/slices/authSlice';
import api from '../../services/api';

export default function Profile() {
    const { user, login } = useAuthStore();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        department: user?.department || '',
        designation: user?.designation || '',
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/profile');
                const data = response.data;
                setFormData({
                    name: data.name || '',
                    department: data.department || '',
                    designation: data.designation || '',
                });
                // Update store if different
                if (data.name !== user?.name) {
                    login(data, localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state.token : null);
                }
            } catch (err) {
                console.error('Failed to fetch profile', err);
            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const response = await api.put('/auth/profile', formData);
            // Update global auth state
            const token = JSON.parse(localStorage.getItem('auth-storage')).state.token;
            login(response.data, token);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (fetching) {
        return (
            <PageWrapper>
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading profile...</p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Account Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your professional profile and account details.</p>
                </div>
            </div>

            <div className="max-w-4xl">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
                    <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105 duration-300">
                                    <User className="text-white" size={48} />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-700 p-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <div className="text-center sm:text-left">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                                <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 justify-center sm:justify-start mt-1">
                                    <Mail size={16} /> {user?.email}
                                </p>
                                <span className="inline-block mt-3 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                                    {user?.role} Account
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {message && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success'
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800'
                                }`}>
                                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                <p className="text-sm font-bold">{message.text}</p>
                            </div>
                        )}

                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <User size={16} className="text-gray-400" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    placeholder="e.g. Dr. John Doe"
                                />
                            </div>
                            <div className="space-y-2 opacity-60 grayscale cursor-not-allowed">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Mail size={16} className="text-gray-400" /> Email Address
                                </label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full p-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed font-medium"
                                />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Email cannot be changed</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Building2 size={16} className="text-gray-400" /> Department
                                </label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full p-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    placeholder="e.g. Computer Science & Engineering"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <BookOpen size={16} className="text-gray-400" /> Designation
                                </label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    className="w-full p-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    placeholder="e.g. Senior Associate Professor"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Update Profile'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </PageWrapper>
    );
}
