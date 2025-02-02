//src/app/api/rag/route.ts
import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Type definitions
interface ChatRequest {
    message: string;
    userId: string;
}

interface RAGResponse {
    message: string;
    context?: string;
    confidence: number;
}

// Configuration
const PLAN_INDEXES = {
    'Horizon Blue': 'horizonblue',
    'AmeriHealth Platinum': 'ameriplatinum-index',
    'AmeriHealth Gold': 'amerigold-index',
    'AmeriHealth Silver': 'amerisilver-index',
    'UnitedHealthcare Oxford': 'oxford-index'
} as const;

// Initialize Pinecone client with correct configuration
const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
});

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// RAG system implementation
async function queryRAGSystem(query: string, planName: string): Promise<RAGResponse> {
    try {
        // Validate plan name
        if (!(planName in PLAN_INDEXES)) {
            throw new Error(`Invalid plan name: ${planName}`);
        }

        // Get plan-specific index
        const indexName = PLAN_INDEXES[planName as keyof typeof PLAN_INDEXES];
        const index = pc.index(indexName);

        // Query the vector database
        const queryResponse = await index.query({
            vector: Array(1024).fill(0), // Replace with actual vector embedding
            topK: 1,
            includeMetadata: true
        });

        const context = queryResponse.matches[0]?.metadata?.text || "";

        // Generate response using Gemini
        const prompt = `
You are an AI assistant specializing in insurance policies.

Context about the insurance plan:
${context}

User question:
${query}

Provide a clear and concise response based on the provided context. 
If the context does not contain relevant information, offer general insurance-related guidance. 
Keep the response simple and easy for customers to understand.
`;


        const result = await model.generateContent(prompt);
        const response = result.response?.text() || "";

        return {
            message: response,
            context: context,
            confidence: queryResponse.matches[0]?.score || 0
        };
    } catch (error) {
        console.error('RAG Query Error:', error);
        throw error;
    }
}

// API route handler
// In-memory store to track first-time interaction (for demonstration purposes)
const userInteractionMap = new Map<string, boolean>();

// API route handler
export async function POST(req: Request) {
    try {
        // Parse incoming request (includes userId)
        const { message, userId }: ChatRequest = await req.json();

        // Check if it's the user's first interaction
        if (!userInteractionMap.has(userId)) {
            // Mark user as interacted
            userInteractionMap.set(userId, true);

            // Respond with the first-time message
            return NextResponse.json({
                type: 'ai_response',
                message: 'I am an AI assistant. I will help you with questions about the plan.',
                metadata: {
                    context: '',
                    confidence: 0
                }
            });
        }

        // Proceed with regular RAG system logic for subsequent interactions
        const defaultPlan = "Horizon Blue";

        try {
            // Process user query with RAG system
            const ragResponse = await queryRAGSystem(message, defaultPlan);

            // Return generated response
            return NextResponse.json({
                type: 'ai_response',
                message: ragResponse.message,
                metadata: {
                    context: ragResponse.context,
                    confidence: ragResponse.confidence
                }
            });
        } catch (error) {
            console.error('RAG System Error:', error);
            return NextResponse.json(
                {
                    type: 'error',
                    message: 'Unable to process your question at this time. Please try again later.'
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('API Route Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}