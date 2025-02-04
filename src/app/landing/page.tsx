"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Home from "../chatbot/page";
import { useState } from "react";
import InsurancePlan from "@/components/InsurancePlan";

export default function LandingPage() {
  
  const [activateCB,setactivateCB] = useState(false);

  return (
    <div className="flex flex-col justify-center items-center bg-blue-100 text-black p-6">
      {/* Header */}
      <div className="absolute top-4 left-4 text-lg font-semibold text-blue-600">Hi Alex!</div>
      <div className="absolute top-4 right-4">
        <Image src="/images/logo1.png" alt="Company Logo" width={100} height={50} />
      </div>

      {/* Main Content */}
      <div className="bg-white shadow-xl rounded-xl p-8 text-center w-[80%]">
        <h1 className="text-2xl font-bold mb-4 text-blue-600">Employee Details</h1>
        <p className="text-lg"><strong>Employee ID:</strong> <span className="">EMP1000435</span></p>
        <p className="text-lg"><strong>Employee Name:</strong> <span className="">Alex S.</span></p>
        <p className="text-lg"><strong>Previous Insurance Plan:</strong> <span className="">Horizon Blue</span></p>
        <InsurancePlan planName="Horizon Blue"/>

        {/* Question Section */}
        <div className="mt-6">
          <p className="text-lg font-medium mb-4">Do you want any changes?</p>
          <div className="flex justify-center gap-4">
            <Button 
              className="bg-blue-600 text-white hover:bg-blue-700" 
              onClick={() => {setactivateCB(true);}}
            >
              Yes
            </Button>
            <Button className="bg-gray-300 text-black hover:bg-gray-400 mb-5"
            onClick={() => {setactivateCB(false);}}>
              No
            </Button>
          </div>
          {activateCB?<Home/>:<></>}
        </div>
      </div>
    </div>
  );
}