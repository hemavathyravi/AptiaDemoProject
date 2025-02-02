// utils/ragHelper.ts
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PINECONE_API_KEY ='pcsk_2oVkvR_6NYvbzb4mFtNDUWpzo5J2enuXeug8NT9FeFDc1Ys4F6g17jitSrnpv1ytdiaEkT'
const GOOGLE_API_KEY ='AIzaSyDr6KjoDsPwQiAdDN-8CdzTTbIk8rIIZRg'
const PINECONE_ENVIRONMENT ="us-east-1";
const INDEX_NAME = "horizon-blue-index";

// Plan index mapping
const PLAN_INDEXES = {
    'Horizon Blue': 'horizon-blue-index',
    'AmeriHealth Platinum': 'ameriplatinum-index',
    'AmeriHealth Gold': 'amerigold-index',
    'AmeriHealth Silver': 'amerisilver-index',
    'UnitedHealthcare Oxford': 'oxford-index'
};

// Initialize Pinecone


const pinecone = new Pinecone({
    apiKey: 'pcsk_2oVkvR_6NYvbzb4mFtNDUWpzo5J2enuXeug8NT9FeFDc1Ys4F6g17jitSrnpv1ytdiaEkT',
    controllerHostUrl: `https://amerigold-04vrgvs.svc.aped-4627-b74a.pinecone.io`
});


// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function initializePineconeIndex() {
    try {
        const indexList = await pc.listIndexes();
        if (!indexList.some(index => index.name === INDEX_NAME)) {
            console.error(`Index '${INDEX_NAME}' does not exist`);
            return null;
        }
        return pc.Index(INDEX_NAME);
    } catch (error) {
        console.error('Failed to initialize Pinecone index:', error);
        return null;
    }
}

async function retrieveBestDocument(query: string, index: any) {
    try {
        const results = await index.query({
            vector: query,
            topK: 1,
            includeMetadata: true
        });

        return results.matches[0]?.metadata?.text || "";
    } catch (error) {
        console.error('Error retrieving document:', error);
        return "";
    }
}

async function queryRAGSystem(query: string, planName: string) {
    try {
        const index = await initializePineconeIndex();
        if (!index) {
            throw new Error("Pinecone index not initialized");
        }

        // Get the specific plan index if available
        const planIndex = PLAN_INDEXES[planName as keyof typeof PLAN_INDEXES];
        if (planIndex) {
            // Use plan-specific index for the query
            const specificIndex = pc.Index(planIndex);
            const context = await retrieveBestDocument(query, specificIndex);

            // Generate response using Gemini
            const result = await model.generateContent(query);
            const response = result.response?.text() || "";

            return {
                type: 'ai_response',
                message: response,
                context: context,
                confidence: result.response ? 1 : 0
            };
        } else {
            throw new Error("Invalid plan name");
        }
    } catch (error) {
        console.error('RAG Query Error:', error);
        throw error;
    }
}
