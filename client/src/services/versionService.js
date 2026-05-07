import api from './api';

export const versionService = {
    getAll: (documentId) =>
        api.get(`/documents/${documentId}/versions`),

    getOne: (documentId, versionId) =>
        api.get(`/documents/${documentId}/versions/${versionId}`),

    save: (documentId) =>
        api.post(`/documents/${documentId}/versions`),

    restore: (documentId, versionId) =>
        api.post(`/documents/${documentId}/versions/${versionId}/restore`)
};