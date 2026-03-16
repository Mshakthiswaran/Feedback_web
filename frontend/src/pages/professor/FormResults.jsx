import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
    Download, FileText, Table, BarChart2, PieChart, Users, Star,
    ArrowLeft, Loader2, AlertCircle, FileDown, CheckCircle2
} from 'lucide-react';
import submissionService from '../../services/submissionService';
import exportService from '../../services/exportService';

export default function FormResults() {
    const { formId } = useParams();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const data = await submissionService.getSubmissionStats(formId);
                setStats(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load results');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [formId]);

    const handleExport = async (type) => {
        setExporting(type);
        try {
            if (type === 'pdf') await exportService.exportPDF(formId);
            else await exportService.exportExcel(formId);
        } catch (err) {
            alert('Export failed');
        } finally {
            setExporting(null);
        }
    };

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Analyzing feedback data…</p>
                </div>
            </PageWrapper>
        );
    }

    if (error) {
        return (
            <PageWrapper>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-8 rounded-2xl text-center max-w-2xl mx-auto mt-12">
                    <AlertCircle className="text-red-600 dark:text-red-400 mx-auto mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analysis Failed</h2>
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                    <Link to="/dashboard/forms" className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:underline">
                        <ArrowLeft size={16} /> Back to My Forms
                    </Link>
                </div>
            </PageWrapper>
        );
    }

    // Prepare data for the Radar chart (Averages per Subject)
    const subjectData = stats.columns.map(col => ({
        subject: col.subjectName.substring(0, 15) + (col.subjectName.length > 15 ? '...' : ''),
        avg: stats.columnAverages[col.id] || 0,
        fullMark: 5
    }));

    // Prepare data for the Bar chart (Averages per Criteria)
    const criteriaData = stats.rows.map(row => {
        let sum = 0;
        let count = 0;
        stats.columns.forEach(col => {
            const val = stats.cellAverages[`${row.id}-${col.id}`]?.avg;
            if (val) {
                sum += val;
                count++;
            }
        });
        return {
            name: row.label.substring(0, 25) + (row.label.length > 25 ? '...' : ''),
            avg: count > 0 ? parseFloat((sum / count).toFixed(2)) : 0
        };
    });

    return (
        <PageWrapper>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        to="/dashboard/forms"
                        className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Feedback Analytics</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            Full report for selected teacher feedback form
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={exporting}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 font-semibold shadow-sm transition-all disabled:opacity-50"
                    >
                        {exporting === 'pdf' ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} className="text-red-500" />}
                        PDF Report
                    </button>
                    <button
                        onClick={() => handleExport('excel')}
                        disabled={exporting}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 font-semibold shadow-sm transition-all disabled:opacity-50"
                    >
                        {exporting === 'excel' ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} className="text-emerald-500" />}
                        Excel Data
                    </button>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/40 rounded-xl">
                        <Users className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Responses</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalSubmissions}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/40 rounded-xl">
                        <Star className="text-yellow-600 dark:text-yellow-400" size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Overall Avg</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.overallAverage} / 5</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl">
                        <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</p>
                        <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Complete</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Subject Comparison Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <PieChart size={20} className="text-purple-500" />
                        Average Score per Subject
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                                <Radar
                                    name="Score"
                                    dataKey="avg"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.6}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Criteria Bar Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <BarChart2 size={20} className="text-blue-500" />
                        Average Score per Criteria
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={criteriaData.slice(0, 6)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 5]} hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={150}
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="avg" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Table size={20} className="text-emerald-500" />
                        Detailed Averages Matrix
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-750">
                                <th className="p-4 border-b border-r border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Criteria</th>
                                {stats.columns.map(col => (
                                    <th key={col.id} className="p-4 border-b border-r border-gray-200 dark:border-gray-700 text-center font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                                        {col.subjectName}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stats.rows.map((row) => (
                                <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-750/50">
                                    <td className="p-4 border-r border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white max-w-[300px]">
                                        {row.label}
                                    </td>
                                    {stats.columns.map(col => {
                                        const val = stats.cellAverages[`${row.id}-${col.id}`]?.avg;
                                        return (
                                            <td key={`${row.id}-${col.id}`} className="p-4 border-r border-gray-200 dark:border-gray-700 text-center">
                                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm shadow-sm ${val >= 4.5 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                                        val >= 3.5 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' :
                                                            val > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                                                                'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                                                    }`}>
                                                    {val || '-'}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-blue-50 dark:bg-blue-900/20 font-bold">
                                <td className="p-4 border-r border-gray-200 dark:border-gray-700 text-blue-800 dark:text-blue-300">SUBJECT AVERAGE</td>
                                {stats.columns.map(col => (
                                    <td key={col.id} className="p-4 border-r border-gray-200 dark:border-gray-700 text-center text-blue-800 dark:text-blue-300">
                                        {stats.columnAverages[col.id] || '-'}
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </PageWrapper>
    );
}
