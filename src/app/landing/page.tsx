"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-100 text-black p-6">
      {/* Header */}
      <div className="absolute top-4 left-4 text-lg font-semibold text-blue-600">Hi Alex!</div>
      <div className="absolute top-4 right-4">
        <Image src="/images/logo1.png" alt="Company Logo" width={100} height={50} />
      </div>

      {/* Main Content */}
      <div className="bg-white shadow-xl rounded-xl p-8 text-center w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-blue-600">Employee Details</h1>
        <p className="text-lg">Employee Name: <span className="font-semibold">Alex</span></p>
        <p className="text-lg">Employee ID: <span className="font-semibold">12345</span></p>
        <p className="text-lg">Previous Insurance Plan: <span className="font-semibold">Horizon Blue</span></p>

        {/* Question Section */}
        <div className="mt-6">
          <p className="text-lg font-medium mb-4">Do you want any changes?</p>
          <div className="flex justify-center gap-4">
            <Button 
              className="bg-blue-600 text-white hover:bg-blue-700" 
              onClick={() => router.push("/chatbot")}
            >
              Yes
            </Button>
            <Button className="bg-gray-300 text-black hover:bg-gray-400">
              No
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}