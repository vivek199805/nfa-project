import { useParams } from "react-router-dom";
import StepIndicator from "../component/StepIndicator";
import { useEffect, useState } from "react";
import Navbar from "../component/layouts/navbar";
import BestFilmSection from "../component/best-filmCritic-component/best-film-critic-component";
import CriticSection from "../component/best-filmCritic-component/critic-component";
import PublisherNewspaperSection from "../component/best-filmCritic-component/publisher-component";
import ViewSection from "../component/best-filmCritic-component/view-component";
import DeclarationSection from "../component/best-filmCritic-component/declaration-component";
import { useFetchById } from "../hooks/useFetchById";

const steps = [
  "Best Flim Critic",
  "Critic",
  "Publisher of the Newspaper Journal",
  "Declaration",
  "View",
];
const BestFilmCriticPage = () => {
  const [activeSection, setActiveSection] = useState(1);
  const { id } = useParams();
  const { data: formData } = useFetchById("best-film-critic-entry-by", id);

  useEffect(() => {
    console.log("Form cards data:", formData);
    if (id && formData?.data?.active_step !== undefined) {
      const step = +formData.data.active_step;
      setActiveSection(step < steps.length ? step + 1 : steps.length);
    }
  }, [id, formData]);

  return (
    <>
      <Navbar />

      <div className="row form-div">
        <div className="col-lg-12 mt-5">
          <div className="film-form-container">
            <StepIndicator
              currentStep={activeSection}
              onStepClick={(stepNumber) => setActiveSection(stepNumber)}
              stepIndicator={steps}
            />
            <div className="form-box">
              <h2 className="form-title">{steps[activeSection - 1]}</h2>
              <h3 className="form-subtitle">
                Best Film Critic Registration | Step {activeSection}
              </h3>

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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BestFilmCriticPage;
