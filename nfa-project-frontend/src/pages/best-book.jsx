import { useParams } from "react-router-dom";
import StepIndicator from "../component/StepIndicator";
import { useEffect, useState } from "react";
import Navbar from "../component/layouts/navbar";
import AuthorSection from "../component/best-book-component/author-component";
import BestBookCinemaSection from "../component/best-book-component/book-cinema-component";
import PublisherBookSection from "../component/best-book-component/punlisher-book-component";
import BookDeclarationSection from "../component/best-book-component/declaration-component";
import PreviewPaymentSection from "../component/best-book-component/preview-payment";
import { useFetchById } from "../hooks/useFetchById";

const steps = [
  "Author",
  "Best Book On Cinema",
  "Publisher of the Book / Editor(S) Of The Newspaper",
  "Declaration",
  "preview & Payment",
];
const BestBookPage = () => {
  const [activeSection, setActiveSection] = useState(1);
  const { id } = useParams();
  const { data: formData } = useFetchById("best-book-cinema-entry-by", id);

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
