// Groq client that uses backend API instead of direct client-side calls

class GroqClient {
    constructor() {
        this.baseURL = window.location.origin;
        this.isAvailable = null;
        this.checkAvailability();
    }

    async checkAvailability() {
        try {
            // First try the health check endpoint (for development with Express server)
            const healthResponse = await fetch(`${this.baseURL}/api/health`);
            if (healthResponse.ok) {
                const data = await healthResponse.json();
                this.isAvailable = data.groqConfigured === true;
                
                if (this.isAvailable) {
                    console.log('AI service is available via backend');
                } else {
                    console.warn('AI service is not available - backend not configured');
                }
                return this.isAvailable;
            }
        } catch (healthError) {
            console.log('Health check failed, trying direct endpoint test');
        }

        try {
            // Fallback: For serverless functions, we check by making a simple test call
            const response = await fetch(`${this.baseURL}/api/ask-ai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: 'test' })
            });
            
            // If we get any response (even an error), the endpoint exists
            this.isAvailable = response.status !== 404;
            
            if (this.isAvailable) {
                console.log('AI service is available via API endpoint');
            } else {
                console.warn('AI service is not available - endpoint not found');
            }
        } catch (error) {
            console.error('Failed to check AI service availability:', error);
            this.isAvailable = false;
        }
        
        return this.isAvailable;
    }

    async isConfigured() {
        if (this.isAvailable === null) {
            await this.checkAvailability();
        }
        return this.isAvailable === true;
    }

    // Legacy method - no longer needed since we don't handle API keys on frontend
    setApiKey(apiKey) {
        console.warn('setApiKey is deprecated. API keys are now managed on the backend.');
    }

    async chat(messages, options = {}) {
        // Check if service is available
        const configured = await this.isConfigured();
        if (!configured) {
            throw new Error('AI service is not available. Please contact support.');
        }

        try {
            // Extract the user question from messages array
            const userMessage = messages.find(msg => msg.role === 'user');
            if (!userMessage) {
                throw new Error('No user message found in the request');
            }

            console.log('Sending request to serverless AI service...');
            
            const response = await fetch(`${this.baseURL}/api/ask-ai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: userMessage.content
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                // Handle specific HTTP status codes
                switch (response.status) {
                    case 400:
                        throw new Error(errorData.error || 'Invalid question format');
                    case 401:
                        throw new Error('AI service authentication failed. Please contact support.');
                    case 429:
                        throw new Error('Too many requests. Please wait a moment and try again.');
                    case 503:
                        throw new Error('AI service is temporarily unavailable. Please try again later.');
                    default:
                        throw new Error(errorData.error || `AI service error (${response.status})`);
                }
            }

            const data = await response.json();
            
            if (!data.answer) {
                throw new Error('Invalid response from AI service');
            }

            console.log('AI Response received successfully from serverless backend');
            return data.answer;

        } catch (error) {
            console.error('Serverless AI service error:', error);
            
            // Check if it's a network error
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Unable to connect to AI service. Please check your connection.');
            }
            
            // Re-throw other errors as they already have user-friendly messages
            throw error;
        }
    }

    // New simplified method for direct question/answer
    async askAI(question) {
        // Check if service is available
        const configured = await this.isConfigured();
        if (!configured) {
            throw new Error('AI service is not available. Please contact support.');
        }

        try {
            console.log('Asking AI question...');
            
            const response = await fetch(`${this.baseURL}/api/ask-ai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Backend error (${response.status})`);
            }

            const data = await response.json();
            return data.answer;

        } catch (error) {
            console.error('AI service error:', error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Unable to connect to AI service. Please check your connection.');
            }
            
            throw error;
        }
    }

    // Legacy method - no longer needed
    promptForApiKey() {
        console.log('API key management is now handled on the backend.');
        return false;
    }
}

// Create and export a singleton instance
export const groqClient = new GroqClient();