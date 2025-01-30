import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ChatMessageProps {
    type: 'user' | 'bot';
    message: any; // The message content
    options?: string[];
    questionType?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ type, message, options, questionType }) => {
    // Function to render plan summary
    const renderPlanSummary = (planSummary: any) => {
        return (
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Plan Summary</h3>

                {/* Plan Name and Score */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold">{planSummary.selectedPlan.PlanName}</h4>
                    <p>Match Score: {planSummary.matchScore}%</p>
                </div>

                {/* Personalized Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Why This Plan Is Right For You:</h4>
                    {planSummary.personalizedSummary.split('\n\n').map((paragraph: string, index: number) => (
                        <p key={index} className="mb-3 text-gray-700">
                            {paragraph}
                        </p>
                    ))}
                </div>

                {/* Key Features */}
                <div className="mt-4">
                    <h4 className="font-semibold mb-2">Key Features:</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {planSummary.planFeatures.map((feature: string, index: number) => (
                            <div key={index} className="bg-gray-50 p-2 rounded">
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Function to render message content based on type
    const renderMessageContent = () => {
        if (typeof message === 'object' && message.type === 'plan_selected') {
            return (
                <div>
                    <p className="mb-4">{message.message}</p>
                    {renderPlanSummary(message.planSummary)}
                </div>
            );
        }

        // Handle other message types (text, options, etc.)
        return (
            <div>
                <p>{message.message || message}</p>
                {options && options.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                className="block w-full text-left p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <Card className={`max-w-[80%] ${type === 'user' ? 'bg-blue-50' : 'bg-white'}`}>
                <CardContent className="p-4">
                    {renderMessageContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default ChatMessage;