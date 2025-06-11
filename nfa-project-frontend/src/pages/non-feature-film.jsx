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
import { useQuery } from "@tanstack/react-query";
import { getRequestById } from "../common/services/requestService";
import OtherSection from "../component/non-feature-component/other-component";
import ViewSection from "../component/non-feature-component/view-section";
import Navbar from "../component/layouts/navbar";
const staticForms = {
  id: 7,
  step: 7,
  active_step: 7,
  payment_status: null,
  status: 1,
  client_id: 10,
  film_title_roman: "gjjhg",
  film_title_devnagri: "gg",
  film_title_english: "jhyyy",
  language_id: ["8", "6", "7"],
  english_subtitle: 1,
  director_debut: 1,
  nom_reels_tapes: "566",
  aspect_ratio: "16:9",
  format: 1,
  sound_system: 1,
  running_time: "77777",
  color_bw: 1,
  film_synopsis:
    "88hjjk g g  r rr r r  r r r r r r r r r r r r r r r r r rrrrrr     rr rrrr  rr r rr r     rg hh tyyy ugyyuuu t;lkuiuytryuuii op ppp essentially a short, plot-focused overview of the story, designed to pique interest and provide a clear understanding of the narrative. \r\nHere's a more detailed breakdown:\r\nPurpose:\r\nA synopsis is used to give a quick overview of the movie's story, helping potential viewers or industry professionals decide if they want to watch the film or read the script. \r\nContent:\r\nkk  kkk kkk kkkkkkk",
  censor_certificate_nom: "kjhgfhgh",
  censor_certificate_date: "2024-12-28",
  censor_certificate_file: null,
  title_registratin_detils: "",
  payment_date: null,
  amount: null,
  reference_number: null,
  receipt: null,
  company_reg_details: "ggffff",
  company_reg_doc: null,
  original_screenplay_name: null,
  adapted_screenplay_name: null,
  story_writer_name: null,
  work_under_public_domain: null,
  original_work_copy: null,
  dialogue: null,
  cinemetographer: "775gggggg",
  editor: "jhhggg",
  audiographer: "kjjuuuuuuuuuuuu",
  voice_over_artist: "ooo",
  sound_recordist: "jhhhh",
  costume_designer: null,
  animator: null,
  vfx_supervisor: null,
  stunt_choreographer: null,
  music_director: "uuuu",
  special_effect_creator: null,
  shot_digital_video_format: 1,
  production_designer: "hhyyyyyyyyy",
  make_up_artist: null,
  choreographer: "sssdf",
  return_name: "gggggggggggh",
  return_mobile: "8866666666",
  return_address: "j7777777777777777",
  return_fax: "",
  return_email: "kkg@gmail.com",
  return_pincode: "7666666666",
  return_website: "hggg",
  declaration_one: null,
  declaration_two: null,
  declaration_three: null,
  declaration_four: null,
  declaration_five: null,
  declaration_six: null,
  declaration_seven: null,
  declaration_eight: null,
  declaration_nine: null,
  declaration_ten: null,
  declaration_eleven: null,
  declaration_twelve: null,
  created_at: "2025-05-27T18:21:18.000000Z",
  updated_at: "2025-05-31T18:43:34.000000Z",
  producers: [
    {
      id: 61,
      client_id: 10,
      nfa_feature_id: null,
      nfa_non_feature_id: 7,
      name: "hhhhhhhhhhgg",
      email: "tfgh@gmai.com",
      contact_nom: "9999999999",
      address: "ggggyyyyyyyy",
      pincode: "787666",
      producer_self_attested_doc: null,
      indian_national: 1,
      country_of_nationality: null,
      receive_producer_award: 1,
      production_company: "jjjjj66677",
      created_at: "2025-05-31T18:34:00.000000Z",
      updated_at: "2025-05-31T18:34:00.000000Z",
      documents: [
        {
          id: 138,
          context_id: 61,
          form_type: 2,
          document_type: 4,
          website_type: 5,
          file: "invoice-ORD-2769_1748716440.pdf",
          name: "invoice-ORD-2769.pdf",
          created_by: null,
          created_at: "2025-05-31T18:34:00.000000Z",
          updated_at: "2025-05-31T18:34:00.000000Z",
        },
      ],
    },
  ],
  directors: [
    {
      id: 51,
      client_id: 10,
      nfa_feature_id: null,
      nfa_non_feature_id: 7,
      indian_national: 1,
      name: "hhhhhhhhhhgg",
      email: "john@gmail.com",
      contact_nom: "9777777777",
      address: "uuuuuuuuuuyy",
      pincode: "086666",
      director_self_attested_doc: null,
      receive_director_award: null,
      production_company: null,
      country_of_nationality: null,
      created_at: "2025-05-31T18:34:50.000000Z",
      updated_at: "2025-05-31T18:34:50.000000Z",
      documents: [
        {
          id: 139,
          context_id: 51,
          form_type: 2,
          document_type: 5,
          website_type: 5,
          file: "invoice-ORD-2769_1748716490.pdf",
          name: "invoice-ORD-2769.pdf",
          created_by: null,
          created_at: "2025-05-31T18:34:50.000000Z",
          updated_at: "2025-05-31T18:34:50.000000Z",
        },
      ],
    },
  ],
  payment_response: null,
  documents: [
    {
      id: 136,
      context_id: 7,
      form_type: 2,
      document_type: 1,
      website_type: 5,
      file: "Transaction_History_1748406906.pdf",
      name: "Transaction_History.pdf",
      created_by: null,
      created_at: "2025-05-28T04:35:06.000000Z",
      updated_at: "2025-05-28T04:35:06.000000Z",
    },
    {
      id: 137,
      context_id: 7,
      form_type: 2,
      document_type: 2,
      website_type: 5,
      file: "invoice-ORD-2931_1748716383.pdf",
      name: "invoice-ORD-2931.pdf",
      created_by: null,
      created_at: "2025-05-31T18:33:04.000000Z",
      updated_at: "2025-05-31T18:33:04.000000Z",
    },
  ],
};

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

  const { data: formData } = useQuery({
    queryKey: ["userForm", id],
    queryFn: () => getRequestById("feature", id),
    enabled: !!id,
    initialData: staticForms, // sets mock data
  });

  useEffect(() => {
    console.log("Form cards data:", formData);
    if (id && formData?.active_step !== undefined) {
      setActiveSection(+formData.active_step + 1);
      console.log("Form cards data:", formData);
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
                  data={formData}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 2 && (
                <CensorSection
                  data={formData}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 3 && (
                <CompanyRegistrationSection
                  data={formData}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 4 && (
                <ProducerDetailsSection
                  data={formData}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 5 && (
                <DirectorDetailsSection
                  data={formData}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 6 && (
                <OtherSection
                  data={formData}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 7 && (
                <ReturnSection
                  data={formData}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 8 && (
                <ViewSection
                  data={formData}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 9 && (
                <DeclarationSection
                  data={formData}
                  setActiveSection={setActiveSection}
                />
              )}
              {activeSection == 10 && (
                <PaymentSection
                  data={formData}
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
