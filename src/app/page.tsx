"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Importing the eye icons

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    const handleLogin = () => {
        if (username && password) {
            router.push("/landing");
        } else {
            alert("Please fill out both fields.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-blue-100 text-black p-6 relative">
            {/* Logo at the top-right corner */}
            <div className="absolute top-4 right-4">
                <img src="/images/logo1.png" alt="Logo" width={100} height={50} />
            </div>

            <div className="bg-white shadow-xl rounded-xl p-8 text-center w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-blue-600">Login</h1>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mb-4 p-2 border rounded w-full"
                    required
                />
                <div className="relative mb-4">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-2 border rounded w-full"
                        required
                    />
                    <div
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                    </div>
                </div>
                <Button
                    className="bg-blue-600 text-white hover:bg-blue-700 w-full"
                    onClick={handleLogin}
                >
                    Login
                </Button>
            </div>
        </div>
    );
}
