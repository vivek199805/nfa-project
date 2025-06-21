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
import StepIndicator from "../component/StepIndicator";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRequestById } from "../common/services/requestService";
import Navbar from "../component/layouts/navbar";

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
  const { data: formData } = useQuery({
    queryKey: ["film/feature-entry-by", id],
    queryFn: () => getRequestById("film/feature-entry-by", id),
    enabled: !!id,
    // initialData: staticForms, // sets mock data
    refetchOnMount: true,
    staleTime: 0,
  });

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
            />
            <div className="form-box">
              <h2 className="form-title">{steps[activeSection - 1]}</h2>
              <h3 className="form-subtitle">
                Feature Film Registration | Step {activeSection}
              </h3>

              {activeSection == 1 && (
                <FilmDetailsSection
                  filmType={'feature'}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 2 && (
                <CensorSection
                  filmType={'feature'}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 3 && (
                <CompanyRegistrationSection
                  filmType={'feature'}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 4 && (
                <ProducerDetailsSection
                  filmType={'feature'}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 5 && (
                <DirectorDetailsSection
                  filmType={'feature'}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 6 && (
                <ActorSection
                  filmType={'feature'}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 7 && (
                <SongsFormSection
                  filmType={'feature'}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 8 && (
                <AudiographerSection
                  filmType={'feature'}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 9 && (
                <ScreenPlaySection
                  filmType={'feature'}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 10 && (
                <ReturnSection
                  filmType={'feature'}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 11 && (
                <DeclarationSection
                  filmType={'feature'}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 12 && (
                <PaymentSection
                  filmType={'feature'}
                  setActiveSection={setActiveSection}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeatureFilmPage;
