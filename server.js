const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Groq client
let groqClient = null;

function initializeGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
        console.warn('GROQ_API_KEY not found in environment variables. AI features will be disabled.');
        return null;
    }
    
    try {
        groqClient = new Groq({
            apiKey: apiKey
        });
        console.log('Groq client initialized successfully');
        return groqClient;
    } catch (error) {
        console.error('Failed to initialize Groq client:', error);
        return null;
    }
}

// Initialize Groq client on server start
initializeGroqClient();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        groqConfigured: groqClient !== null,
        timestamp: new Date().toISOString()
    });
});

// AI assistant endpoint - simplified question/answer format (for serverless compatibility)
app.post('/api/ask-ai', async (req, res) => {
    try {
        if (!groqClient) {
            return res.status(503).json({
                error: 'AI service is not configured'
            });
        }

        const { question, messages } = req.body;
        let userQuestion = question;

        // Support both question format and messages format for backward compatibility
        if (!userQuestion && messages && Array.isArray(messages)) {
            const userMessage = messages.find(msg => msg.role === 'user');
            if (userMessage) {
                userQuestion = userMessage.content;
            }
        }

        // Validate input
        if (!userQuestion || typeof userQuestion !== 'string' || !userQuestion.trim()) {
            return res.status(400).json({
                error: 'Question is required and must be a non-empty string'
            });
        }

        console.log('Processing AI request for question:', userQuestion.substring(0, 50) + '...');

        // Create completion using Groq
        const completion = await groqClient.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a helpful financial advisor assistant for a gamified financial education app called FinanQuest. 
                    You help users learn about budgeting, saving, debt management, and financial literacy.
                    Always provide practical, educational advice suitable for young adults and students.
                    Keep responses conversational but informative.`
                },
                {
                    role: "user", 
                    content: userQuestion
                }
            ],
            model: "llama-3.1-8b-instant",
            max_tokens: 1000,
            temperature: 0.7,
            stream: false
        });

        if (!completion.choices || completion.choices.length === 0) {
            throw new Error('No response from AI service');
        }

        const answer = completion.choices[0].message.content;
        
        if (!answer || !answer.trim()) {
            throw new Error('Empty response from AI service');
        }

        console.log('AI response generated successfully');
        
        // Return simplified answer format
        res.json({
            answer: answer.trim(),
            model: "llama-3.1-8b-instant"
        });

    } catch (error) {
        console.error('Error in /api/ask-ai:', error);
        
        // Handle different types of errors
        if (error.status === 401) {
            res.status(401).json({
                error: 'Authentication failed. Invalid API key.'
            });
        } else if (error.status === 429) {
            res.status(429).json({
                error: 'Rate limit exceeded. Please try again later.'
            });
        } else if (error.status >= 400 && error.status < 500) {
            res.status(400).json({
                error: error.message || 'Bad request to AI service.'
            });
        } else {
            res.status(500).json({
                error: 'AI service error'
            });
        }
    }
});

// Handle root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Groq client status: ${groqClient ? 'Configured' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    process.exit(0);
});

module.exports = app;