import { useParams } from "react-router-dom";
import StepIndicator from "../features/components/shared/StepIndicator";
import { useEffect, useState } from "react";
import Navbar from "../features/components/layout/Navbar";
import AuthorSection from "../component/best-book-component/author-component";
import BestBookCinemaSection from "../component/best-book-component/book-cinema-component";
import PublisherBookSection from "../component/best-book-component/punlisher-book-component";
import BookDeclarationSection from "../component/best-book-component/declaration-component";
import PreviewPaymentSection from "../component/best-book-component/preview-payment";
import { useFetchById } from "../hooks/useFetchById";
import { getResumeStep } from "../common/entry-step";
import { bestBookEndpoints } from "../common/award-workflow";

const steps = [
  "Author",
  "Best Book on Cinema",
  "Publisher / Editor",
  "Declaration",
  "Preview & Payment",
];
const BestBookPage = () => {
  const [activeSection, setActiveSection] = useState(1);
  const { id } = useParams();
  const { data: formData } = useFetchById(bestBookEndpoints.entryBy, id);

  useEffect(() => {
    if (id && formData?.data?.active_step !== undefined) {
      setActiveSection(getResumeStep(formData.data.active_step, steps.length));
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
                Best Book on Cinema Registration | Step {activeSection}
              </h3>

              {activeSection == 1 && (
                <AuthorSection setActiveSection={setActiveSection} />
              )}
              {activeSection == 2 && (
                <BestBookCinemaSection setActiveSection={setActiveSection} />
              )}
              {activeSection == 3 && (
                <PublisherBookSection setActiveSection={setActiveSection} />
              )}
              {activeSection == 4 && (
                <BookDeclarationSection setActiveSection={setActiveSection} />
              )}
              {activeSection == 5 && (
                <PreviewPaymentSection setActiveSection={setActiveSection} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BestBookPage;
