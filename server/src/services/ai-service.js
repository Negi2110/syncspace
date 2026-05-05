const { GoogleGenerativeAI } = require('@google/generative-ai');
const ServerConfig = require('../config/server-config');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

const genAI = new GoogleGenerativeAI(ServerConfig.GEMINI_API_KEY);
//const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });


async function callGemini(systemPrompt, userMessage) {
    try {
        const modelInstance = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    systemInstruction: systemPrompt
});
        const result = await modelInstance.generateContent(userMessage);
        return result.response.text();
    } catch (error) {
        console.error('Gemini API error:', error.message);
        throw new AppError(
            'AI service is unavailable',
            StatusCodes.SERVICE_UNAVAILABLE
        );
    }
}

async function summarize(content) {
    const systemPrompt = `You are a technical writing assistant for developers.
Summarize the provided document content clearly and concisely.
Return a 3-5 sentence summary that captures the key points.
Focus on technical accuracy.`;
    const result = await callGemini(systemPrompt, content);
    return { result, type: 'summary' };
}

async function improve(content) {
    const systemPrompt = `You are a technical writing assistant for developers.
Improve the writing quality of the provided text.
Make it clearer, more concise, and more professional.
Preserve all technical accuracy and meaning.
Return only the improved text, no explanations.`;
    const result = await callGemini(systemPrompt, content);
    return { result, type: 'improved' };
}

async function fixGrammar(content) {
    const systemPrompt = `You are a grammar and spelling checker.
Fix all grammar, spelling, and punctuation errors in the provided text.
Do not change the meaning, style, or technical content.
Return only the corrected text, no explanations.`;
    const result = await callGemini(systemPrompt, content);
    return { result, type: 'grammar-fixed' };
}

async function smartComment(selectedText, context) {
    const systemPrompt = `You are a senior software engineer doing a technical review.
Provide a brief, insightful technical comment on the highlighted text.
Point out: potential issues, missing details, suggestions for improvement.
Be specific and actionable. Keep it under 100 words.`;
    const userMessage = `Document context: ${context}\n\nHighlighted text: ${selectedText}`;
    const result = await callGemini(systemPrompt, userMessage);
    return { result, type: 'smart-comment' };
}

async function reviewSpec(content) {
    const systemPrompt = `You are a senior software architect reviewing a technical specification.
Analyze the spec and provide structured feedback.
Check for:
- Missing sections (overview, requirements, API design, data models, edge cases)
- Ambiguous requirements
- Security considerations
- Performance considerations
- Missing error handling details
Return your feedback as a structured list with clear sections.`;
    const result = await callGemini(systemPrompt, content);
    return { result, type: 'spec-review' };
}

module.exports = {
    summarize,
    improve,
    fixGrammar,
    smartComment,
    reviewSpec
}