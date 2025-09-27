const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class GeminiService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is required');
        }

        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-pro'
        });

        this.safetySettings = [
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
        ];

        this.generationConfig = {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        };
    }

    async generateResponse(prompt, conversationHistory = []) {
        try {
            // Build context from conversation history
            let context = '';
            if (conversationHistory.length > 0) {
                context = conversationHistory
                    .slice(-10) // Keep last 10 messages for context
                    .map(msg => `${msg.role}: ${msg.content}`)
                    .join('\n');
                context += '\n\nUser: ' + prompt;
            } else {
                context = prompt;
            }

            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: context }] }],
                safetySettings: this.safetySettings,
                generationConfig: this.generationConfig,
            });

            const response = await result.response;
            return {
                success: true,
                content: response.text(),
                finishReason: response.candidates[0]?.finishReason || 'STOP'
            };
        } catch (error) {
            console.error('Gemini API error:', error);

            if (error.message.includes('API_KEY')) {
                throw new Error('Invalid API key. Please check your Gemini API configuration.');
            } else if (error.message.includes('RATE_LIMIT')) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else if (error.message.includes('SAFETY')) {
                return {
                    success: false,
                    error: 'Content filtered for safety reasons.',
                    type: 'SAFETY_FILTER'
                };
            }

            throw new Error('Failed to generate response. Please try again.');
        }
    }

    async generateStreamResponse(prompt, conversationHistory = [], onChunk) {
        try {
            let context = '';
            if (conversationHistory.length > 0) {
                context = conversationHistory
                    .slice(-10)
                    .map(msg => `${msg.role}: ${msg.content}`)
                    .join('\n');
                context += '\n\nUser: ' + prompt;
            } else {
                context = prompt;
            }

            const result = await this.model.generateContentStream({
                contents: [{ role: 'user', parts: [{ text: context }] }],
                safetySettings: this.safetySettings,
                generationConfig: this.generationConfig,
            });

            let fullResponse = '';
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullResponse += chunkText;
                if (onChunk) {
                    onChunk(chunkText);
                }
            }

            return {
                success: true,
                content: fullResponse
            };
        } catch (error) {
            console.error('Gemini streaming error:', error);
            throw error;
        }
    }
}

module.exports = new GeminiService();