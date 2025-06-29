import { useEffect, useState } from "react";
import "../../styles/accordion.css";
import { ChevronDown, Pencil } from "lucide-react";
import { useParams } from "react-router-dom";
import { useFetchById } from "../../hooks/useFetchById";

const ViewSection = ({ setActiveSection }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const { id } = useParams();

  const steps = [
    "Best Film Critic",
    "Critic",
    "Publisher of the Newspaper Journel",
  ];

  const { data: formData } = useFetchById("film/non-feature-entry-by", id);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    // Optional data initialization if needed
  }, [formData]);

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

      <div className="d-flex justify-content-between mt-4">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setActiveSection(7)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Prev
        </button>

        <button
          type="submit"
          className="btn btn-primary"
        //   onClick={}
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
      {data?.producers.map((producer, index) => (
        <div className="card p-3 mb-3" key={index}>
          <div className="fw-semibold mb-2">({index + 1}) Publisher Details</div>
          <div className="row">
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Nationality:</strong>{" "}
              {producer?.nationality == 1 ? "Yes" : "No"}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Name:</strong> {producer.name}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Mobile:</strong> {producer.contact_nom}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Email:</strong> {producer.email}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Id Proof:</strong>{" "}
              {producer.idProof ? producer.idProof : "Not Provided"}
            </div>
            <div className="col-md-4 col-sm-6 mb-2 d-flex align-items-center">
              <strong className="me-2">Producer - Award Recipient:</strong>
              <input
                type="checkbox"
                checked={producer.receive_producer_award}
                readOnly
              />
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
