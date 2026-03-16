import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Save, Calendar, Send, Share2, Link2, CheckCircle2, Copy, AlertCircle, Loader2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import formService from '../../services/formService';

export default function FormBuilder({ formId }) {
    const isEditing = !!formId;
    const [columns, setColumns] = useState([
        { id: 'c1', name: 'Industrial Management And Engineering Economics' },
        { id: 'c2', name: 'Digital Image Processing' }
    ]);

    const [rows, setRows] = useState([
        { id: 'r1', label: '1.0 PLANNING AND ORGANISATION', isHeader: true },
        { id: 'r2', label: '1.1 Teaching is well planned...', isHeader: false },
        { id: 'r3', label: '1.2 Aim / Objectives of the subject made clear', isHeader: false }
    ]);

    const [showShareModal, setShowShareModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditing);
    const [error, setError] = useState(null);
    const [createdFormId, setCreatedFormId] = useState(formId || null);
    const [copied, setCopied] = useState(false);

    const shareLink = createdFormId
        ? `${window.location.origin}/feedback/form/${createdFormId}`
        : `${window.location.origin}/feedback/form/demo-form-id`;

    const addColumn = () => {
        setColumns([...columns, { id: Date.now().toString(), name: `Subject ${columns.length + 1}` }]);
    };

    const removeColumn = (id) => {
        if (columns.length > 1) setColumns(columns.filter(c => c.id !== id));
    };

    const updateColumn = (id, newName) => {
        setColumns(columns.map(c => c.id === id ? { ...c, name: newName } : c));
    };

    const addRow = (isHeader) => {
        setRows([...rows, {
            id: Date.now().toString(),
            label: isHeader ? 'New Section' : 'New Criteria...',
            isHeader
        }]);
    };

    const removeRow = (id) => {
        if (rows.length > 1) setRows(rows.filter(r => r.id !== id));
    };

    const updateRow = (id, updates) => {
        setRows(rows.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const [formData, setFormData] = useState({
        title: 'Teacher Feedback Collection System',
        courseName: '',
        subjectCode: '',
        semester: '',
        academicYear: '',
        deadline: '',
        isAnonymous: true,
        pinProtected: false,
        pin: '',
        isActive: true,
    });

    useEffect(() => {
        if (isEditing) {
            const fetchForm = async () => {
                setIsLoading(true);
                try {
                    const data = await formService.getFormById(formId);
                    setFormData({
                        title: data.title,
                        courseName: data.courseName,
                        subjectCode: data.subjectCode,
                        semester: data.semester,
                        academicYear: data.academicYear,
                        deadline: data.deadline.split('T')[0],
                        isAnonymous: data.isAnonymous,
                        pinProtected: data.pinProtected,
                        pin: data.pin || '',
                        isActive: data.isActive,
                    });
                    setColumns(data.columns.map(c => ({ id: c.id, name: c.subjectName })));
                    setRows(data.rows.map(r => ({ id: r.id, label: r.label, isHeader: r.isHeader })));
                } catch (err) {
                    setError('Failed to load form for editing');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchForm();
        }
    }, [formId, isEditing]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveDraft = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const data = {
                ...formData,
                columns: columns.map(c => ({ name: c.name })),
                rows: rows.map(r => ({ label: r.label, isHeader: r.isHeader })),
                isActive: false
            };
            if (isEditing) {
                await formService.updateForm(formId, data);
            } else {
                const result = await formService.createForm(data);
                setCreatedFormId(result.id);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save draft');
        } finally {
            setIsSaving(true);
            setTimeout(() => setIsSaving(false), 1000);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.courseName || !formData.deadline) {
            setError('Please fill in required fields (Title, Course, Deadline)');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            const data = {
                ...formData,
                columns: columns.map(c => ({ name: c.name })),
                rows: rows.map(r => ({ label: r.label, isHeader: r.isHeader })),
                isActive: true
            };
            if (isEditing) {
                await formService.updateForm(formId, data);
                // navigate back or show success? Let's show share modal
                setShowShareModal(true);
            } else {
                const result = await formService.createForm(data);
                setCreatedFormId(result.id);
                setShowShareModal(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit form');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading form configuration...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Basic Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4 lg:col-span-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Name</label>
                    <input type="text" name="courseName" value={formData.courseName} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="e.g. B.Tech Computer Science" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                    <input type="text" name="semester" value={formData.semester} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="e.g. Sem 3" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Academic Year</label>
                    <input type="text" name="academicYear" value={formData.academicYear} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="e.g. 2025-26" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><Calendar size={16} /> Deadline</label>
                    <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>

                <div className="flex flex-col gap-3 justify-center pl-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="isAnonymous" checked={formData.isAnonymous} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Anonymous Submissions</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Form is Open (accepting responses)</span>
                    </label>
                </div>
            </div>

            {/* Matrix Table Builder */}
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Form Structure (Subjects vs Criteria)</h3>
                    <div className="flex gap-2">
                        <button onClick={() => addColumn()} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors">
                            <PlusCircle size={16} /> Add Subject Column
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                                <th className="p-3 border-r border-gray-200 dark:border-gray-700 w-1/3 min-w-[300px]">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Evaluation Criteria</span>
                                </th>
                                {columns.map((col, idx) => (
                                    <th key={col.id} className="p-3 border-r border-gray-200 dark:border-gray-700 min-w-[200px] relative group">
                                        <input
                                            type="text"
                                            value={col.name}
                                            onChange={(e) => updateColumn(col.id, e.target.value)}
                                            className="w-full bg-transparent font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                                            placeholder={`Subject ${idx + 1}`}
                                        />
                                        {columns.length > 1 && (
                                            <button onClick={() => removeColumn(col.id)} className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded shadow-sm">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rowIdx) => (
                                <tr key={row.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750/50">
                                    <td className={`p-3 border-r border-gray-200 dark:border-gray-700 relative group flex gap-2 ${row.isHeader ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>
                                        <div className="flex-1 flex flex-col">
                                            <input
                                                type="text"
                                                value={row.label}
                                                onChange={(e) => updateRow(row.id, { label: e.target.value })}
                                                className={`w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 ${row.isHeader ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                                                placeholder={row.isHeader ? "Section Header (e.g. 1.0 PLANNING)" : "Criteria Label (e.g. 1.1 Teaching is well planned)"}
                                            />
                                        </div>
                                        {rows.length > 1 && (
                                            <button onClick={() => removeRow(row.id)} className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                    {columns.map(col => (
                                        <td key={`${row.id}-${col.id}`} className={`p-3 border-r border-gray-200 dark:border-gray-700 text-center ${row.isHeader ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>
                                            {!row.isHeader ? (
                                                <div className="inline-block relative">
                                                    <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded flex items-center justify-center gap-1 shadow-sm opacity-60 cursor-not-allowed text-sm">
                                                        5 <span className="text-[10px]">▼</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-transparent select-none">-</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex gap-3">
                    <button onClick={() => addRow(true)} className="flex items-center gap-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                        <PlusCircle size={16} /> Add Section Header
                    </button>
                    <button onClick={() => addRow(false)} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors">
                        <PlusCircle size={16} /> Add Criteria Row
                    </button>
                </div>
            </div>

            {/* ─── Action Bar: Save Draft · Submit · Share ─── */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    {/* Save Draft */}
                    <button
                        onClick={handleSaveDraft}
                        className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                Saving…
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Draft
                            </>
                        )}
                    </button>

                    {/* Submit Form */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.97] disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Submitting…</span>
                            </>
                        ) : (
                            <>
                                <Send size={18} className="transition-transform group-hover:translate-x-0.5" />
                                Submit Form
                            </>
                        )}
                    </button>

                    {/* Share Link */}
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.97]"
                    >
                        <Share2 size={18} className="transition-transform group-hover:rotate-12" />
                        Share Link
                    </button>
                </div>
            </div>

            {/* ─── Share Modal ─── */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowShareModal(false)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 p-6 animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 mb-6 font-medium">
                            <div className="bg-white p-3 rounded-xl shadow-inner border border-gray-200">
                                <QRCodeCanvas value={shareLink} size={160} level="H" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Scan QR code to open on mobile</p>
                        </div>

                        {/* Link copy */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Share via Link</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <Link2 size={16} className="text-gray-400 flex-shrink-0" />
                                    <input
                                        readOnly
                                        value={shareLink}
                                        className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 truncate focus:outline-none"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${copied
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60'
                                            }`}
                                    >
                                        {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                                    </button>
                                </div>

                                {/* Share options */}
                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm font-medium">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.567c-.248.694-.927 1.276-1.544 1.487-.42.144-.973.259-2.83-.608-2.376-1.11-3.897-3.513-4.014-3.677-.117-.164-.955-1.271-.955-2.424s.603-1.72.818-1.955c.215-.235.47-.294.627-.294s.313.004.45.008c.145.004.339-.055.53.404.198.474.668 1.633.727 1.752.059.118.098.257.02.414-.08.157-.118.254-.236.392-.118.138-.248.308-.354.413-.118.118-.241.246-.104.482.138.236.613 1.012 1.316 1.639.904.807 1.665 1.057 1.902 1.175.236.118.374.099.512-.059.138-.157.59-.688.748-.925.157-.236.315-.197.531-.118.217.079 1.374.648 1.61.766.236.118.394.177.453.275.059.098.059.57-.189 1.264z" /></svg>
                                        WhatsApp
                                    </button>
                                    <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm font-medium">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-500"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                                        Email
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="w-full py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}