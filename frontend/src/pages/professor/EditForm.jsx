import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import FormBuilder from '../../components/professor/FormBuilder';
import { ArrowLeft, Settings } from 'lucide-react';

export default function EditForm() {
    const { formId } = useParams();

    return (
        <PageWrapper>
            <div className="flex items-center gap-4 mb-8">
                <Link
                    to="/dashboard/forms"
                    className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm"
                >
                    <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Settings className="text-blue-600" size={28} />
                        Edit Feedback Form
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Modify the structure or settings of your existing form.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 animate-fade-in">
                <FormBuilder formId={formId} />
            </div>
        </PageWrapper>
    );
}
