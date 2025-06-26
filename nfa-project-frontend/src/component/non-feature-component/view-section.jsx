import { useEffect, useState } from "react";
import "../../styles/accordion.css";
import { ChevronDown, Pencil } from "lucide-react";
import { useParams } from "react-router-dom";
import { useFetchById } from "../../hooks/useFetchById";

const ViewSection = ({ setActiveSection, filmType }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const { id } = useParams();

  const steps = [
    "General",
    "Censor",
    "Company Registration",
    "Producer(s) Details",
    "Director(s) Details",
    "Other",
    "Return",
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
            {step === "Return" ? (
              <ReturnView data={formData?.data} />
            ) : step === "General" ? (
              <GeneralView data={formData?.data} />
            ) : step === "Censor" ? (
              <CensorView data={formData?.data} />
            ) : step === "Company Registration" ? (
              <CompanyRegistrationView data={formData?.data} />
            ) : step === "Producer(s) Details" ? (
              <ProducerView data={formData?.data} />
            ) : step === "Director(s) Details" ? (
              <DirectorView data={formData?.data} />
            ) : step === "Other" ? (
              <OtherView data={formData?.data} />
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
          onClick={() => setActiveSection(9)}
        >
          Next <i className="bi bi-arrow-right ms-2"></i>
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

const GeneralView = ({ data }) => {
  return (
    <div className="return-view">
      <div className="row">
        <div className="col-6 label-column">
          <div>
            <strong>
              Film Title (Roman Script)<span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Film Title (Devnagri)<span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Film Title (English translation of the film title){" "}
              <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Please mention Language, if the film has no dialogues{" "}
              <span className="text-danger">*</span> :
            </strong>
          </div>
          <div>
            <strong>
              English Subtitle <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Director`s Debut <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>No. Reels/Tapes :</strong>
          </div>
          <div>
            <strong>
              Aspect Ratio <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Format <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Sound System <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Film Length in Minutes(As certified in CBFC certificate){" "}
              <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Color/Black & White <span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Film synopsis (100-150 words){" "}
              <span className="text-danger">*</span>:
            </strong>
          </div>
        </div>

        <div className="col-6 value-column">
          <div>{data.film_title_roman}</div>
          <div>{data.film_title_devnagri}</div>
          <div>{data.film_title_english}</div>
          <div>{data?.website ?? "NA"}</div>
          <div>{data.english_subtitle == 1 ? "Yes" : "No"}</div>
          <div>{data?.director_debut == 1 ? "Yes" : "No"}</div>
          <div>{data?.pinCode ?? "NA"}</div>
          <div>{data.aspect_ratio}</div>
          <div>
            {data?.format == 1 ? "35mm" : data?.format == 2 ? "DCP" : "Blu Ray"}
          </div>
          <div>
            {data?.sound_system == 1
              ? "Optional Mono"
              : data?.sound_system == 2
                ? "Dolby"
                : data?.sound_system == 3
                  ? "DTS"
                  : "Other"}
          </div>
          <div>{data.running_time}</div>
          <div>{data.color_bw == 1 ? "Color" : "Black and White"}</div>
          <div>{data.film_synopsis}</div>
        </div>
      </div>
    </div>
  );
};
const CensorView = ({ data }) => {
  return (
    <div className="return-view">
      <div className="row">
        <div className="col-6 label-column">
          <div>
            <strong>
              Censor Certificate Number<span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Censor Certification Date<span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Censor Certificate File<span className="text-danger">*</span>:
            </strong>
          </div>
        </div>

        <div className="col-6 value-column">
          <div>{data.censor_certificate_nom}</div>
          <div>{data.censor_certificate_date}</div>
          <div>
            {data.censor_certificate_file ? (
              <>
                <a
                  href={`${import.meta.env.VITE_API_URL}/${data.censor_certificate_file}`}
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

const CompanyRegistrationView = ({ data }) => {
  return (
    <div className="return-view">
      <div className="row">
        <div className="col-6 label-column">
          <div>
            <strong>
              Company Registration Details<span className="text-danger">*</span>
              :
            </strong>
          </div>
          <div>
            <strong>
              Company Registration File<span className="text-danger">*</span>:
            </strong>
          </div>
        </div>

        <div className="col-6 value-column">
          <div>{data.company_reg_details}</div>
          <div>{data.company_reg_doc}</div>
        </div>
      </div>
    </div>
  );
};

const ProducerView = ({ data }) => {
  return (
    <div className="producer-view">
      {data?.producers.map((producer, index) => (
        <div className="card p-3 mb-3" key={index}>
          <div className="fw-semibold mb-2">({index + 1}) Producer Details</div>
          <div className="row">
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Nationality:</strong> {producer?.nationality == 1 ? 'Yes' : 'No'}
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

const DirectorView = ({ data }) => {
  return (
    <div className="producer-view">
      {data?.directors.map((director, index) => (
        <div className="card p-3 mb-3" key={index}>
          <div className="fw-semibold mb-2">({index + 1}) Director Details</div>
          <div className="row">
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Nationality:</strong> {director?.nationality == 1 ? 'Yes' : 'No'}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Name:</strong> {director.name}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Mobile:</strong> {director.contact_nom}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Email:</strong> {director.email}
            </div>
            <div className="col-md-4 col-sm-6 mb-2">
              <strong>Id Proof:</strong>{" "}
              {director.idProof ? director.idProof : "Not Provided"}
            </div>
            <div className="col-md-4 col-sm-6 mb-2 d-flex align-items-center">
              <strong className="me-2">director - Award Recipient:</strong>
              <input
                type="checkbox"
                checked={director.receive_director_award}
                readOnly
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const OtherView = ({ data }) => {
  return (
    <div className="return-view">
      <div className="row">
        <div className="col-6 label-column">
          <div>
            <strong>Cinemetographers :</strong>
          </div>
          <div>
            <strong>Editor :</strong>
          </div>
          <div>
            <strong>
              Audiographer(Re-recordist of the final mixed track) :
            </strong>
          </div>
          <div>
            <strong>
              Music Directors (Please state the musical score is original) :
            </strong>
          </div>
          <div>
            <strong>
              Wheather the film was on a shot digital/video format :
            </strong>
          </div>
          <div>
            <strong>Production Designer :</strong>
          </div>
          <div>
            <strong>Choreographers :</strong>
          </div>
          <div>
            <strong>Narrator/Voice Over artist :</strong>
          </div>
          <div>
            <strong>On Location Sound Recordist :</strong>
          </div>
        </div>

        <div className="col-6 value-column">
          <div>{data.cinemetographer}</div>
          <div>{data.editor}</div>
          <div>{data.audiographer}</div>
          <div>{data.music_director}</div>
          <div>{data.shot_digital_video_format == 1 ? "Yes" : "No"}</div>
          <div>{data.production_designer}</div>
          <div>{data.choreographer}</div>
          <div>{data.voice_over_artist}</div>
          <div>{data.sound_recordist}</div>
        </div>
      </div>
    </div>
  );
};

const ReturnView = ({ data }) => {
  return (
    <div className="return-view">
      <div className="row">
        <div className="col-6 label-column">
          <div>
            <strong>
              Name<span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Phone Number<span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Email<span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>Website:</strong>
          </div>
          <div>
            <strong>
              Address<span className="text-danger">*</span>:
            </strong>
          </div>
          <div>
            <strong>
              Pin Code<span className="text-danger">*</span>:
            </strong>
          </div>
        </div>

        <div className="col-6 value-column">
          <div>{data.return_name}</div>
          <div>{data.return_mobile}</div>
          <div>{data.return_email}</div>
          <div>{data.return_website}</div>
          <div>{data.return_address}</div>
          <div>{data.return_pincode}</div>
        </div>
      </div>
    </div>
  );
};
