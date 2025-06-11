
import { Check } from "lucide-react";
import "./../styles/FeatureFilmForm.css";

const steps = [
  "Film Details", "Censor", "Company Registration", "Producer(s) Details", "Director(s) Details",
  "Actors", "Songs", "Audiographer", "ScreenPlay", "Return", "Declaration", "Payment"
];

const StepIndicator = ({ currentStep, onStepClick, stepIndicator }) => {
  return (
    <div className="step-indicator">
      {(stepIndicator? stepIndicator: steps).map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <div
           key={index}
            className={`step-item ${isCompleted ? "completed" : isActive ? "active" : "upcoming"}`}
            onClick={() => stepNumber <= currentStep && onStepClick?.(stepNumber)}
          >
            <div className="step-circle">
              {isCompleted ? <Check size={16} strokeWidth={3} color="white" /> : stepNumber}
            </div>
            <div className="step-label">{step}</div>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
