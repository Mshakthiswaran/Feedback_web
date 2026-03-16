import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Send, ChevronDown, GraduationCap, BookOpen, Clock, Shield, User, Hash, AlertTriangle, Loader2 } from 'lucide-react';
import formService from '../../services/formService';
import submissionService from '../../services/submissionService';

// Demo form data — in production this would come from the API
const DEMO_FORM = {
    title: 'Teacher Feedback Collection System',
    courseName: 'B.Tech Computer Science',
    semester: 'Sem 3',
    academicYear: '2025-26',
    isAnonymous: true,
    columns: [
        { id: 'c1', name: 'Industrial Management And Engineering Economics' },
        { id: 'c2', name: 'Digital Image Processing' },
    ],
    rows: [
        { id: 'r1', label: '1.0 PLANNING AND ORGANISATION', isHeader: true },
        { id: 'r2', label: '1.1 Teaching is well planned and well organised', isHeader: false },
        { id: 'r3', label: '1.2 Aim / Objectives of the subject made clear', isHeader: false },
        { id: 'r4', label: '2.0 PRESENTATION', isHeader: true },
        { id: 'r5', label: '2.1 Communicates clearly and effectively', isHeader: false },
        { id: 'r6', label: '2.2 Uses examples and illustrations', isHeader: false },
        { id: 'r7', label: '2.3 Pace of teaching is appropriate', isHeader: false },
        { id: 'r8', label: '3.0 STUDENT INTERACTION', isHeader: true },
        { id: 'r9', label: '3.1 Encourages questions and discussion', isHeader: false },
        { id: 'r10', label: '3.2 Is available for consultation', isHeader: false },
    ],
};

const RATINGS = [
    { value: 5, label: 'Excellent', color: 'bg-emerald-500' },
    { value: 4, label: 'Very Good', color: 'bg-green-500' },
    { value: 3, label: 'Good', color: 'bg-yellow-500' },
    { value: 2, label: 'Fair', color: 'bg-orange-500' },
    { value: 1, label: 'Poor', color: 'bg-red-500' },
];

function RatingSelect({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const selected = RATINGS.find(r => r.value === value);

    return (
        <div className="relative inline-block">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm border transition-all duration-150 min-w-[90px] justify-between ${value
                    ? `${selected.color} text-white border-transparent hover:opacity-90`
                    : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                    }`}
            >
                <span>{value ? `${value} - ${selected.label}` : 'Rate'}</span>
                <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute z-20 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                        {RATINGS.map(r => (
                            <button
                                key={r.value}
                                type="button"
                                onClick={() => { onChange(r.value); setOpen(false); }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${value === r.value ? 'bg-blue-50 dark:bg-blue-900/30 font-semibold' : ''
                                    }`}
                            >
                                <span className={`w-2.5 h-2.5 rounded-full ${r.color}`} />
                                <span className="text-gray-700 dark:text-gray-300">{r.value} - {r.label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function FeedbackForm() {
    const { formId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [ratings, setRatings] = useState({});
    const [studentName, setStudentName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const data = await formService.getFormById(formId);
                setForm(data);
            } catch (err) {
                console.error(err);
                setForm('error');
            }
        };
        fetchForm();
    }, [formId]);

    // Initialize all ratings to 5 (Excellent) by default
    useEffect(() => {
        if (!form) return;
        console.log('Initializing form with default ratings (5):', form.id);
        const defaultRatings = {};
        form.rows.forEach(row => {
            if (!row.isHeader) {
                form.columns.forEach(col => {
                    defaultRatings[`${row.id}:::${col.id}`] = 5;
                });
            }
        });
        setRatings(defaultRatings);
    }, [form]);

    // Calculate progress
    useEffect(() => {
        if (!form) return;
        const totalCells = form.rows.filter(r => !r.isHeader).length * form.columns.length;
        const filledCells = Object.entries(ratings).filter(([key, val]) => key.includes(':::') && val > 0).length;
        // User requested default is 5, but for progress bar it should probably reflect "completed"
        // If we want it to be 100% since they are all 5, we keep it as is.
        // But subagent reporting 100% when "Rate" is shown means there's a key mismatch.
        setProgress(totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0);
        console.log(`Progress check: ${filledCells}/${totalCells} cells filled.`);
    }, [ratings, form]);

    const handleRating = (rowId, colId, value) => {
        console.log(`Setting rating for ${rowId}:::${colId} to ${value}`);
        setRatings(prev => ({ ...prev, [`${rowId}:::${colId}`]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final validation
        if (!studentName.trim() || !studentId.trim()) {
            alert('Please enter your Name and Student ID before submitting.');
            return;
        }

        const totalQuestions = form.rows.filter(r => !r.isHeader).length * form.columns.length;
        const currentRatings = Object.entries(ratings).filter(([key, val]) => key.includes(':::') && val > 0);

        if (currentRatings.length < totalQuestions) {
            alert(`Please rate all criteria for all subjects before submitting. (${currentRatings.length}/${totalQuestions} completed)`);
            return;
        }

        setSubmitting(true);
        try {
            const submissionData = {
                studentName,
                rollNumber: studentId,
                studentEmail: null,
                overallComment: comments,
                answers: currentRatings.map(([key, value]) => {
                    const [rowId, columnId] = key.split(':::');
                    return { rowId, columnId, rating: value };
                })
            };

            console.log('Submitting data:', submissionData);
            await submissionService.submitFeedback(formId, submissionData);
            navigate('/feedback/thank-you');
        } catch (err) {
            console.error('Submission error:', err);
            alert(err.response?.data?.message || 'Failed to submit feedback. You might have already submitted for this form.');
        } finally {
            setSubmitting(false);
        }
    };

    if (form === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Form Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">The feedback form you're looking for doesn't exist or has been removed.</p>
                    <button onClick={() => navigate('/')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg">Go Back Home</button>
                </div>
            </div>
        );
    }

    if (!form) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading feedback form…</p>
                </div>
            </div>
        );
    }

    if (!form.isActive) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="text-amber-600 dark:text-amber-400" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Form Closed</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">This feedback form is no longer accepting responses. Please contact your professor if you believe this is an error.</p>
                    <button onClick={() => navigate('/')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg">Go Back Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-700/60 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <GraduationCap className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{form.title}</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{form.courseName} · {form.semester} · {form.academicYear}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {form.isAnonymous && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full font-medium">
                                <Shield size={14} />
                                Anonymous
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-gray-600 dark:text-gray-300 font-medium text-xs">{progress}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 py-8">

                {/* Student Info */}
                <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 p-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <User size={16} className="text-blue-500" />
                        Student Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    required
                                    placeholder="Enter your full name"
                                    className="pl-9 w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Student ID / Roll Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Hash className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    required
                                    placeholder="Enter your student ID"
                                    className="pl-9 w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rating Legend */}
                <div className="mb-6 flex flex-wrap gap-3 justify-center">
                    {RATINGS.map(r => (
                        <div key={r.value} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <span className={`w-2.5 h-2.5 rounded-full ${r.color}`} />
                            {r.value} = {r.label}
                        </div>
                    ))}
                </div>

                {/* Matrix Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-750 dark:to-gray-800">
                                    <th className="p-4 border-b border-r border-gray-200 dark:border-gray-700 min-w-[320px]">
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
                                            <BookOpen size={16} className="text-blue-500" />
                                            Evaluation Criteria
                                        </div>
                                    </th>
                                    {form.columns.map(col => (
                                        <th key={col.id} className="p-4 border-b border-r border-gray-200 dark:border-gray-700 min-w-[160px] text-center">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{col.name}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {form.rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${row.isHeader
                                            ? 'bg-blue-50/60 dark:bg-blue-900/20'
                                            : 'hover:bg-gray-50/50 dark:hover:bg-gray-750/50'
                                            }`}
                                    >
                                        <td className={`p-4 border-r border-gray-200 dark:border-gray-700 ${row.isHeader
                                            ? 'font-bold text-gray-900 dark:text-white text-sm'
                                            : 'text-gray-600 dark:text-gray-300 text-sm pl-8'
                                            }`}>
                                            {row.label}
                                        </td>
                                        {form.columns.map(col => (
                                            <td key={`${row.id}-${col.id}`} className="p-3 border-r border-gray-200 dark:border-gray-700 text-center">
                                                {!row.isHeader ? (
                                                    <RatingSelect
                                                        value={ratings[`${row.id}:::${col.id}`] || 0}
                                                        onChange={(v) => handleRating(row.id, col.id, v)}
                                                    />
                                                ) : null}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Comments */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 p-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Additional Comments (Optional)
                    </label>
                    <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows={4}
                        placeholder="Share any additional feedback, suggestions, or comments…"
                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-sm"
                    />
                </div>

                {/* Submit */}
                <div className="mt-8 flex flex-col items-center gap-4">
                    <button
                        type="submit"
                        disabled={submitting || progress === 0}
                        className="group relative inline-flex items-center justify-center gap-2.5 px-10 py-3.5 rounded-2xl font-bold text-white text-base shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                Submitting…
                            </>
                        ) : (
                            <>
                                <Send size={20} className="transition-transform group-hover:translate-x-0.5" />
                                Submit Feedback
                            </>
                        )}
                    </button>
                    {progress < 100 && progress > 0 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Clock size={14} />
                            You've completed {progress}% — you can still submit partial feedback
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}
