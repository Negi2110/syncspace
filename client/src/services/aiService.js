import api from './api';

export const aiService = {
    summarize: (content) =>
        api.post('/ai/summarize', { content }),

    improve: (content) =>
        api.post('/ai/improve', { content }),

    fixGrammar: (content) =>
        api.post('/ai/fix-grammar', { content }),

    smartComment: (selectedText, context) =>
        api.post('/ai/smart-comment', { selectedText, context }),

    reviewSpec: (content) =>
        api.post('/ai/review-spec', { content })
};