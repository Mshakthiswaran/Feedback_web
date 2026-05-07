import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import formService from '../../services/formService';
import submissionService from '../../services/submissionService';
import {
    Star, Send, ChevronDown, Shield, User, Hash, AlertTriangle,
    Loader2, CheckCircle, Calendar, AlignLeft, Type, List,
    CheckSquare, Circle, Sliders, Minus
} from 'lucide-react';

const RATINGS = [
    { value: 5, label: 'Excellent', color: 'bg-emerald-500' },
    { value: 4, label: 'Very Good', color: 'bg-green-500' },
    { value: 3, label: 'Good', color: 'bg-yellow-500' },
    { value: 2, label: 'Fair', color: 'bg-orange-500' },
    { value: 1, label: 'Poor', color: 'bg-red-500' },
];

function StarRating({ value, onChange, max = 5 }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1">
            {Array.from({ length: max }, (_, i) => i + 1).map(star => (
                <button key={star} type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-110 active:scale-95">
                    <Star size={28}
                        className={`transition-colors ${star <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                </button>
            ))}
            {value > 0 && <span className="ml-2 text-sm font-medium text-amber-600 dark:text-amber-400 self-center">{value} / {max}</span>}
        </div>
    );
}

function LinearScale({ value, onChange, min = 1, max = 10 }) {
    const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    return (
        <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{min}</span>
            {range.map(n => (
                <button key={n} type="button" onClick={() => onChange(n)}
                    className={`w-9 h-9 rounded-full border-2 text-sm font-bold transition-all ${value === n
                        ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg scale-110'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600'}`}>
                    {n}
                </button>
            ))}
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{max}</span>
        </div>
    );
}

function QuestionRenderer({ question, value, onChange }) {
    const inputClass = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm";

    if (question.type === 'section_break') {
        return (
            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{question.label}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-3">
            <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {question.label}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                </p>
            </div>

            {question.type === 'short_answer' && (
                <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
                    placeholder="Your answer" className={inputClass} required={question.required} />
            )}

            {question.type === 'paragraph' && (
                <textarea rows={4} value={value || ''} onChange={e => onChange(e.target.value)}
                    placeholder="Your answer" className={`${inputClass} resize-none`} required={question.required} />
            )}

            {question.type === 'date' && (
                <input type="date" value={value || ''} onChange={e => onChange(e.target.value)}
                    className={inputClass} required={question.required} />
            )}

            {question.type === 'multiple_choice' && (
                <div className="space-y-2">
                    {(question.options || []).map((opt, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${value === opt ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'}`}>
                                {value === opt && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <input type="radio" name={`q-${question.id}`} value={opt} checked={value === opt}
                                onChange={() => onChange(opt)} className="sr-only" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{opt}</span>
                        </label>
                    ))}
                </div>
            )}

            {question.type === 'checkboxes' && (
                <div className="space-y-2">
                    {(question.options || []).map((opt, i) => {
                        const selected = Array.isArray(value) ? value : [];
                        const checked = selected.includes(opt);
                        return (
                            <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'}`}>
                                    {checked && <CheckCircle size={12} className="text-white" />}
                                </div>
                                <input type="checkbox" checked={checked} onChange={() => {
                                    const next = checked ? selected.filter(s => s !== opt) : [...selected, opt];
                                    onChange(next);
                                }} className="sr-only" />
                                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{opt}</span>
                            </label>
                        );
                    })}
                </div>
            )}

            {question.type === 'dropdown' && (
                <select value={value || ''} onChange={e => onChange(e.target.value)}
                    className={inputClass} required={question.required}>
                    <option value="">Choose an option...</option>
                    {(question.options || []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </select>
            )}

            {question.type === 'star_rating' && (
                <StarRating value={value || 0} onChange={onChange} />
            )}

            {question.type === 'linear_scale' && (
                <LinearScale value={value || 0} onChange={onChange}
                    min={question.scaleMin ?? 1} max={question.scaleMax ?? 10} />
            )}
        </div>
    );
}

export default function CustomFeedbackForm() {
    const { formId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [rollNumber, setRollNumber] = useState('');
    const [studentName, setStudentName] = useState('');
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [confirmMsg, setConfirmMsg] = useState('');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        formService.getFormById(formId)
            .then(data => setForm(data))
            .catch(() => setForm('error'));
    }, [formId]);

    useEffect(() => {
        if (!form || form === 'error') return;
        const required = form.questions?.filter(q => q.required && q.type !== 'section_break') || [];
        if (required.length === 0) { setProgress(100); return; }
        const filled = required.filter(q => {
            const v = answers[q.id];
            if (!v) return false;
            if (Array.isArray(v)) return v.length > 0;
            return String(v).trim().length > 0;
        });
        setProgress(Math.round((filled.length / required.length) * 100));
    }, [answers, form]);

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rollNumber.trim()) { alert('Please enter your Roll Number.'); return; }

        // Check required fields
        const missing = form.questions?.filter(q =>
            q.required && q.type !== 'section_break' && (!answers[q.id] || (Array.isArray(answers[q.id]) && answers[q.id].length === 0))
        );
        if (missing?.length > 0) {
            alert(`Please answer all required fields: ${missing.map(q => `"${q.label}"`).join(', ')}`);
            return;
        }

        setSubmitting(true);
        try {
            const questionResponses = Object.entries(answers).map(([questionId, value]) => {
                const q = form.questions.find(q => q.id === questionId);
                if (!q) return null;
                if (['multiple_choice', 'dropdown'].includes(q.type)) {
                    return { questionId, textValue: null, selectedOpts: value ? [value] : [] };
                } else if (q.type === 'checkboxes') {
                    return { questionId, textValue: null, selectedOpts: Array.isArray(value) ? value : [] };
                } else {
                    return { questionId, textValue: String(value), selectedOpts: [] };
                }
            }).filter(Boolean);

            const result = await submissionService.submitFeedback(formId, {
                studentName: studentName || null,
                rollNumber,
                studentEmail: null,
                overallComment: null,
                answers: [],
                questionResponses,
            });

            setConfirmMsg(result.confirmationMessage || form.confirmationMessage || 'Thank you for your response!');
            setSubmitted(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit. You may have already submitted this form.');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── States ───────────────────────────────────────────────
    if (form === 'error') return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
                <AlertTriangle className="text-red-500 mx-auto mb-4" size={40} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Form Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400">This form doesn't exist or has been removed.</p>
            </div>
        </div>
    );

    if (!form) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
    );

    if (!form.isActive) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
                <Shield className="text-amber-500 mx-auto mb-4" size={40} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Form Closed</h2>
                <p className="text-gray-500 dark:text-gray-400">This form is no longer accepting responses.</p>
            </div>
        </div>
    );

    const themeColor = form.themeColor || '#6366f1';

    // ─── Success screen ─────────────────────────────────────
    if (submitted) return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: `linear-gradient(135deg, ${themeColor}15, ${themeColor}08)` }}>
            <div className="max-w-lg w-full text-center p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}99)` }}>
                    <CheckCircle className="text-white" size={36} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Response Submitted!</h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">{confirmMsg}</p>
            </div>
        </div>
    );

    // ─── Main form ───────────────────────────────────────────
    return (
        <div className="min-h-screen pb-16" style={{ background: `linear-gradient(135deg, ${themeColor}12, ${themeColor}06, #f8fafc)` }}>
            {/* Sticky header */}
            <div className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-700/60 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: themeColor }}>
                            <Type className="text-white" size={14} />
                        </div>
                        <h1 className="font-bold text-gray-900 dark:text-white text-sm truncate">{form.title}</h1>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {form.isAnonymous && (
                            <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full font-medium">
                                <Shield size={11} />Anonymous
                            </span>
                        )}
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%`, background: themeColor }} />
                            </div>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{progress}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 pt-8 space-y-4">
                {/* Color accent + form title */}
                <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="h-2" style={{ background: themeColor }} />
                    <div className="bg-white dark:bg-gray-800 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{form.title}</h2>
                        {form.description && <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{form.description}</p>}
                    </div>
                </div>

                {/* Student info */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <User size={15} className="text-gray-400" />Your Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Full Name (optional)</label>
                            <div className="relative">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)}
                                    placeholder="Your full name"
                                    className="pl-9 w-full p-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-colors"
                                    style={{ '--tw-ring-color': themeColor }} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Roll Number <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" value={rollNumber} onChange={e => setRollNumber(e.target.value)}
                                    required placeholder="e.g. 21CS001"
                                    className="pl-9 w-full p-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions */}
                {form.questions?.map(question => (
                    <QuestionRenderer
                        key={question.id}
                        question={question}
                        value={answers[question.id]}
                        onChange={val => handleAnswer(question.id, val)}
                    />
                ))}

                {/* Submit */}
                <div className="flex justify-center pt-4">
                    <button type="submit" disabled={submitting}
                        className="inline-flex items-center gap-2.5 px-10 py-3.5 rounded-2xl font-bold text-white text-base shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}>
                        {submitting
                            ? <><Loader2 className="animate-spin" size={20} />Submitting…</>
                            : <><Send size={20} className="transition-transform group-hover:translate-x-0.5" />Submit Response</>
                        }
                    </button>
                </div>
            </form>
        </div>
    );
}
