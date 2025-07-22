import { useParams } from "react-router-dom";
import CensorSection from "../component/feature-component/censor-component";
import CompanyRegistrationSection from "../component/feature-component/company-component";
import DeclarationSection from "../component/feature-component/Declaration-component";
import DirectorDetailsSection from "../component/feature-component/director-component";
import FilmDetailsSection from "../component/feature-component/film-details-component";
import PaymentSection from "../component/feature-component/PaymentSection-component";
import ProducerDetailsSection from "../component/feature-component/producer-component";
import ReturnSection from "../component/feature-component/return-component";
import StepIndicator from "../component/StepIndicator";
import { useEffect, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { getRequestById } from "../common/services/requestService";
import OtherSection from "../component/non-feature-component/other-component";
import ViewSection from "../component/non-feature-component/view-section";
import Navbar from "../component/layouts/navbar";
import { useFetchById } from "../hooks/useFetchById";

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
  const { data: formData, } = useFetchById("film/non-feature-entry-by", id);

  // const { data: formData } = useQuery({
  //   queryKey: ["film/feature-entry-by", id],
  //   queryFn: () => getRequestById("film/non-feature-entry-by", id),
  //   refetchOnMount: true,
  //   staleTime: 0,
  // });

  useEffect(() => {
    if (id && formData?.data?.active_step != null) {
      const step = +formData.data.active_step;
      setActiveSection(step < steps.length ? step + 1 : steps.length);
    }
  }, [id, formData]);

  return (
    <>
      <Navbar />

      <div className="row">
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
                Non Feature Film Registration | Step {activeSection}
              </h3>

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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NonFeatureFilmPage;
