import { useParams } from "react-router-dom";
import ActorSection from "../component/feature-component/actor-component";
import AudiographerSection from "../component/feature-component/audiographer";
import CensorSection from "../component/feature-component/censor-component";
import CompanyRegistrationSection from "../component/feature-component/company-component";
import DeclarationSection from "../component/feature-component/Declaration-component";
import DirectorDetailsSection from "../component/feature-component/director-component";
import FilmDetailsSection from "../component/feature-component/film-details-component";
import PaymentSection from "../component/feature-component/PaymentSection-component";
import ProducerDetailsSection from "../component/feature-component/producer-component";
import ReturnSection from "../component/feature-component/return-component";
import ScreenPlaySection from "../component/feature-component/screenplay-component";
import SongsFormSection from "../component/feature-component/songs-component";
import { useState } from "react";
import WorkflowPageLayout from "../features/components/layout/WorkflowPageLayout";
import { useFetchById } from "../hooks/useFetchById";
import { getFilmEntryByEndpoint } from "../common/film-workflow";
import { useResumeWorkflowStep } from "../hooks/useResumeWorkflowStep";

const steps = [
  "Film Details",
  "Censor",
  "Company Registration",
  "Producer(s) Details",
  "Director(s) Details",
  "Actors",
  "Songs",
  "Audiographer",
  "ScreenPlay",
  "Return",
  "Declaration",
  "Payment",
];

const FeatureFilmPage = () => {
  const [activeSection, setActiveSection] = useState(1);
  const { id } = useParams();

  const { data: formData } = useFetchById(getFilmEntryByEndpoint("feature"), id);

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
      steps={steps}
      subtitle="Feature Film Registration"
    >
      {activeSection == 1 && (
        <FilmDetailsSection
          filmType={"feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 2 && (
        <CensorSection
          filmType={"feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 3 && (
        <CompanyRegistrationSection
          filmType={"feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 4 && (
        <ProducerDetailsSection
          filmType={"feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 5 && (
        <DirectorDetailsSection
          filmType={"feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 6 && (
        <ActorSection
          filmType={"feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 7 && (
        <SongsFormSection
          filmType={"feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 8 && (
        <AudiographerSection
          filmType={"feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 9 && (
        <ScreenPlaySection
          filmType={"feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 10 && (
        <ReturnSection
          filmType={"feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 11 && (
        <DeclarationSection
          filmType={"feature"}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection == 12 && (
        <PaymentSection
          filmType={"feature"}
          setActiveSection={setActiveSection}
        />
      )}
    </WorkflowPageLayout>
  );
};

export default FeatureFilmPage;
