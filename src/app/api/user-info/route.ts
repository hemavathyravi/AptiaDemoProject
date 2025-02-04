import { NextApiRequest, NextApiResponse } from 'next';

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//     // Mock data for demonstration
//     if (req.method !== 'GET') {
//         return res.status(405).json({ error: "Method Not Allowed" });
//     }

//     // Mock data for demonstration
//     const userInfo = {
//         name: "John Doe",
//         currentPlan: "AmeriHealth Gold"
//     };

//     res.status(200).json(userInfo);
// }

// app/api/user-info/route.js
export async function GET(req:NextApiRequest) {
    const userInfo = {
        name: "John Doe",
        currentPlan: "AmeriHealth Gold"
    };

    return new Response(JSON.stringify(userInfo), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}