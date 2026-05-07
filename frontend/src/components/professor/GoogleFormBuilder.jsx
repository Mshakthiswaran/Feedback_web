import { useState } from 'react';
import {
    PlusCircle, Trash2, GripVertical, ChevronDown, ChevronUp,
    Type, AlignLeft, CheckSquare, Circle, List, Sliders, Star,
    Calendar, Minus, Settings, Share2, Link2, Copy, CheckCircle2,
    Loader2, AlertCircle, Send, Eye, ToggleLeft, ToggleRight
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import formService from '../../services/formService';

const QUESTION_TYPES = [
    { value: 'short_answer', label: 'Short Answer', icon: Type },
    { value: 'paragraph', label: 'Paragraph', icon: AlignLeft },
    { value: 'multiple_choice', label: 'Multiple Choice', icon: Circle },
    { value: 'checkboxes', label: 'Checkboxes', icon: CheckSquare },
    { value: 'dropdown', label: 'Dropdown', icon: List },
    { value: 'linear_scale', label: 'Linear Scale', icon: Sliders },
    { value: 'star_rating', label: 'Star Rating', icon: Star },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'section_break', label: 'Section Break', icon: Minus },
];

const THEME_COLORS = [
    { label: 'Indigo', value: '#6366f1' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Violet', value: '#8b5cf6' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Teal', value: '#14b8a6' },
    { label: 'Slate', value: '#64748b' },
];

function QuestionTypeIcon({ type, size = 16 }) {
    const qt = QUESTION_TYPES.find(q => q.value === type);
    if (!qt) return null;
    const Icon = qt.icon;
    return <Icon size={size} />;
}

function QuestionPreview({ question }) {
    if (question.type === 'section_break') {
        return (
            <div className="border-t-2 border-gray-200 dark:border-gray-600 pt-3">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {question.label || 'Section Break'}
                </p>
            </div>
        );
    }
    return (
        <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {question.label || 'Untitled Question'}
                {question.required && <span className="text-red-500 ml-1">*</span>}
            </p>
            {question.type === 'short_answer' && (
                <div className="h-9 bg-gray-100 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600" />
            )}
            {question.type === 'paragraph' && (
                <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600" />
            )}
            {question.type === 'date' && (
                <div className="h-9 w-40 bg-gray-100 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600" />
            )}
            {(question.type === 'multiple_choice' || question.type === 'checkboxes') && (
                <div className="space-y-1.5">
                    {(question.options?.length ? question.options : ['Option 1', 'Option 2']).map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className={`w-4 h-4 border-2 border-gray-400 flex-shrink-0 ${question.type === 'multiple_choice' ? 'rounded-full' : 'rounded'}`} />
                            {opt}
                        </div>
                    ))}
                </div>
            )}
            {question.type === 'dropdown' && (
                <div className="flex items-center gap-2 h-9 px-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-400">
                    {question.options?.[0] || 'Choose an option'} <ChevronDown size={14} className="ml-auto" />
                </div>
            )}
            {question.type === 'linear_scale' && (
                <div className="flex items-center gap-2">
                    {Array.from({ length: (question.scaleMax || 5) - (question.scaleMin || 1) + 1 }, (_, i) => (question.scaleMin || 1) + i).map(n => (
                        <div key={n} className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs text-gray-500">{n}</div>
                    ))}
                </div>
            )}
            {question.type === 'star_rating' && (
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} className="text-gray-300 dark:text-gray-600 fill-current" />)}
                </div>
            )}
        </div>
    );
}

function QuestionEditor({ question, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
    const [expanded, setExpanded] = useState(true);

    const updateOption = (idx, val) => {
        const opts = [...(question.options || [])];
        opts[idx] = val;
        onChange({ ...question, options: opts });
    };
    const addOption = () => onChange({ ...question, options: [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`] });
    const removeOption = (idx) => onChange({ ...question, options: question.options.filter((_, i) => i !== idx) });

    const hasOptions = ['multiple_choice', 'checkboxes', 'dropdown'].includes(question.type);
    const hasScale = ['linear_scale'].includes(question.type);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                <GripVertical size={16} className="text-gray-400 cursor-grab flex-shrink-0" />
                <span className="p-1.5 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                    <QuestionTypeIcon type={question.type} size={14} />
                </span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {QUESTION_TYPES.find(q => q.value === question.type)?.label}
                </span>
                <div className="ml-auto flex items-center gap-1">
                    <button onClick={() => !isFirst && onMoveUp()} disabled={isFirst}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 transition-colors">
                        <ChevronUp size={14} className="text-gray-500" />
                    </button>
                    <button onClick={() => !isLast && onMoveDown()} disabled={isLast}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 transition-colors">
                        <ChevronDown size={14} className="text-gray-500" />
                    </button>
                    <button onClick={onRemove}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                    </button>
                    <button onClick={() => setExpanded(!expanded)}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ml-1">
                        {expanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Type selector */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Question Type</label>
                            <select
                                value={question.type}
                                onChange={e => onChange({ ...question, type: e.target.value, options: ['Option 1', 'Option 2'], scaleMin: 1, scaleMax: 5 })}
                                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            >
                                {QUESTION_TYPES.map(qt => (
                                    <option key={qt.value} value={qt.value}>{qt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Label */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                {question.type === 'section_break' ? 'Section Title' : 'Question Label'}
                            </label>
                            <input
                                type="text"
                                value={question.label}
                                onChange={e => onChange({ ...question, label: e.target.value })}
                                placeholder={question.type === 'section_break' ? 'e.g. Personal Information' : 'Enter your question...'}
                                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Options for choice types */}
                    {hasOptions && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Options</label>
                            <div className="space-y-2">
                                {(question.options || []).map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className={`w-4 h-4 border-2 border-gray-400 flex-shrink-0 ${question.type === 'multiple_choice' ? 'rounded-full' : 'rounded'}`} />
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={e => updateOption(idx, e.target.value)}
                                            className="flex-1 p-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {(question.options?.length || 0) > 1 && (
                                            <button onClick={() => removeOption(idx)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={addOption} className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 mt-1">
                                    <PlusCircle size={14} /> Add option
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Scale settings */}
                    {hasScale && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Min Value</label>
                                <input type="number" min={0} max={10} value={question.scaleMin ?? 1}
                                    onChange={e => onChange({ ...question, scaleMin: parseInt(e.target.value) })}
                                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Max Value</label>
                                <input type="number" min={1} max={10} value={question.scaleMax ?? 5}
                                    onChange={e => onChange({ ...question, scaleMax: parseInt(e.target.value) })}
                                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                            </div>
                        </div>
                    )}

                    {/* Required toggle (not for section_break) */}
                    {question.type !== 'section_break' && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Required</span>
                            <button onClick={() => onChange({ ...question, required: !question.required })}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${question.required ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                                {question.required ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Preview strip */}
            {expanded && question.type !== 'section_break' && (
                <div className="px-4 pb-4">
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800/30">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Eye size={10} /> Preview</p>
                        <QuestionPreview question={question} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function GoogleFormBuilder({ formId }) {
    const isEditing = !!formId;
    const [formData, setFormData] = useState({
        title: 'Untitled Form',
        description: '',
        deadline: '',
        isAnonymous: true,
        isActive: true,
        confirmationMessage: 'Thank you for submitting your response!',
        maxResponses: '',
        themeColor: '#6366f1',
    });
    const [questions, setQuestions] = useState([
        { id: Date.now().toString(), type: 'short_answer', label: 'Your Name', required: true, options: [], scaleMin: 1, scaleMax: 5 },
    ]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [createdFormId, setCreatedFormId] = useState(formId || null);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('questions'); // questions | settings

    const shareLink = createdFormId
        ? `${window.location.origin}/gform/${createdFormId}`
        : `${window.location.origin}/gform/preview`;

    const addQuestion = (type = 'short_answer') => {
        setQuestions(prev => [...prev, {
            id: Date.now().toString(),
            type,
            label: '',
            required: false,
            options: ['multiple_choice', 'checkboxes', 'dropdown'].includes(type) ? ['Option 1', 'Option 2'] : [],
            scaleMin: 1,
            scaleMax: 5,
        }]);
    };

    const updateQuestion = (id, updated) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updated } : q));
    };

    const removeQuestion = (id) => {
        if (questions.length > 1) setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const moveQuestion = (id, dir) => {
        setQuestions(prev => {
            const idx = prev.findIndex(q => q.id === id);
            const newArr = [...prev];
            const target = idx + dir;
            if (target < 0 || target >= newArr.length) return prev;
            [newArr[idx], newArr[target]] = [newArr[target], newArr[idx]];
            return newArr;
        });
    };

    const buildPayload = (active) => ({
        title: formData.title,
        courseName: '',
        subjectCode: '',
        semester: '',
        academicYear: '',
        deadline: formData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isAnonymous: formData.isAnonymous,
        isActive: active,
        confirmationMessage: formData.confirmationMessage,
        maxResponses: formData.maxResponses ? parseInt(formData.maxResponses) : null,
        themeColor: formData.themeColor,
        columns: [],
        rows: [],
        questions: questions.map((q, i) => ({
            type: q.type,
            label: q.label || 'Untitled Question',
            options: q.options || [],
            required: q.required || false,
            scaleMin: q.scaleMin,
            scaleMax: q.scaleMax,
            order: i,
        })),
    });

    const handleSave = async () => {
        setIsSaving(true); setError(null);
        try {
            if (isEditing || createdFormId) {
                await formService.updateForm(createdFormId || formId, buildPayload(false));
            } else {
                const result = await formService.createForm(buildPayload(false));
                setCreatedFormId(result.id);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!formData.title.trim()) { setError('Please enter a form title.'); return; }
        if (questions.filter(q => q.type !== 'section_break').length === 0) { setError('Add at least one question.'); return; }
        setIsPublishing(true); setError(null);
        try {
            if (isEditing || createdFormId) {
                await formService.updateForm(createdFormId || formId, buildPayload(true));
            } else {
                const result = await formService.createForm(buildPayload(true));
                setCreatedFormId(result.id);
            }
            setShowShareModal(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to publish');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-4">
            {/* Color accent bar */}
            <div className="h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${formData.themeColor}, ${formData.themeColor}88)` }} />

            {/* Error */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle size={18} /> <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Form title card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-l-4 shadow-sm overflow-hidden" style={{ borderColor: formData.themeColor }}>
                <div className="p-6 space-y-3">
                    <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                        placeholder="Form Title"
                        className="w-full text-2xl font-bold bg-transparent border-b-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 outline-none text-gray-900 dark:text-white pb-2 transition-colors"
                    />
                    <input
                        type="text"
                        value={formData.description}
                        onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                        placeholder="Form description (optional)"
                        className="w-full text-sm bg-transparent border-b border-gray-100 dark:border-gray-700 focus:border-indigo-400 outline-none text-gray-500 dark:text-gray-400 pb-1 transition-colors"
                    />
                </div>
            </div>

            {/* Tab nav */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {[{ id: 'questions', label: 'Questions', icon: Type }, { id: 'settings', label: 'Settings', icon: Settings }].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                            <Icon size={15} />{tab.label}
                        </button>
                    );
                })}
            </div>

            {/* QUESTIONS TAB */}
            {activeTab === 'questions' && (
                <div className="space-y-3">
                    {questions.map((q, i) => (
                        <QuestionEditor
                            key={q.id}
                            question={q}
                            onChange={updated => updateQuestion(q.id, updated)}
                            onRemove={() => removeQuestion(q.id)}
                            onMoveUp={() => moveQuestion(q.id, -1)}
                            onMoveDown={() => moveQuestion(q.id, 1)}
                            isFirst={i === 0}
                            isLast={i === questions.length - 1}
                        />
                    ))}

                    {/* Add question buttons */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 p-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Add Question</p>
                        <div className="flex flex-wrap gap-2">
                            {QUESTION_TYPES.map(qt => {
                                const Icon = qt.icon;
                                return (
                                    <button key={qt.value} onClick={() => addQuestion(qt.value)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-600 transition-all">
                                        <Icon size={13} /> {qt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-5">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Settings size={16} />Form Settings</h3>

                        {/* Deadline */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deadline (optional)</label>
                            <input type="date" value={formData.deadline}
                                onChange={e => setFormData(p => ({ ...p, deadline: e.target.value }))}
                                className="w-full sm:w-64 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        {/* Max responses */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Responses (leave blank for unlimited)</label>
                            <input type="number" min={1} placeholder="e.g. 100" value={formData.maxResponses}
                                onChange={e => setFormData(p => ({ ...p, maxResponses: e.target.value }))}
                                className="w-full sm:w-64 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        {/* Confirmation message */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirmation Message</label>
                            <textarea rows={3} value={formData.confirmationMessage}
                                onChange={e => setFormData(p => ({ ...p, confirmationMessage: e.target.value }))}
                                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
                                placeholder="Message shown after submission..." />
                        </div>

                        {/* Theme color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme Color</label>
                            <div className="flex flex-wrap gap-2">
                                {THEME_COLORS.map(c => (
                                    <button key={c.value} onClick={() => setFormData(p => ({ ...p, themeColor: c.value }))}
                                        title={c.label}
                                        className={`w-8 h-8 rounded-full border-4 transition-all ${formData.themeColor === c.value ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                        style={{ backgroundColor: c.value }} />
                                ))}
                                <input type="color" value={formData.themeColor}
                                    onChange={e => setFormData(p => ({ ...p, themeColor: e.target.value }))}
                                    className="w-8 h-8 rounded-full cursor-pointer border-0 p-0" title="Custom color" />
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                            {[
                                { key: 'isAnonymous', label: 'Anonymous Responses', desc: 'Hide respondent identity' },
                                { key: 'isActive', label: 'Accept Responses', desc: 'Form is open for submissions' },
                            ].map(({ key, label, desc }) => (
                                <div key={key} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                                    </div>
                                    <button onClick={() => setFormData(p => ({ ...p, [key]: !p[key] }))}
                                        className={`transition-colors ${formData[key] ? 'text-indigo-600' : 'text-gray-300 dark:text-gray-600'}`}>
                                        {formData[key] ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom action bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button onClick={handleSave} disabled={isSaving}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:border-indigo-400 hover:text-indigo-600 bg-white dark:bg-gray-800 transition-all disabled:opacity-50">
                        {isSaving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : <>Save Draft</>}
                    </button>

                    {createdFormId && (
                        <button onClick={() => setShowShareModal(true)}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${formData.themeColor}, ${formData.themeColor}cc)` }}>
                            <Share2 size={16} /> Share Link
                        </button>
                    )}

                    <button onClick={handlePublish} disabled={isPublishing}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.97] disabled:opacity-60"
                        style={{ background: `linear-gradient(135deg, ${formData.themeColor}, ${formData.themeColor}99)` }}>
                        {isPublishing ? <><Loader2 size={16} className="animate-spin" />Publishing…</> : <><Send size={16} />Publish Form</>}
                    </button>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: formData.themeColor }}>
                                <Share2 size={24} className="text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Form is Live!</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Share this link with your respondents</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 mb-4 flex items-center justify-center">
                            <div className="bg-white p-3 rounded-xl shadow-inner">
                                <QRCodeCanvas value={shareLink} size={150} level="H" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
                            <Link2 size={15} className="text-gray-400 flex-shrink-0" />
                            <input readOnly value={shareLink} className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 truncate focus:outline-none" />
                            <button onClick={handleCopy}
                                className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}>
                                {copied ? <><CheckCircle2 size={12} />Copied!</> : <><Copy size={12} />Copy</>}
                            </button>
                        </div>

                        <button onClick={() => setShowShareModal(false)}
                            className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
