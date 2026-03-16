import api from './api';

const adminService = {
    getAllProfessors: async () => {
        const response = await api.get('/admin/professors');
        return response.data;
    },

    getSystemStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    getAllForms: async () => {
        const response = await api.get('/admin/forms');
        return response.data;
    },

    deleteProfessor: async (id) => {
        const response = await api.delete(`/admin/professors/${id}`);
        return response.data;
    }
};

export default adminService;
