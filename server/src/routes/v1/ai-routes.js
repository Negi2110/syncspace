const express = require('express');
const router = express.Router();
const { AiController } = require('../../controllers');
const { verifyToken } = require('../../middlewares');

// All AI routes require authentication
router.use(verifyToken);

// POST /api/v1/ai/summarize
router.post('/summarize', AiController.summarize);

// POST /api/v1/ai/improve
router.post('/improve', AiController.improve);

// POST /api/v1/ai/fix-grammar
router.post('/fix-grammar', AiController.fixGrammar);

// POST /api/v1/ai/smart-comment
router.post('/smart-comment', AiController.smartComment);

// POST /api/v1/ai/review-spec
router.post('/review-spec', AiController.reviewSpec);

module.exports = router;