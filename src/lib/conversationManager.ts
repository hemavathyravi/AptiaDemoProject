// src/lib/conversationManager.ts
export const INSURANCE_QUESTIONS = [
    {
        id: 'name',
        question: "What is your name?",
        type: 'text'
    },
    {
        id: 'coverage_amount',
        question: "What is your desired coverage amount? (e.g., $250,000)",
        type: 'number'
    },
    {
        id: 'preferred_hospital',
        question: "What is your preferred hospital network? (e.g., Mayo Clinic, others)",
        type: 'text'
    },
    {
        id: 'family_size',
        question: "What is the size of your family to be covered?",
        type: 'select',
        options: ['Self', 'Self + Spouse', 'Self + Spouse + 1 Child', 'Self + Spouse + 2 Children', 'Self + Spouse + 3+ Children']
    },
    {
        id: 'additional_services',
        question: "Which additional services would you like included in your plan?",
        type: 'multiselect',
        options: ['Maternity coverage', 'Dental', 'Vision', 'Mental Health', 'Wellness Programs']
    },
    {
        id: 'primary_healthcare_needs',
        question: "What are your primary healthcare needs?",
        type: 'multiselect',
        options: ['Regular doctor visits', 'Ongoing conditions', 'Injuries', 'Preventive care']
    },
    {
        id: 'requires_diagnostics',
        question: "Do you require frequent diagnostic tests, like X-rays or blood work?",
        type: 'boolean'
    },
    {
        id: 'requires_prescription',
        question: "Do you regularly take prescription drugs?",
        type: 'boolean'
    },
    {
        id: 'emergency_room_frequency',
        question: "How often do you visit the emergency room?",
        type: 'select',
        options: ['Rarely', 'Occasionally', 'Frequently']
    },
    {
        id: 'maternity_planning',
        question: "Are you planning for pregnancy or maternity-related services in the near future?",
        type: 'boolean'
    },
    {
        id: 'wellness_benefits',
        question: "Would you like to include additional wellness benefits?",
        type: 'boolean'
    }
];

export interface SurveyResponse {
    userId?: string;
    name?: string;
    coverage_amount?: string;
    preferred_hospital?: string;
    family_size?: string;
    additional_services?: string[];
    primary_healthcare_needs?: string[];
    requires_diagnostics?: boolean;
    requires_prescription?: boolean;
    emergency_room_frequency?: string;
    maternity_planning?: boolean;
    wellness_benefits?: boolean;
}

export class ConversationManager {
    private currentQuestionIndex: number = 0;
    private responses: Partial<SurveyResponse> = {};
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    getCurrentQuestion() {
        if (this.currentQuestionIndex >= INSURANCE_QUESTIONS.length) {
            return null;
        }
        return INSURANCE_QUESTIONS[this.currentQuestionIndex];
    }

    processAnswer(answer: string) {
        const currentQuestion = INSURANCE_QUESTIONS[this.currentQuestionIndex];
        this.responses[currentQuestion.id] = this.formatAnswer(answer, currentQuestion.type);
        this.currentQuestionIndex++;
        return this.getCurrentQuestion();
    }

    private formatAnswer(answer: string, type: string) {
        switch (type) {
            case 'boolean':
                return answer.toLowerCase() === 'yes';
            case 'multiselect':
                return answer.split(',').map(item => item.trim());
            case 'number':
                return answer.replace(/[^0-9]/g, '');
            default:
                return answer;
        }
    }

    isComplete() {
        return this.currentQuestionIndex >= INSURANCE_QUESTIONS.length;
    }

    getResponses(): Partial<SurveyResponse> {
        return { ...this.responses, userId: this.userId };
    }
}