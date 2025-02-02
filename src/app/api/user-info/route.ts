// src/app/api/user-info/route.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // Mock data for demonstration
    const userInfo = {
        name: "John Doe",
        currentPlan: "AmeriHealth Gold"
    };

    res.status(200).json(userInfo);
}