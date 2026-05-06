import Navbar from "./Navbar";
import StepIndicator from "../shared/StepIndicator";

const WorkflowPageLayout = ({
  activeSection,
  children,
  setActiveSection,
  stepIndicator,
  steps,
  subtitle,
}) => (
  <>
    <Navbar />

    <div className="row form-div">
      <div className="col-lg-12 mt-5">
        <div className="film-form-container">
          <StepIndicator
            currentStep={activeSection}
            onStepClick={(stepNumber) => setActiveSection(stepNumber)}
            stepIndicator={stepIndicator}
          />
          <div className="form-box">
            <h2 className="form-title">{steps[activeSection - 1]}</h2>
            <h3 className="form-subtitle">
              {subtitle} | Step {activeSection}
            </h3>

            {children}
          </div>
        </div>
      </div>
    </div>
  </>
);

export default WorkflowPageLayout;
