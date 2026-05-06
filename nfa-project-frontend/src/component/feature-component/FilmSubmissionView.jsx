import { useMemo, useRef } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import { generatePDF } from "../../common/common-function";
import "../../styles/FilmSubmissionView.css";
import { useFetchById } from "../../hooks/useFetchById";
import { resolveViewWorkflowFromPath } from "../../common/entry-workflow";

const FieldRow = ({ label, value }) => (
  <div className="submission-field">
    <span className="submission-field-label">{label}</span>
    <span className="submission-field-value">{value || "-"}</span>
  </div>
);

const Section = ({ title, left = [], right = [] }) => (
  <section className="submission-section mb-4">
    <h5 className="submission-section-title">{title}</h5>
    <div className="row g-3">
      <div className="col-12 col-lg-6">
        <div className="submission-section-card">
          {left.map((item) => (
            <FieldRow key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </div>
      <div className="col-12 col-lg-6">
        <div className="submission-section-card">
          {right.map((item) => (
            <FieldRow key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </div>
    </div>
  </section>
);

const CardListSection = ({ title, items = [], fields = [], emptyText = "No records available." }) => (
  <section className="submission-section mb-4">
    <h5 className="submission-section-title">{title}</h5>
    {items.length === 0 ? (
      <div className="submission-section-card">
        <div className="submission-field-value">{emptyText}</div>
      </div>
    ) : (
      <div className="row g-3">
        {items.map((item, index) => (
          <div className="col-12 col-lg-6" key={item?._id || `${title}-${index}`}>
            <div className="submission-section-card">
              <div className="submission-card-title">Record {index + 1}</div>
              {fields.map((field) => (
                <FieldRow
                  key={field.label}
                  label={field.label}
                  value={
                    typeof field.format === "function"
                      ? field.format(item?.[field.key], item)
                      : item?.[field.key]
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

const formatLabel = (key = "") =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getAllRecordFields = (record = {}, omitKeys = []) =>
  Object.entries(record)
    .filter(([key, value]) => !omitKeys.includes(key) && value !== null && value !== "")
    .map(([key, value]) => ({
      label: formatLabel(key),
      value: Array.isArray(value)
        ? value.map((v) => String(v).replace(/"/g, "")).join(", ")
        : value,
    }));

const DynamicCardListSection = ({
  title,
  items = [],
  omitKeys = [],
  emptyText = "No records available.",
}) => (
  <section className="submission-section mb-4">
    <h5 className="submission-section-title">{title}</h5>
    {items.length === 0 ? (
      <div className="submission-section-card">
        <div className="submission-field-value">{emptyText}</div>
      </div>
    ) : (
      <div className="row g-3">
        {items.map((item, index) => (
          <div className="col-12 col-lg-6" key={item?._id || `${title}-${index}`}>
            <div className="submission-section-card">
              <div className="submission-card-title">Record {index + 1}</div>
              {getAllRecordFields(item, omitKeys).map((field) => (
                <FieldRow key={field.label} label={field.label} value={field.value} />
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

const pickValue = (obj, keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return undefined;
};

const hasValues = (obj = {}) =>
  Object.values(obj).some(
    (value) =>
      value !== undefined &&
      value !== null &&
      !(typeof value === "string" && value.trim() === "")
  );

const asYesNo = (value) => {
  if (value === true || value === 1 || value === "1") return "Yes";
  if (value === false || value === 0 || value === "0") return "No";
  return value;
};

const FilmSubmissionView = ({ data = {} }) => {
  const invoiceRef = useRef(null);
  const { id } = useParams();
  const { pathname } = useLocation();

  const viewWorkflow = resolveViewWorkflowFromPath(pathname);
  const endpoint = viewWorkflow.entryBy;
  const viewType = viewWorkflow.viewType;
  const { data: fetchedResponse, isLoading } = useFetchById(endpoint, id);

  const sourceData = useMemo(() => {
    const propData = data?.data ?? data;
    const apiData = fetchedResponse?.data ?? fetchedResponse ?? {};
    return hasValues(propData) ? propData : apiData;
  }, [data, fetchedResponse]);

  const hasSubmissionData = hasValues(sourceData);
  const entryId = sourceData?._id || id;

  const relatedEditors = useMemo(() => {
    const list = Array.isArray(sourceData?.editors) ? sourceData.editors : [];
    if (!entryId) return list;
    if (viewType === "best-book") {
      return list.filter((item) => item?.best_book_cinema_id === entryId);
    }
    if (viewType === "film-critic") {
      return list.filter((item) => item?.best_film_critic_id === entryId);
    }
    return list;
  }, [sourceData, entryId, viewType]);

  const relatedBooks = useMemo(() => {
    const list = Array.isArray(sourceData?.book) ? sourceData.book : [];
    return list.filter(
      (item) =>
        item &&
        hasValues(item) &&
        !(
          !item?.book_title_original &&
          !item?.book_title_english &&
          !item?.author_name
        )
    );
  }, [sourceData]);

  const handleHardCopy = async (type = "DOWNLOAD", isCharges = false) => {
    const invoiceElement = invoiceRef.current;
    if (!invoiceElement) return;

    const chargeElements = invoiceElement.querySelectorAll(".chrg");
    const hiddenElements = invoiceElement.querySelectorAll(".no-print");

    try {
      invoiceElement.classList.add("pdf-capture-mode");

      chargeElements.forEach((el) => {
        if (isCharges) {
          el.removeAttribute("data-html2canvas-ignore");
        } else {
          el.setAttribute("data-html2canvas-ignore", "true");
        }
      });

      hiddenElements.forEach((el) => {
        el.setAttribute("data-html2canvas-ignore", "true");
      });

      await generatePDF({
        element: invoiceElement,
        filename: "Invoice",
        isType: type,
        customPage: true,
      });
    } finally {
      invoiceElement.classList.remove("pdf-capture-mode");

      hiddenElements.forEach((el) => {
        el.removeAttribute("data-html2canvas-ignore");
      });
      chargeElements.forEach((el) => {
        el.removeAttribute("data-html2canvas-ignore");
      });
    }
  };

  const personalLeft = [
    {
      label: "Full Name",
      value: pickValue(sourceData, ["name", "full_name", "author_name"]),
    },
    { label: "Age", value: pickValue(sourceData, ["age"]) },
    {
      label: "(+ Country Code) - Mobile Number",
      value: pickValue(sourceData, ["phone", "mobile", "mobile_no", "mobile_number"]),
    },
    { label: "Photo", value: pickValue(sourceData, ["photo", "photo_path"]) },
    { label: "Applicant Brief Bio", value: pickValue(sourceData, ["bio"]) },
    {
      label: "Why Do You Want To Participate?",
      value: pickValue(sourceData, ["reason", "why_participate"]),
    },
    {
      label: "Describe a time you helped your team",
      value: pickValue(sourceData, ["teamwork"]),
    },
    { label: "Team rating (1-10)", value: pickValue(sourceData, ["rating"]) },
    {
      label: "(+ Country Code) - Alternate Number",
      value: pickValue(sourceData, ["altPhone", "alternate_phone"]),
    },
  ];

  const personalRight = [
    { label: "Date of Birth", value: pickValue(sourceData, ["dob", "date_of_birth"]) },
    { label: "Gender", value: pickValue(sourceData, ["gender"]) },
    { label: "Email ID", value: pickValue(sourceData, ["email"]) },
    { label: "Website Link", value: pickValue(sourceData, ["website"]) },
    { label: "Instagram", value: pickValue(sourceData, ["instagram"]) },
    { label: "Facebook", value: pickValue(sourceData, ["facebook"]) },
    { label: "LinkedIn", value: pickValue(sourceData, ["linkedin"]) },
    { label: "Twitter", value: pickValue(sourceData, ["twitter"]) },
    { label: "How Did You Find CMOT?", value: pickValue(sourceData, ["referral"]) },
  ];

  const addressLeft = [
    {
      label: "Permanent Address",
      value: pickValue(sourceData, ["permAddress", "permanent_address", "address"]),
    },
    { label: "State/UT", value: pickValue(sourceData, ["permState", "state"]) },
    { label: "State/UT of Origin", value: pickValue(sourceData, ["stateOrigin"]) },
    { label: "First Govt. ID Number", value: pickValue(sourceData, ["govId1"]) },
  ];

  const addressRight = [
    { label: "City", value: pickValue(sourceData, ["permCity", "city"]) },
    { label: "Residence Address", value: pickValue(sourceData, ["residence"]) },
    { label: "State/UT", value: pickValue(sourceData, ["resState"]) },
    { label: "City", value: pickValue(sourceData, ["resCity"]) },
    { label: "Upload First Govt. ID Proof", value: pickValue(sourceData, ["govId1Proof"]) },
    {
      label: "Upload Second Govt. ID Proof",
      value: pickValue(sourceData, ["govId2Proof"]),
    },
  ];

  const filmsLeft = [
    {
      label: "Film Craft",
      value: pickValue(sourceData, ["filmCraft", "film_craft", "film_type"]),
    },
    {
      label: "Link to Film and password",
      value: pickValue(sourceData, ["filmLink", "film_link"]),
    },
    {
      label: "Project Title",
      value: pickValue(sourceData, ["projectTitle", "film_title_english", "title"]),
    },
    { label: "Duration (minutes)", value: pickValue(sourceData, ["duration", "run_time"]) },
    {
      label: "Project Completion Date",
      value: pickValue(sourceData, ["completionDate", "date_of_completion"]),
    },
    {
      label: "Enter Filmography URL",
      value: pickValue(sourceData, ["filmography", "filmography_url"]),
    },
    { label: "Awards/Recognition", value: pickValue(sourceData, ["awards"]) },
  ];

  const filmsRight = [
    {
      label: "Link Film Password",
      value: pickValue(sourceData, ["filmPassword", "film_password"]),
    },
    { label: "Upload CV", value: pickValue(sourceData, ["cv", "cv_file"]) },
    { label: "Show Reel (link)", value: pickValue(sourceData, ["showReel", "show_reel"]) },
  ];

  const bestBookLeft = [
    { label: "Author Name", value: sourceData?.author_name },
    { label: "Author Contact", value: sourceData?.author_contact },
    { label: "Author Address", value: sourceData?.author_address },
    {
      label: "Indian Nationality",
      value: asYesNo(sourceData?.author_nationality_indian),
    },
    { label: "Author Profile", value: sourceData?.author_profile },
    { label: "Aadhaar Card", value: sourceData?.author_aadhaar_card },
  ];

  const bestBookRight = [
    { label: "Current Step", value: sourceData?.step },
    { label: "Active Step", value: sourceData?.active_step },
    { label: "Payment Status", value: sourceData?.payment_status },
    { label: "Form Status", value: sourceData?.status },
    { label: "Payment Date", value: sourceData?.payment_date },
    { label: "Amount", value: sourceData?.amount },
    { label: "Reference Number", value: sourceData?.reference_number },
    { label: "Receipt", value: sourceData?.receipt },
    { label: "Declaration One", value: asYesNo(sourceData?.declaration_one) },
    { label: "Declaration Two", value: asYesNo(sourceData?.declaration_two) },
    { label: "Declaration Three", value: asYesNo(sourceData?.declaration_three) },
    { label: "Declaration Four", value: asYesNo(sourceData?.declaration_four) },
  ];

  return (
    <div className="card-box submission-view-page">
      <div className="container py-4" ref={invoiceRef} id="invoiceBox">
        <header className="submission-header text-center mb-4">
          <img src="/images/nfa-logo.png" alt="NFA Logo" className="submission-logo" />
          <p className="submission-badge mb-1">Application Summary</p>
          <h3 className="submission-title">Creative Minds of Tomorrow</h3>
        </header>

        {!hasSubmissionData ? (
          <div className="alert alert-warning mb-4" role="alert">
            {isLoading
              ? "Loading submission details..."
              : "Submission details are not available for this entry."}
          </div>
        ) : (
          <>
            {viewType === "best-book" ? (
              <>
                <Section
                  title="1. Best Book Submission Details"
                  left={bestBookLeft}
                  right={bestBookRight}
                />
                <DynamicCardListSection
                  title="2. Book Details (All Fields)"
                  items={relatedBooks}
                  omitKeys={["__v", "client_id"]}
                  emptyText="No book records mapped to this submission."
                />
                <DynamicCardListSection
                  title="3. Publisher / Editor Details (All Fields)"
                  items={relatedEditors}
                  omitKeys={["__v", "client_id"]}
                  emptyText="No editor records mapped to this submission."
                />
              </>
            ) : (
              <>
                <Section title="1. Personal Detail" left={personalLeft} right={personalRight} />
                <Section
                  title="2. Address Identification"
                  left={addressLeft}
                  right={addressRight}
                />
                <Section title="3. Films Details" left={filmsLeft} right={filmsRight} />
              </>
            )}
          </>
        )}

        <div className="d-flex justify-content-between flex-wrap gap-2 no-print">
          <NavLink to="/dashboard" className="btn btn-outline-primary">
            Dashboard
          </NavLink>
          <button
            type="button"
            className="btn btn-success"
            onClick={() => handleHardCopy("PRINT", true)}
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilmSubmissionView;
