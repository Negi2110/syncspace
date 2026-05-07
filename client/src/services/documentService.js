import api from './api';

export const documentService = {
    getAll: () => api.get('/documents'),
    
    getById: (id) => api.get(`/documents/${id}`),
    
    create: (data) => api.post('/documents', data),
    
    update: (id, data) => api.patch(`/documents/${id}`, data),
    
    delete: (id) => api.delete(`/documents/${id}`),
    
    generateShareLink: (id, access) =>
        api.post(`/documents/${id}/share`, { access }),
    
    revokeShareLink: (id) =>
        api.delete(`/documents/${id}/share`),
    
    getByShareToken: (token) =>
        api.get(`/documents/share/${token}`)
};