import { useEffect, useState } from "react";
import "../../styles/accordion.css";
import { ChevronDown, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchById } from "../../hooks/useFetchById";
import { postRequest } from "../../common/services/requestService";
import { showSuccessToast } from "../../common/services/toastService";

const ViewSection = ({ setActiveSection }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const { id } = useParams();
  const  navigate = useNavigate();

  const steps = [
    "Best Film Critic",
    "Critic",
    "Publisher of the Newspaper Journel",
  ];

  const { data: formData } = useFetchById("best-film-critic-entry-by", id);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    // Optional data initialization if needed
  }, [formData]);

  const onPayment = async () => {
    // payment logic here
    const formData = new FormData();
    formData.append("form_type", "BEST_FILM_CRITIC");
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
    const response = await postRequest("best-film-critic-final-submit", formData);
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
            {step === "Best Film Critic" ? (
              <BestFilmView data={formData?.data} />
            ) : step === "Critic" ? (
              <CriticView data={formData?.data} />
            ) : step === "Publisher of the Newspaper Journel" ? (
              <PublisherView data={formData?.data} />
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

export default ViewSection;

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

const CriticView = ({ data }) => {
  return (
    <div className="return-view">
      <div className="row">
        <div className="col-6 label-column">
          <div>
            <strong>
              Critic Name <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Critic Address <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Critic Contact No<span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Critic Indian Nationality <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Critic Indian Nationality <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Critic Aadhaar Card<span className="text-danger">*</span>:
            </strong>
          </div>
        </div>

        <div className="col-6 value-column">
          <div>{data.critic_name}</div>
          <div>{data.critic_address}</div>
          <div>{data.critic_contact}</div>
          <div>{data.critic_indian_nationality == 1 ? "YES" : "NO"}</div>
          <div>{data.critic_profile}</div>
          <div>
            {data.critic_aadhaar_card ? (
              <>
                <a
                  href={`${import.meta.env.VITE_API_URL}/${
                    data.critic_aadhaar_card
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary ms-2"
                >
                  View
                </a>
              </>
            ) : (
              <span className="id-proof-status text-muted">Not Provided</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PublisherView = ({ data }) => {
  return (
    <div className="producer-view">
      {data?.editors.map((producer, index) => (
        <div className="card p-3 mb-3" key={index}>
          <div className="fw-semibold mb-2">
            ({index + 1}) Publisher Details
          </div>
          <div className="row">
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Citizenship :</strong> {producer?.editor_citizenship}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong> Editor Name:</strong> {producer?.editor_name}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Mobile:</strong> {producer?.editor_mobile}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Email:</strong> {producer?.editor_email}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Address :</strong> {producer?.editor_address}
            </div>
            <div className="col-md-4 col-sm-6 mb-2 d-flex align-items-center">
              <strong className="me-2">Landline No:</strong>
              {producer?.editor_landline}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const BestFilmView = ({ data }) => {
  return (
    <div className="return-view">
      <div className="row">
        <div className="col-6 label-column">
          <div>
            <strong>
              Name of the Writer / Critic <span className="text-danger">*</span>
              :
            </strong>
          </div>
          <div>
            <strong>
              Title of the Article<span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Language of Article<span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>Publication Date :</strong>
          </div>
          <div>
            <strong>
              Name of the Publication/Newspaper
              <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              RNI <span className="text-danger">*</span>:
            </strong>
          </div>
        </div>

        <div className="col-6 value-column">
          <div>{data.writer_name}</div>
          <div>{data.article_title}</div>
          <div>{data.article_language_id}</div>
          <div>{data.publication_date}</div>
          <div>{data.publication_name}</div>
          <div>{data.rni == 1 ? "Yes" : "No"}</div>
        </div>
      </div>
    </div>
  );
};
