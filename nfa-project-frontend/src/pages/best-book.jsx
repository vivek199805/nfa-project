import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import WorkflowPageLayout from "../features/components/layout/WorkflowPageLayout";
import AuthorSection from "../component/best-book-component/author-component";
import BestBookCinemaSection from "../component/best-book-component/book-cinema-component";
import PublisherBookSection from "../component/best-book-component/punlisher-book-component";
import BookDeclarationSection from "../component/best-book-component/declaration-component";
import PreviewPaymentSection from "../component/best-book-component/preview-payment";
import { useFetchById } from "../hooks/useFetchById";
import { getResumeStep } from "../common/entry-step";
import { apiConfig } from "../services/apiEndpoints";

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
  const { data: formData } = useFetchById(apiConfig.bestBook.entryBy, id);

  useEffect(() => {
    if (id && formData?.data?.active_step !== undefined) {
      setActiveSection(getResumeStep(formData.data.active_step, steps.length));
    }
  }, [id, formData]);

  return (
    <WorkflowPageLayout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      stepIndicator={steps}
      steps={steps}
      subtitle="Best Book on Cinema Registration"
    >
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
    </WorkflowPageLayout>
  );
};

export default BestBookPage;
