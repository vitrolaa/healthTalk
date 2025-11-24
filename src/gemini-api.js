import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyBLCY9Zr4vJaBAbUP3srtu-0QDfZAqz2Hc';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Get the model
//const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Chat session
let chat = null;

/**
 * Send a message to Gemini API and get response
 * @param {string} userMessage - The user's message
 * @returns {Promise<string>} - The AI's response
 */
export async function sendMessageToGemini(userMessage) {
    try {
        // If chat doesn't exist, initialize it
        if (!chat) {
            initializeConversation();
        }

        // Send message and get response
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw new Error('Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.');
    }
}

/**
 * Initialize the conversation with a system prompt
 */
export function initializeConversation() {
    // Start a new chat session with history
    chat = model.startChat({
        history: [
            {
                role: 'user',
                parts: [{
                    text: 'Você é o Dr. Mente, um assistente virtual especializado em saúde mental e bem-estar emocional. Você é empático, acolhedor e oferece suporte emocional. Suas respostas devem ser em português brasileiro, sempre gentis e encorajadoras. Você não substitui um profissional de saúde mental, mas pode oferecer dicas de bem-estar, técnicas de respiração, e ouvir as preocupações das pessoas com empatia. Mantenha suas respostas concisas e acessíveis.'
                }]
            },
            {
                role: 'model',
                parts: [{
                    text: 'Olá! Sou o Dr. Mente, seu assistente de saúde mental. Estou aqui para ouvir você e oferecer apoio. Como posso ajudá-lo hoje?'
                }]
            }
        ],
        generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        },
    });
}

/**
 * Clear conversation history
 */
export function clearConversation() {
    chat = null;
    initializeConversation();
}
