// utils/pinecone-client.ts
import { Pinecone } from '@pinecone-database/pinecone';
import { CONFIG } from './config';

// Initialize Pinecone
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || 'pcsk_5WrbuT_LEuEYn7MneKKDjveuxDyV1WKESjerLWJ9b8ZrHc1uSWhx8gtc25P6fg8TgqJJeZ',
    environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1'
});

// Test connection function
export async function testPineconeConnection() {
    try {
        const indexes = await pinecone.listIndexes();
        console.log(`[${CONFIG.CURRENT_TIME}] Connected to Pinecone. Available indexes:`, indexes);
        return true;
    } catch (error) {
        console.error(`[${CONFIG.CURRENT_TIME}] Pinecone connection error:`, error);
        return false;
    }
}

export default pinecone;