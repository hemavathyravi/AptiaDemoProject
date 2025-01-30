// src/types/insurance.ts
export interface ChatbotResponse {
    type: 'question' | 'recommendations' | 'error';
    message: string;
    options?: string[];
    questionType?: 'text' | 'options' | 'boolean';
    recommendations?: InsurancePlan[];
}

export interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    options?: string[];
    questionType?: 'text' | 'options' | 'boolean';
    recommendations?: InsurancePlan[];
}

export interface InsurancePlan {
    name: string;
    coverage_amount: string;
    monthly_premium: number;
    description: string;
    features: string[];
}

export interface UserResponse {
    name: string;
    coverage_amount: string;
    preferred_hospital: string;
    family_size: string;
    additional_services: string[];
    healthcare_needs: string[];
    diagnostic_tests: boolean;
    prescription_drugs: boolean;
    emergency_room: string;
    maternity_planning: boolean;
    wellness_benefits: boolean;
}