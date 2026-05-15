import { useParams } from "react-router-dom";
import { useState } from "react";
import WorkflowPageLayout from "../features/components/layout/WorkflowPageLayout";
import BestFilmSection from "../component/best-filmCritic-component/best-film-critic-component";
import CriticSection from "../component/best-filmCritic-component/critic-component";
import PublisherNewspaperSection from "../component/best-filmCritic-component/publisher-component";
import ViewSection from "../component/best-filmCritic-component/view-component";
import DeclarationSection from "../component/best-filmCritic-component/declaration-component";
import { useFetchById } from "../hooks/useFetchById";
import { apiConfig } from "../services/apiEndpoints";
import { useResumeWorkflowStep } from "../hooks/useResumeWorkflowStep";

const steps = [
  "Best Film Critic",
  "Critic",
  "Publisher / Journal",
  "Declaration",
  "View",
];
const BestFilmCriticPage = () => {
  const [activeSection, setActiveSection] = useState(1);
  const { id } = useParams();
  const { data: formData } = useFetchById(apiConfig.filmCritic.entryBy, id);

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
      subtitle="Best Film Critic Registration"
    >
      {activeSection == 1 && (
        <BestFilmSection setActiveSection={setActiveSection} />
      )}
      {activeSection == 2 && (
        <CriticSection setActiveSection={setActiveSection} />
      )}
      {activeSection == 3 && (
        <PublisherNewspaperSection
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 4 && (
        <DeclarationSection setActiveSection={setActiveSection} />
      )}
      {activeSection == 5 && (
        <ViewSection setActiveSection={setActiveSection} />
      )}
    </WorkflowPageLayout>
  );
};

export default BestFilmCriticPage;
