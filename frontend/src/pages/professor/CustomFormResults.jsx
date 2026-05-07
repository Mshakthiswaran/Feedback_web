import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import submissionService from '../../services/submissionService';
import {
    ArrowLeft, Loader2, AlertCircle, Users, BarChart2, Star,
    User, Hash, Clock, ChevronLeft, ChevronRight, MessageSquare,
    CheckSquare, List, Sliders, AlignLeft, Type, Calendar,
    TrendingUp
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

function StatCard({ icon: Icon, label, value, color = 'indigo' }) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
        yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    };
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colors[color]}`}><Icon size={22} /></div>
            <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}

function QuestionSummaryCard({ question, qStats }) {
    if (!qStats) return null;

    const typeIcons = {
        short_answer: Type, paragraph: AlignLeft, multiple_choice: List,
        checkboxes: CheckSquare, dropdown: List, linear_scale: Sliders,
        star_rating: Star, date: Calendar,
    };
    const Icon = typeIcons[question.type] || MessageSquare;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                    <Icon size={15} className="text-indigo-600 dark:text-indigo-400" />
                </span>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{question.label}</h4>
            </div>

            {/* Text answers */}
            {(qStats.type === 'short_answer' || qStats.type === 'paragraph' || qStats.type === 'date') && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {qStats.textAnswers?.length > 0
                        ? qStats.textAnswers.map((ans, i) => (
                            <div key={i} className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                                {ans}
                            </div>
                        ))
                        : <p className="text-sm text-gray-400 italic">No responses yet</p>
                    }
                </div>
            )}

            {/* Choice charts */}
            {qStats.optionCounts && Object.keys(qStats.optionCounts).length > 0 && (
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(qStats.optionCounts).map(([name, count]) => ({ name, count }))}
                            layout="vertical" margin={{ left: 10, right: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#64748b' }} />
                            <Tooltip cursor={{ fill: 'transparent' }}
                                formatter={val => [`${val} responses`]} />
                            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                                {Object.keys(qStats.optionCounts).map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Scale / star average */}
            {(qStats.type === 'linear_scale' || qStats.type === 'star_rating') && (
                <div className="space-y-3">
                    <div className="text-center">
                        <div className="text-4xl font-black" style={{ color: '#6366f1' }}>{qStats.average}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">average rating from {qStats.responses?.length || 0} responses</p>
                    </div>
                    {qStats.type === 'star_rating' && (
                        <div className="flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={24} className={s <= Math.round(qStats.average) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function IndividualView({ submissions, questions }) {
    const [idx, setIdx] = useState(0);
    if (!submissions?.length) return (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>No responses yet</p>
        </div>
    );

    const sub = submissions[idx];

    return (
        <div className="space-y-6">
            {/* Navigation */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm px-5 py-3">
                <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors">
                    <ChevronLeft size={18} /> Previous
                </button>
                <div className="text-center">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Response {idx + 1} of {submissions.length}</p>
                    <p className="text-xs text-gray-400">{new Date(sub.submittedAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setIdx(i => Math.min(submissions.length - 1, i + 1))} disabled={idx === submissions.length - 1}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors">
                    Next <ChevronRight size={18} />
                </button>
            </div>

            {/* Respondent info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Respondent</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <User size={14} className="text-gray-400" />
                        {sub.studentName || 'Anonymous'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Hash size={14} className="text-gray-400" />
                        {sub.rollNumber}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 col-span-2">
                        <Clock size={14} className="text-gray-400" />
                        {new Date(sub.submittedAt).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Answers */}
            <div className="space-y-3">
                {questions?.filter(q => q.type !== 'section_break').map(q => {
                    const qr = sub.questionResponses?.find(r => r.questionId === q.id);
                    const displayVal = qr
                        ? (qr.selectedOpts?.length ? qr.selectedOpts.join(', ') : qr.textValue || '—')
                        : '—';
                    return (
                        <div key={q.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{q.label}</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{displayVal}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function CustomFormResults() {
    const { formId } = useParams();
    const [stats, setStats] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('summary');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [statsData, subsData] = await Promise.all([
                    submissionService.getSubmissionStats(formId),
                    submissionService.getFormSubmissions(formId),
                ]);
                setStats(statsData);
                setSubmissions(subsData);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load results');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [formId]);

    if (loading) return (
        <PageWrapper>
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading responses…</p>
            </div>
        </PageWrapper>
    );

    if (error) return (
        <PageWrapper>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-8 rounded-2xl text-center max-w-xl mx-auto mt-12">
                <AlertCircle className="text-red-500 mx-auto mb-4" size={40} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load</h2>
                <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
                <Link to="/dashboard/gforms" className="text-indigo-600 hover:underline flex items-center gap-1 justify-center">
                    <ArrowLeft size={16} />Back to Forms
                </Link>
            </div>
        </PageWrapper>
    );

    const tabs = [
        { id: 'summary', label: 'Summary', icon: BarChart2 },
        { id: 'individual', label: 'Individual', icon: User },
    ];

    return (
        <PageWrapper>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link to="/dashboard/gforms"
                    className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm">
                    <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Form Responses</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View and analyze form submissions</p>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <StatCard icon={Users} label="Total Responses" value={stats.totalSubmissions} color="indigo" />
                <StatCard icon={TrendingUp} label="Questions" value={stats.questions?.length || 0} color="yellow" />
                <StatCard icon={Star} label="Overall Avg" value={stats.overallAverage > 0 ? `${stats.overallAverage}/5` : '—'} color="emerald" />
            </div>

            {/* Tab nav */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 w-fit">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-2 px-5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                            <Icon size={15} />{tab.label}
                        </button>
                    );
                })}
            </div>

            {/* SUMMARY TAB */}
            {activeTab === 'summary' && (
                <div>
                    {stats.questions?.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {stats.questions.filter(q => q.type !== 'section_break').map(q => (
                                <QuestionSummaryCard
                                    key={q.id}
                                    question={q}
                                    qStats={stats.questionStats[q.id]}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                            <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
                            <p>No question data to display</p>
                        </div>
                    )}
                </div>
            )}

            {/* INDIVIDUAL TAB */}
            {activeTab === 'individual' && (
                <IndividualView submissions={submissions} questions={stats.questions} />
            )}
        </PageWrapper>
    );
}
