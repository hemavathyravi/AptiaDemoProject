// src/lib/chatbot.ts
import { InsuranceOption } from '@/types/chat';

export const insurancePlans: InsuranceOption[] = [
    {
        id: '1',
        name: 'Basic Health Plan',
        price: '$199/month',
        description: 'Essential coverage for individuals',
    },
    {
        id: '2',
        name: 'Family Health Plan',
        price: '$399/month',
        description: 'Comprehensive coverage for families',
    },
    {
        id: '3',
        name: 'Premium Health Plan',
        price: '$299/month',
        description: 'Enhanced coverage with additional benefits',
    },
];

export const processMessage = (message: string) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('insurance')) {
        return {
            response: 'Here are some insurance plans that might interest you:',
            options: insurancePlans,
        };
    }

    if (lowerMessage.includes('help')) {
        return {
            response: 'I can help you with:\n- Insurance plan recommendations\n- Coverage details\n- Policy information\nWhat would you like to know?',
        };
    }

    return {
        response: "How can I help you with insurance today? You can ask about our available plans or specific coverage options.",
    };
};