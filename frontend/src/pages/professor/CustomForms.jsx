import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import formService from '../../services/formService';
import {
    PlusCircle, FileText, Loader2, Trash2, Share2, BarChart2,
    CheckCircle, XCircle, Calendar, Users, Link2, Copy, CheckCircle2,
    AlertTriangle, Search, Filter
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

function StatusBadge({ isActive }) {
    return isActive
        ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle size={12} />Active</span>
        : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"><XCircle size={12} />Closed</span>;
}

export default function CustomForms() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [shareModal, setShareModal] = useState(null); // formId
    const [copied, setCopied] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchForms = async () => {
        setLoading(true);
        try {
            const all = await formService.getMyForms();
            // Custom/Google forms: those with questions array (no columns/rows or columns.length === 0)
            const custom = all.filter(f => !f.columns?.length && f.questions?.length >= 0);
            setForms(custom);
        } catch (err) {
            setError('Failed to load forms');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchForms(); }, []);

    const handleDelete = async (id) => {
        try {
            await formService.deleteForm(id);
            setForms(prev => prev.filter(f => f.id !== id));
            setDeleteConfirm(null);
        } catch {
            alert('Failed to delete form');
        }
    };

    const handleToggle = async (id) => {
        try {
            const updated = await formService.toggleFormActive(id);
            setForms(prev => prev.map(f => f.id === id ? { ...f, isActive: updated.isActive } : f));
        } catch {
            alert('Failed to toggle form');
        }
    };

    const shareLink = (id) => `${window.location.origin}/gform/${id}`;

    const handleCopy = (id) => {
        navigator.clipboard.writeText(shareLink(id));
        setCopied(id);
        setTimeout(() => setCopied(false), 2000);
    };

    const filtered = forms.filter(f =>
        f.title.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <PageWrapper>
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your forms...</p>
            </div>
        </PageWrapper>
    );

    return (
        <PageWrapper>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Google Forms</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage flexible forms with multiple question types</p>
                </div>
                <Link to="/dashboard/gforms/create"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]">
                    <PlusCircle size={18} /> New Form
                </Link>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search forms..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full sm:w-80 pl-9 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertTriangle size={18} /><p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {filtered.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="text-indigo-500" size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No forms yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Create your first Google-style form to collect responses</p>
                    <Link to="/dashboard/gforms/create"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl">
                        <PlusCircle size={16} /> Create First Form
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map(form => (
                        <div key={form.id} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
                            {/* Color bar */}
                            <div className="h-1.5" style={{ background: form.themeColor || '#6366f1' }} />

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{form.title}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <StatusBadge isActive={form.isActive} />
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Users size={11} />{form._count?.submissions || 0} responses
                                            </span>
                                        </div>
                                    </div>
                                    {form.themeColor && (
                                        <div className="w-4 h-4 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: form.themeColor }} />
                                    )}
                                </div>

                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                                    <div className="flex items-center gap-1.5">
                                        <FileText size={12} />
                                        {form.questions?.length || 0} questions
                                    </div>
                                    {form.deadline && (
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={12} />
                                            Due {new Date(form.deadline).toLocaleDateString()}
                                        </div>
                                    )}
                                    {form.maxResponses && (
                                        <div className="flex items-center gap-1.5">
                                            <Filter size={12} />
                                            Max {form.maxResponses} responses
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="mt-auto flex flex-wrap gap-2">
                                    <Link to={`/dashboard/gforms/results/${form.id}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 transition-colors">
                                        <BarChart2 size={13} /> Results
                                    </Link>
                                    <button onClick={() => setShareModal(form.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 transition-colors">
                                        <Share2 size={13} /> Share
                                    </button>
                                    <button onClick={() => handleToggle(form.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${form.isActive ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200'}`}>
                                        {form.isActive ? <XCircle size={13} /> : <CheckCircle size={13} />}
                                        {form.isActive ? 'Close' : 'Open'}
                                    </button>
                                    <button onClick={() => setDeleteConfirm(form.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 transition-colors ml-auto">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Share Modal */}
            {shareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShareModal(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-4">Share Form</h3>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 mb-4 flex justify-center">
                            <div className="bg-white p-3 rounded-xl shadow">
                                <QRCodeCanvas value={shareLink(shareModal)} size={140} level="H" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
                            <Link2 size={14} className="text-gray-400 flex-shrink-0" />
                            <input readOnly value={shareLink(shareModal)} className="flex-1 bg-transparent text-xs text-gray-600 dark:text-gray-300 truncate outline-none" />
                            <button onClick={() => handleCopy(shareModal)}
                                className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${copied === shareModal ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}>
                                {copied === shareModal ? <><CheckCircle2 size={12} />Copied!</> : <><Copy size={12} />Copy</>}
                            </button>
                        </div>
                        <button onClick={() => setShareModal(null)} className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Close</button>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="text-red-600" size={22} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">Delete Form?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">This will permanently delete the form and all its responses.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
}
