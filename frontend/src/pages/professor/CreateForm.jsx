import PageWrapper from '../../components/layout/PageWrapper';
import FormBuilder from '../../components/professor/FormBuilder';

export default function CreateForm() {
    return (
        <PageWrapper>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Matrix Form</h1>
                <p className="text-gray-500 dark:text-gray-400">Build a Subject vs Criteria feedback form.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <FormBuilder />
            </div>
        </PageWrapper>
    );
}