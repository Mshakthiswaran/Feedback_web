import api from './api';

const formService = {
    createForm: async (formData) => {
        const response = await api.post('/forms', formData);
        return response.data;
    },
    getMyForms: async () => {
        const response = await api.get('/forms');
        return response.data;
    },
    getFormById: async (id) => {
        const response = await api.get(`/forms/${id}`);
        return response.data;
    },
    updateForm: async (id, formData) => {
        const response = await api.put(`/forms/${id}`, formData);
        return response.data;
    },
    deleteForm: async (id) => {
        const response = await api.delete(`/forms/${id}`);
        return response.data;
    },
    toggleFormActive: async (id) => {
        const response = await api.patch(`/forms/${id}/toggle`);
        return response.data;
    },
};

export default formService;
