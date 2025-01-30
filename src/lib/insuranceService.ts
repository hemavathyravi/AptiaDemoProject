// src/lib/insuranceService.ts
import { readFile } from 'fs/promises';
import path from 'path';
import { Demographic, SurveyResponse, InsurancePlan } from '@/types/insurance';

export class InsuranceService {
    private static instance: InsuranceService;
    private demographics: Demographic[] = [];
    private surveyResponses: SurveyResponse[] = [];
    private planDetails: InsurancePlan[] = [];

    private constructor() {}

    static async getInstance(): Promise<InsuranceService> {
        if (!InsuranceService.instance) {
            InsuranceService.instance = new InsuranceService();
            await InsuranceService.instance.loadData();
        }
        return InsuranceService.instance;
    }

    private async loadData() {
        try {
            const demographicsPath = path.join(process.cwd(), 'data/demograph.json');
            const surveyResponsesPath = path.join(process.cwd(), 'data/survey_responses.json');
            const planDetailsPath = path.join(process.cwd(), 'data/survey_responses_plan_details.json');

            this.demographics = JSON.parse(await readFile(demographicsPath, 'utf-8'));
            this.surveyResponses = JSON.parse(await readFile(surveyResponsesPath, 'utf-8'));
            this.planDetails = JSON.parse(await readFile(planDetailsPath, 'utf-8'));
        } catch (error) {
            console.error('Error loading insurance data:', error);
            throw new Error('Failed to load insurance data');
        }
    }

    async saveSurveyResponse(response: SurveyResponse) {
        this.surveyResponses.push(response);
        // Implement actual file saving logic here
    }

    async recommendPlans(surveyResponse: SurveyResponse): Promise<InsurancePlan[]> {
        return this.planDetails
            .map(plan => ({
                ...plan,
                suitability_score: this.calculateSuitabilityScore(plan, surveyResponse)
            }))
            .sort((a, b) => (b.suitability_score || 0) - (a.suitability_score || 0))
            .slice(0, 3); // Return top 3 recommendations
    }

    private calculateSuitabilityScore(plan: InsurancePlan, response: SurveyResponse): number {
        let score = 0;

        // Coverage amount match
        if (this.coverageAmountMatch(plan.coverage_amount, response.coverage_amount)) score += 20;

        // Hospital network match
        if (plan.hospital_network.includes(response.preferred_hospital)) score += 15;

        // Family coverage match
        if (plan.family_coverage === response.family_size) score += 15;

        // Additional services match
        const servicesMatch = response.additional_services.every(service =>
            plan.additional_services.includes(service));
        if (servicesMatch) score += 10;

        // Prescription coverage match
        if (response.requires_prescription === plan.prescription_coverage) score += 10;

        // Maternity coverage match
        if (response.maternity_planning === plan.maternity_coverage) score += 15;

        // Wellness benefits match
        if (response.wellness_benefits === plan.wellness_benefits) score += 15;

        return score;
    }

    private coverageAmountMatch(planAmount: string, requestedAmount: string): boolean {
        const planValue = parseInt(planAmount.replace(/[^0-9]/g, ''));
        const requestedValue = parseInt(requestedAmount.replace(/[^0-9]/g, ''));
        return planValue >= requestedValue;
    }
}