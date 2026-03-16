import api from './api';

const submissionService = {
    submitFeedback: async (formId, submissionData) => {
        const response = await api.post(`/submissions/${formId}`, submissionData);
        return response.data;
    },
    getFormSubmissions: async (formId) => {
        const response = await api.get(`/submissions/${formId}`);
        return response.data;
    },
    getSubmissionStats: async (formId) => {
        const response = await api.get(`/submissions/${formId}/stats`);
        return response.data;
    },
};

export default submissionService;
