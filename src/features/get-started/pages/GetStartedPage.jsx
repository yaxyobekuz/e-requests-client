// Hooks
import useSteps from "../hooks/useSteps";

// Router
import { Link, Navigate } from "react-router-dom";

// Components
import StepBars from "@/shared/components/ui/StepBars";

// Icons
import { ChevronLeft, ChevronsRight } from "lucide-react";

const GetStartedPage = () => {
  // If user is already authenticated, redirect to dashboard
  // const token = localStorage.getItem("token");
  // if (token) return <Navigate to="/dashboard" replace />;

  const { currentStep, isLastStep, isFirstStep, steps } = useSteps();

  return (
    <div
      key={currentStep.number}
      className="container h-screen animate__animated animate__fadeIn"
    >
      {/* Top */}
      <div className="flex items-center gap-3.5 h-[60px]">
        {/* Back button */}
        <Link
          to={
            isFirstStep ? undefined : `/get-started/${currentStep.number - 1}`
          }
          className="flex items-center justify-center w-10 h-7 shrink-0 rounded-lg bg-gray-100 transition-colors duration-200 hover:bg-gray-200"
        >
          <ChevronLeft strokeWidth={1.5} size={20} />
        </Link>

        {/* Step Bars */}
        <StepBars totalSteps={steps.length} currentStep={currentStep} />

        {/* Skip button */}
        <Link
          to="/register"
          className="flex items-center justify-center w-10 h-7 shrink-0 rounded-lg bg-gray-100 transition-colors duration-200 hover:bg-gray-200"
        >
          <ChevronsRight strokeWidth={1.5} size={20} />
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-col text-center h-[calc(100vh-152px)] overflow-y-auto">
        <div className="flex items-center justify-center grow">
          <img src={currentStep.image} alt="" />
        </div>

        <div className="space-y-3.5 py-4 text-center">
          <h1 className="text-xl font-semibold">{currentStep.title}</h1>
          <p className="text-gray-500">{currentStep.description}</p>
        </div>
      </div>

      {/* Navigation button */}
      <div className="flex pt-4 gap-3.5 h-[92px]">
        <Link
          to={
            isLastStep ? "/register" : `/get-started/${currentStep.number + 1}`
          }
          className="flex items-center justify-center bg-blue-500 w-full h-12 rounded-lg text-white font-medium"
        >
          {currentStep.button}
        </Link>
      </div>
    </div>
  );
};

export default GetStartedPage;
