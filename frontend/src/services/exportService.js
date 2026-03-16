import api from './api';

const exportService = {
    exportPDF: async (formId) => {
        const response = await api.get(`/export/${formId}/pdf`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `feedback_report_${formId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },
    exportExcel: async (formId) => {
        const response = await api.get(`/export/${formId}/excel`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `feedback_report_${formId}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },
};

export default exportService;
