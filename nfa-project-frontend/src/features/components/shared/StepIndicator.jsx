
import { Check } from "lucide-react";
import "../../../styles/FeatureFilmForm.css";

const steps = [
  "Film Details", "Censor", "Company Registration", "Producer(s) Details", "Director(s) Details",
  "Actors", "Songs", "Audiographer", "ScreenPlay", "Return", "Declaration", "Payment"
];

const StepIndicator = ({ currentStep, onStepClick, stepIndicator }) => {
  return (
    <div className="step-indicator-wrap">
      <div className="step-indicator" aria-label="Submission progress">
        {(stepIndicator ? stepIndicator : steps).map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const stepStatus = isCompleted
            ? "completed"
            : isActive
              ? "current"
              : "upcoming";

          return (
            <button
              key={index}
              type="button"
              className={`step-item ${
                isCompleted ? "completed" : isActive ? "active" : "upcoming"
              }`}
              onClick={() => stepNumber <= currentStep && onStepClick?.(stepNumber)}
              disabled={stepNumber > currentStep}
              aria-current={isActive ? "step" : undefined}
              aria-label={`Step ${stepNumber}: ${step} (${stepStatus})`}
            >
              <div className="step-circle">
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} color="white" aria-hidden="true" />
                ) : (
                  stepNumber
                )}
              </div>
              <div className="step-label">{step}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
