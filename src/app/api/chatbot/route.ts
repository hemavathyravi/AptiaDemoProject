//src/app/api/chatbot/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "AIzaSyDr6KjoDsPwQiAdDN-8CdzTTbIk8rIIZRg");

// Define the structure for insurance questions
interface Question {
    id: string;
    question: string;
    options?: string[];
    type: 'text' | 'options' | 'boolean';
}

// Define the structure for insurance plans
interface InsurancePlan {
    PlanID: number;
    PlanName: string;
    PdfLink: string;
    OutOfNetworkCoverage: string;
    DeductibleIndividual: number;
    DeductibleFamily: number;
    MaternityCoinsurance: number;
    VisitToPhysicianCopay: number;
    DiagnosticTestCopay: number;
    ImagingCopay: number;
    GenericDrugsCopay: number;
    OutpatientSurgeryCopay: number;
    EmergencyRoomCare: number;
    DurableMedicalEquipmentCoinsurance: number;
    VaccinationCopay: number | null;
}

// Define the structure for user session
interface UserSession {
    responses: Map<string, any>;
    currentQuestionIndex: number;
    phase: 'questioning' | 'selecting_plan';
    userName?: string;
    keepCurrentPlan?: boolean; // New field to track if user wants to keep current plan
}
// Current/Default Insurance Plan
const currentPlan: InsurancePlan = {
    PlanID: 4,
    PlanName: "Horizon Blue",
    PdfLink: "https://drive.google.com/file/d/1fGl7f1M1YtsmbkYJTzeE9DNHkNGR4Ktq/view?usp=sharing",
    OutOfNetworkCoverage: "Not covered",
    DeductibleIndividual: 1500,
    DeductibleFamily: 3000,
    MaternityCoinsurance: 0,
    VisitToPhysicianCopay: 20,
    DiagnosticTestCopay: 0,
    ImagingCopay: 0,
    GenericDrugsCopay: 10,
    OutpatientSurgeryCopay: 150,
    EmergencyRoomCare: 100,
    DurableMedicalEquipmentCoinsurance: 50,
    VaccinationCopay: 10
};


const insurancePlans: InsurancePlan[] = [
    {
        PlanID: 1,
        PlanName: "AmeriHealth Platinum",
        PdfLink: "https://drive.google.com/file/d/15abfYJxr25RcHdQTDK4qU5iKKG-3Dfrr/view?usp=sharing",
        OutOfNetworkCoverage: "Not covered",
        DeductibleIndividual: 0,
        DeductibleFamily: 0,
        MaternityCoinsurance: 0,
        VisitToPhysicianCopay: 10,
        DiagnosticTestCopay: 30,
        ImagingCopay: 60,
        GenericDrugsCopay: 15,
        OutpatientSurgeryCopay: 0,
        EmergencyRoomCare: 100,
        DurableMedicalEquipmentCoinsurance: 50,
        VaccinationCopay: 0
    },
    {
        PlanID: 2,
        PlanName: "AmeriHealth Gold",
        PdfLink: "https://drive.google.com/file/d/1SkVyCJHk7UBgJweV1gV4gaHSSEuFEskD/view?usp=sharing",
        OutOfNetworkCoverage: "Not covered",
        DeductibleIndividual: 1500,
        DeductibleFamily: 3000,
        MaternityCoinsurance: 20,
        VisitToPhysicianCopay: 15,
        DiagnosticTestCopay: 60,
        ImagingCopay: 20,
        GenericDrugsCopay: 10,
        OutpatientSurgeryCopay: 60,
        EmergencyRoomCare: 20,
        DurableMedicalEquipmentCoinsurance: 50,
        VaccinationCopay: null
    },
    {
        PlanID: 3,
        PlanName: "AmeriHealth Silver",
        PdfLink: "https://drive.google.com/file/d/1FbOjIXk3q3otIxzy9Q_Ri29sLKIf03RW/view?usp=sharing",
        OutOfNetworkCoverage: "Not covered",
        DeductibleIndividual: 2500,
        DeductibleFamily: 5000,
        MaternityCoinsurance: 20,
        VisitToPhysicianCopay: 30,
        DiagnosticTestCopay: 50,
        ImagingCopay: 50,
        GenericDrugsCopay: 20,
        OutpatientSurgeryCopay: 60,
        EmergencyRoomCare: 20,
        DurableMedicalEquipmentCoinsurance: 50,
        VaccinationCopay: null
    },
    {
        PlanID: 4,
        PlanName: "Horizon Blue",
        PdfLink: "https://drive.google.com/file/d/1fGl7f1M1YtsmbkYJTzeE9DNHkNGR4Ktq/view?usp=sharing",
        OutOfNetworkCoverage: "Not covered",
        DeductibleIndividual: 1500,
        DeductibleFamily: 3000,
        MaternityCoinsurance: 0,
        VisitToPhysicianCopay: 20,
        DiagnosticTestCopay: 0,
        ImagingCopay: 0,
        GenericDrugsCopay: 10,
        OutpatientSurgeryCopay: 150,
        EmergencyRoomCare: 100,
        DurableMedicalEquipmentCoinsurance: 50,
        VaccinationCopay: 10
    },
    {
        PlanID: 5,
        PlanName: "UnitedHealthcare Oxford",
        PdfLink: "https://drive.google.com/file/d/1cS3TMeoxnIlDW8MmUiGGJKPAEE--jIAX/view?usp=sharing",
        OutOfNetworkCoverage: "Not covered",
        DeductibleIndividual: 0,
        DeductibleFamily: 0,
        MaternityCoinsurance: 0,
        VisitToPhysicianCopay: 10,
        DiagnosticTestCopay: 60,
        ImagingCopay: 10,
        GenericDrugsCopay: 5,
        OutpatientSurgeryCopay: 500,
        EmergencyRoomCare: 100,
        DurableMedicalEquipmentCoinsurance: 0,
        VaccinationCopay: 0
    }
];

const insuranceQuestions: Question[] = [
    {
        id: 'name',
        question: "Hello! I'm your insurance assistant. What's your name?",
        type: 'text'
        // Note: We won't add SKIP to name as it's essential
    },
    {
        id: 'coverage_amount',
        question: "What is your desired coverage amount?",
        options: ['$250,000', '$500,000', '$750,000', '$1,000,000', '$2,000,000', 'SKIP'],
        type: 'options'
    },
    {
        id: 'preferred_hospital',
        question: "What is your preferred hospital network?",
        options: ['Mayo Clinic', 'Cleveland Clinic', 'Johns Hopkins', 'Local Hospital Network', 'Other', 'SKIP'],
        type: 'options'
    },
    {
        id: 'family_size',
        question: "What is the size of your family to be covered?",
        options: [
            'Self',
            'Self + Spouse',
            'Self + Child',
            'Self + Spouse + 1 Child',
            'Self + Spouse + 2 Children',
            'Self + Spouse + 3+ Children',
            'SKIP'
        ],
        type: 'options'
    },
    {
        id: 'additional_services',
        question: "Which additional services would you like included in your plan? (Select all that apply)",
        options: ['Maternity coverage', 'Dental', 'Vision', 'Mental Health Coverage', 'Prescription Drug Coverage', 'SKIP'],
        type: 'options'
    },
    {
        id: 'healthcare_needs',
        question: "What are your primary healthcare needs? (Select all that apply)",
        options: [
            'Regular doctor visits',
            'Ongoing conditions',
            'Injuries',
            'Preventive care',
            'Specialist visits',
            'SKIP'
        ],
        type: 'options'
    },
    {
        id: 'diagnostic_tests',
        question: "Do you require frequent diagnostic tests, like X-rays or blood work?",
        options: ['Yes', 'No', 'SKIP'],
        type: 'boolean'
    },
    {
        id: 'prescription_drugs',
        question: "Do you regularly take prescription drugs?",
        options: ['Yes', 'No', 'SKIP'],
        type: 'boolean'
    },
    {
        id: 'emergency_room',
        question: "How often do you visit the emergency room?",
        options: ['Rarely', 'Occasionally', 'Frequently', 'SKIP'],
        type: 'options'
    },
    {
        id: 'maternity_planning',
        question: "Are you planning for pregnancy or maternity-related services in the near future?",
        options: ['Yes', 'No', 'SKIP'],
        type: 'boolean'
    },
    {
        id: 'wellness_benefits',
        question: "Would you like to include additional wellness benefits?",
        options: ['Yes', 'No', 'SKIP'],
        type: 'boolean'
    }
];


// Store user responses
async function generatePersonalizedSummary(
    selectedPlan: InsurancePlan,
    userResponses: Map<string, any>,
    userName: string
): Promise<string> {
    const context = {
        userName,
        familySize: userResponses.get('family_size'),
        primaryNeeds: userResponses.get('healthcare_needs'),
        diagnosticTests: userResponses.get('diagnostic_tests'),
        prescriptionDrugs: userResponses.get('prescription_drugs'),
        emergencyRoom: userResponses.get('emergency_room'),
        maternityPlanning: userResponses.get('maternity_planning'),
        additionalServices: userResponses.get('additional_services'),
        preferredHospital: userResponses.get('preferred_hospital'),
        plan: {
            name: selectedPlan.PlanName,
            pdfLink: selectedPlan.PdfLink,  // Added PDF link
            deductibles: {
                individual: selectedPlan.DeductibleIndividual,
                family: selectedPlan.DeductibleFamily
            },
            copays: {
                physician: selectedPlan.VisitToPhysicianCopay,
                diagnosticTest: selectedPlan.DiagnosticTestCopay,
                imaging: selectedPlan.ImagingCopay,
                genericDrugs: selectedPlan.GenericDrugsCopay,
                emergencyRoom: selectedPlan.EmergencyRoomCare
            },
            maternity: selectedPlan.MaternityCoinsurance,
            vaccination: selectedPlan.VaccinationCopay
        }
    };

    const prompt = `
    As an insurance expert, create a personalized summary explaining why ${context.plan.name} is suitable for ${context.userName}. 
    
    User Profile:
    - Family Coverage: ${context.familySize}
    - Primary Healthcare Needs: ${context.primaryNeeds}
    - Requires Diagnostic Tests: ${context.diagnosticTests}
    - Regular Prescription Needs: ${context.prescriptionDrugs}
    - Emergency Room Usage: ${context.emergencyRoom}
    - Maternity Planning: ${context.maternityPlanning}
    - Additional Services Requested: ${context.additionalServices}
    - Preferred Hospital Network: ${context.preferredHospital}

    Plan Details:
    - Deductibles: Individual $${context.plan.deductibles.individual}, Family $${context.plan.deductibles.family}
    - Copays: Physician $${context.plan.copays.physician}, Diagnostic $${context.plan.copays.diagnosticTest}
    - Emergency Room: $${context.plan.copays.emergencyRoom}
    - Maternity Coinsurance: ${context.plan.maternity}%
    - Vaccination Coverage: ${context.plan.vaccination === 0 ? 'Full Coverage' : context.plan.vaccination === null ? 'Not Covered' : `$${context.plan.vaccination} Copay`}

    Please provide a 2-paragraph summary:
    1. First paragraph explaining:
       - Why this plan matches their specific needs and circumstances
       - The key benefits that align with their healthcare requirements
       - Any specific advantages based on their family size and usage patterns
       - Potential cost savings based on their expected healthcare needs
    
    2. Second paragraph should say:
       "For complete details about your plan, please review the full plan documentation here: [PDF Link]"
       Replace [PDF Link] with: ${context.plan.pdfLink}

    Make it personal, clear, and focused on value proposition. Avoid technical jargon.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
}
// Store user responses
const userResponses = new Map<string, UserSession>();

// Generate recommendations based on user responses
function generateRecommendations(responses: Map<string, any>) {
    const planScores = insurancePlans.map(plan => {
        let score = 0;

        // Get user responses
        const familySize = responses.get('family_size');
        const needsMaternity = responses.get('maternity_planning') === 'Yes' ||
            responses.get('additional_services')?.includes('Maternity coverage');
        const needsDiagnostics = responses.get('diagnostic_tests') === 'Yes';
        const needsPrescriptions = responses.get('prescription_drugs') === 'Yes';
        const emergencyUse = responses.get('emergency_room');
        const healthcareNeeds = responses.get('healthcare_needs') || [];
        const preferredHospital = responses.get('preferred_hospital') || 'Local Hospital Network';

        // Calculate scores only for non-SKIP responses
        if (familySize && familySize !== 'SKIP') {
            if (familySize !== 'Self') {
                score += (5000 - plan.DeductibleFamily) / 1000;
            } else {
                score += (3000 - plan.DeductibleIndividual) / 600;
            }
        }

        if (needsMaternity && needsMaternity !== 'SKIP' && plan.MaternityCoinsurance === 0) {
            score += 20;
        }

        // Maternity coverage
        if (needsMaternity && plan.MaternityCoinsurance === 0) score += 20;

        // Diagnostic tests
        if (needsDiagnostics) {
            score += (100 - plan.DiagnosticTestCopay) / 20;
            score += (100 - plan.ImagingCopay) / 20;
        }

        // Prescription drugs
        if (needsPrescriptions) {
            score += (20 - plan.GenericDrugsCopay) / 4;
        }

        // Emergency room usage
        switch (emergencyUse) {
            case 'Frequently':
                score += (200 - plan.EmergencyRoomCare) / 40;
                break;
            case 'Occasionally':
                score += (150 - plan.EmergencyRoomCare) / 30;
                break;
        }

        // Healthcare needs
        if (healthcareNeeds.includes('Regular doctor visits') ||
            healthcareNeeds.includes('Ongoing conditions')) {
            score += (30 - plan.VisitToPhysicianCopay) / 6;
        }

        // Preferred hospital consideration
        if (preferredHospital !== 'Local Hospital Network') {
            score += 10;
        }

        return { plan, score };
    });

    return planScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ plan, score }) => ({
            name: plan.PlanName,
            features: [
                `Individual Deductible: $${plan.DeductibleIndividual}`,
                `Family Deductible: $${plan.DeductibleFamily}`,
                `Physician Visit Copay: $${plan.VisitToPhysicianCopay}`,
                `Diagnostic Test Copay: $${plan.DiagnosticTestCopay}`,
                `Generic Drugs Copay: $${plan.GenericDrugsCopay}`,
                `Emergency Room Care: $${plan.EmergencyRoomCare}`,
                `Maternity Coverage: ${plan.MaternityCoinsurance === 0 ? 'Full Coverage' : plan.MaternityCoinsurance + '% Coinsurance'}`,
                `Vaccination Coverage: ${plan.VaccinationCopay === 0 ? 'Fully Covered' :
                    plan.VaccinationCopay === null ? 'Not Covered' :
                        '$' + plan.VaccinationCopay + ' Copay'}`
            ],
            matchScore: Math.round(score * 100) / 100,
            planDetails: plan
        }));
}

async function generatePlanSummary(selectedPlan: any, userSession: UserSession) {
    const personalizedSummary = await generatePersonalizedSummary(
        selectedPlan.planDetails,
        userSession.responses,
        userSession.userName || "User"
    );

    return {
        personalizedSummary,
        timestamp: new Date().toISOString(),
        userName: userSession.userName
    };
}

// Main API route handler
// In /src/app/api/chatbot/route.ts

export async function POST(req: Request) {
    try {
        const { message, userId } = await req.json();

        // Initialize user session if it doesn't exist
        if (!userResponses.has(userId)) {
            userResponses.set(userId, {
                responses: new Map(),
                currentQuestionIndex: 0,
                phase: "questioning",
                keepCurrentPlan: false
            });
        }

        const userSession = userResponses.get(userId)!;

        // Handle plan selection phase
        if (userSession.phase === 'selecting_plan') {
            const selectedPlanIndex = parseInt(message) - 1;
            const recommendations = generateRecommendations(userSession.responses);

            if (selectedPlanIndex >= 0 && selectedPlanIndex < recommendations.length) {
                const selectedPlan = recommendations[selectedPlanIndex];
                const summary = await generatePersonalizedSummary(
                    selectedPlan.planDetails,
                    userSession.responses,
                    userSession.userName || "User"
                );

                // Clear session
                userResponses.delete(userId);

                return NextResponse.json({
                    type: 'plan_selected',
                    message: "Here's your personalized insurance plan summary:",
                    summary
                });
            }

            return NextResponse.json({
                type: 'error',
                message: "Please select a valid plan number (1, 2, or 3).",
                recommendations
            });
        }

        // Handle questioning phase
        // Store the current question's response before moving to the next
        if (userSession.currentQuestionIndex >= 0 &&
            userSession.currentQuestionIndex < insuranceQuestions.length) {

            const currentQuestion = insuranceQuestions[userSession.currentQuestionIndex];

            // Store the user's response for the current question
            userSession.responses.set(currentQuestion.id, message);

            // Special handling for name question
            if (currentQuestion.id === 'name') {
                userSession.userName = message;
            }

            // Check if this response was SKIP
            if (message === 'SKIP') {
                userSession.keepCurrentPlan = Array.from(userSession.responses.values())
                    .every(response => response === 'SKIP' || response === userSession.userName);
            }
        }

        // Move to next question
        userSession.currentQuestionIndex++;

        // In the POST handler, modify the final response section:

        if (userSession.currentQuestionIndex >= insuranceQuestions.length) {
            // Get all responses for summary
            const finalResponses = Object.fromEntries(userSession.responses);

            if (userSession.keepCurrentPlan) {
                // User skipped all questions, return current plan
                const summary = await generatePersonalizedSummary(
                    currentPlan,
                    userSession.responses,
                    userSession.userName || "User"
                );

                // Clear session
                userResponses.delete(userId);

                return NextResponse.json({
                    type: 'plan_selected',
                    message: "You've chosen to keep your current plan:",
                    summary,
                    finalPlan: {
                        planName: "Horizon Blue",
                        premium: "$/month",
                        coverageDetails: [
                            { label: "Individual Deductible", value: "$1500" },
                            { label: "Family Deductible", value: "$3000" },
                            { label: "Physician Visit Copay", value: "$20" },
                            { label: "Diagnostic Test Copay", value: "$0" },
                            { label: "Generic Drugs Copay", value: "$10" },
                            { label: "Emergency Room Care", value: "$100" },
                            { label: "Maternity Coverage", value: "Full Coverage" },
                            { label: "Vaccination Coverage", value: "$10 Copay" },
                        ]
                    }
                });
            }

            // Show final recommendations with updated current plan
            const recommendations = generateRecommendations(userSession.responses);
            userSession.phase = "selecting_plan";

            return NextResponse.json({
                type: 'final_summary',  // New type for final summary
                message: "Here's your updated plan and recommendations:",
                currentPlan: {
                    planName: "Updated Horizon Blue",
                    premium: "$/month",
                    coverageDetails: [
                        { label: "Individual Deductible", value: "$1500" },
                        { label: "Family Deductible", value: "$3000" },
                        { label: "Physician Visit Copay", value: "$20" },
                        { label: "Diagnostic Test Copay", value: "$0" },
                        { label: "Generic Drugs Copay", value: "$10" },
                        { label: "Emergency Room Care", value: "$100" },
                        { label: "Maternity Coverage", value: "Full Coverage" },
                        { label: "Vaccination Coverage", value: "$10 Copay" },
                        { label: "Wellness Benefits", value: finalResponses.wellness_benefits === 'Yes' ? "Included" : "Not Included" }
                    ]
                },
                recommendations
            });
        }

        // Get next question
        const nextQuestion = insuranceQuestions[userSession.currentQuestionIndex];

        // Safety check for nextQuestion
        if (!nextQuestion) {
            return NextResponse.json({
                type: 'error',
                message: "An error occurred while getting the next question.",
            });
        }

        return NextResponse.json({
            type: 'question',
            message: nextQuestion.question,
            options: nextQuestion.options || [],
            questionType: nextQuestion.type
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}