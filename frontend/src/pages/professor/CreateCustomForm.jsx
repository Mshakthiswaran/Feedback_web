import PageWrapper from '../../components/layout/PageWrapper';
import GoogleFormBuilder from '../../components/professor/GoogleFormBuilder';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreateCustomForm() {
    return (
        <PageWrapper>
            <div className="mb-6 flex items-center gap-4">
                <Link to="/dashboard/gforms"
                    className="p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm">
                    <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Google Form</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Build a flexible form with multiple question types</p>
                </div>
            </div>
            <GoogleFormBuilder />
        </PageWrapper>
    );
}
