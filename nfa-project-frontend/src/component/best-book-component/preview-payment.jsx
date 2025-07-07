import { useEffect, useState } from "react";
import "../../styles/accordion.css";
import { ChevronDown, Pencil } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useFetchById } from "../../hooks/useFetchById";
import { postRequest } from "../../common/services/requestService";
import { showSuccessToast } from "../../common/services/toastService";

const PreviewPaymentSection = ({ setActiveSection }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const { id } = useParams();
  const { data: formData } = useFetchById("best-book-cinema-entry-by", id);
  const navigate = useNavigate();

  const steps = [
    "Author",
    "Best Book on Cinema",
    "Publisher of the Book/Editor(S) of the  Newspaper",
  ];

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    // Optional data initialization if needed
  }, [formData]);

  const onPayment = async () => {
    // payment logic here
    const formData = new FormData();
    formData.append("form_type", "BEST_BOOK");
    formData.append("id", id);
    const response = await postRequest("generate-hash", formData);
    if (response.statusCode == 200) {
      showSuccessToast(response.message);
    }
  };
  const onFinish = async () => {
    // payment logic here
    const formData = new FormData();
    formData.append("id", id);
    const response = await postRequest(
      "best-book-cinema-final-submit",
      formData
    );
    if (response.statusCode == 200) {
      showSuccessToast(response.message);
      navigate("/dashboard");
    }
  };

  return (
    <>
      <div className="accordion">
        {steps.map((step, idx) => (
          <AccordionItem
            key={idx}
            title={step}
            index={idx}
            isOpen={activeIndex === idx}
            onToggle={() => toggle(idx)}
            onEdit={() => setActiveSection(idx + 1)}
          >
            {/* Placeholder for content */}
            {step === "Author" ? (
              <AuthorView data={formData?.data} />
            ) : step === "Best Book on Cinema" ? (
              <BestBookView data={formData?.data} />
            ) : step === "Publisher of the Book/Editor(S) of the  Newspaper" ? (
              <PublisherBookView data={formData?.data} />
            ) : (
              <p>This is content for {step} section.</p>
            )}
          </AccordionItem>
        ))}
      </div>

      <div className="col-12 text-center mt-3">
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onPayment()}
        >
          Pay with Build Desk
        </button>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setActiveSection(4)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Prev
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          onClick={() => onFinish()}
        >
          FINISH <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </>
  );
};

export default PreviewPaymentSection;

const AccordionItem = ({
  title,
  index,
  children,
  isOpen,
  onToggle,
  onEdit,
}) => (
  <div className="accordion-item">
    <div className="accordion-header">
      <div className="d-flex align-items-center gap-2" onClick={onToggle}>
        <Pencil
          className="cursor-pointer"
          size={16}
          color="#0b556a"
          onClick={(e) => {
            e.stopPropagation(); // Prevent accordion toggle
            onEdit(index + 1);
          }}
        />
        <div className="accordion-title">{title}</div>
      </div>

      <ChevronDown
        className={`accordion-arrow ${isOpen ? "rotate" : ""}`}
        color="#555"
        onClick={onToggle}
      />
    </div>

    {isOpen && <div className="accordion-body">{children}</div>}
  </div>
);

const BestBookView = ({ data }) => {
  return (
    <div className="producer-view">
      {data?.book.map((book, index) => (
        <div className="card p-3 mb-3" key={index}>
          <div className="fw-semibold mb-2">({index + 1}) Books Details</div>
          <div className="row">
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Book Title :</strong> {book.book_title_original}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Language:</strong> {book.language_id}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Censor date:</strong> {book.date_of_publication}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>English Title:</strong> {book.book_title_english}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Author Name :</strong> {book.author_name}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Price :</strong> {book.book_price}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PublisherBookView = ({ data }) => {
  return (
    <div className="producer-view">
      {data?.editors.map((editor, index) => (
        <div className="card p-3 mb-3" key={index}>
          <div className="fw-semibold mb-2">
            ({index + 1}) Publisher Details
          </div>
          <div className="row">
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Editor Name:</strong> {editor.editor_name}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Landline No:</strong> {editor.editor_landline}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Citizenship :</strong> {editor.editor_citizenship}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Address :</strong> {editor.editor_address}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Email ID:</strong> {editor.editor_address}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Mobile No :</strong> {editor.editor_mobile}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const AuthorView = ({ data }) => {
  return (
    <div className="return-view">
      <div className="row">
        <div className="col-6 label-column">
          <div>
            <strong>
              Name of the Author <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Author Contact Number <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Author Indian Nationality <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>Author Address :</strong>
          </div>
          <div>
            <strong>
              Author profile (100-150) words
              <span className="text-danger">*</span>:
            </strong>
          </div>
        </div>

        <div className="col-6 value-column">
          <div>{data.author_name}</div>
          <div>{data.author_contact}</div>
          <div>{data.author_nationality_indian == 1 ? "Yes" : "No"}</div>
          <div>{data.author_address}</div>
          <div>{data.author_profile}</div>
        </div>
      </div>
    </div>
  );
};
