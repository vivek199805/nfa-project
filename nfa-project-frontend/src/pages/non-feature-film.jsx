import { useParams } from "react-router-dom";
import CensorSection from "../component/feature-component/censor-component";
import CompanyRegistrationSection from "../component/feature-component/company-component";
import DeclarationSection from "../component/feature-component/Declaration-component";
import DirectorDetailsSection from "../component/feature-component/director-component";
import FilmDetailsSection from "../component/feature-component/film-details-component";
import PaymentSection from "../component/feature-component/PaymentSection-component";
import ProducerDetailsSection from "../component/feature-component/producer-component";
import ReturnSection from "../component/feature-component/return-component";
import { useState } from "react";
import OtherSection from "../component/non-feature-component/other-component";
import ViewSection from "../component/non-feature-component/view-section";
import WorkflowPageLayout from "../features/components/layout/WorkflowPageLayout";
import { useFetchById } from "../hooks/useFetchById";
import { getFilmEntryByEndpoint } from "../common/film-workflow";
import { useResumeWorkflowStep } from "../hooks/useResumeWorkflowStep";

const steps = [
  "General",
  "Censor",
  "Company Registration",
  "Producer(s) Details",
  "Director(s) Details",
  "Other",
  "Return",
  "View",
  "Declaration",
  "Payment",
];

const NonFeatureFilmPage = () => {
  const [activeSection, setActiveSection] = useState(1);
  const { id } = useParams();
  const { data: formData, } = useFetchById(getFilmEntryByEndpoint("non-feature"), id);

  useResumeWorkflowStep({
    id,
    activeStep: formData?.data?.active_step,
    stepsLength: steps.length,
    setActiveSection,
  });

  return (
    <WorkflowPageLayout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      stepIndicator={steps}
      steps={steps}
      subtitle="Non Feature Film Registration"
    >
      {activeSection == 1 && (
        <FilmDetailsSection
          filmType={"non-feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 2 && (
        <CensorSection
          filmType={"non-feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 3 && (
        <CompanyRegistrationSection
          filmType={"non-feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 4 && (
        <ProducerDetailsSection
          filmType={"non-feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 5 && (
        <DirectorDetailsSection
          filmType={"non-feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 6 && (
        <OtherSection
          filmType={"non-feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 7 && (
        <ReturnSection
          filmType={"non-feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 8 && (
        <ViewSection
          filmType={"non-feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 9 && (
        <DeclarationSection
          filmType={"non-feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 10 && (
        <PaymentSection
          filmType={"non-feature"}
          setActiveSection={setActiveSection}
        />
      )}
    </WorkflowPageLayout>
  );
};

export default NonFeatureFilmPage;
