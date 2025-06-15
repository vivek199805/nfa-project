import { useParams } from "react-router-dom";
import ActorSection from "../component/feature-component/actor-component";
import AudiographerSection from "../component/feature-component/audiographer";
import CensorSection from "../component/feature-component/censor-component";
import CompanyRegistrationSection from "../component/feature-component/company-component";
import DeclarationSection from "../component/feature-component/Declaration-component";
import DirectorDetailsSection from "../component/feature-component/director-component";
import FilmDetailsSection from "../component/feature-component/film-details-component";
import PaymentSection from "../component/feature-component/PaymentSection-component";
import ProducerDetailsSection from "../component/feature-component/producer-component";
import ReturnSection from "../component/feature-component/return-component";
import ScreenPlaySection from "../component/feature-component/screenplay-component";
import SongsFormSection from "../component/feature-component/songs-component";
import StepIndicator from "../component/StepIndicator";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRequestById } from "../common/services/requestService";
import Navbar from "../component/layouts/navbar";
const staticForms = {
  id: 9,
  step: 11,
  active_step: 10,
  payment_status: null,
  status: 1,
  client_id: 10,
  film_title_roman: "gjjhg",
  film_title_devnagri: "ffhhtt",
  film_title_english: "jhyyy",
  language_id: ["6", "5", "7"],
  english_subtitle: 1,
  director_debut: 1,
  nom_reels_tapes: "",
  aspect_ratio: "16:9",
  format: 1,
  sound_system: 1,
  running_time: "120",
  color_bw: 1,
  film_synopsis:
    "In a future where me mories can be tra ded like currency, a disillusioned m emory dealer named Kai stum bles upon fragments of a mysterious woman's past that reveal a hidden conspiracy threatening humanity’s future. As he pieces together her memories, Kai uncovers a truth that forces him to confront his own forgotten past. Racing against time, he must decide whether to protect the world as it is or risk everything to reshape it. Echoes of Tomorrow is a gripping sci-fi thriller that explores identity, sacrifice, and the power of memory in a world where nothing is truly forgotten.",
  censor_certificate_nom: "778ggg",
  censor_certificate_date: "2024-12-31",
  censor_certificate_file: null,
  title_registratin_detils: "",
  payment_date: null,
  amount: null,
  reference_number: null,
  receipt: null,
  company_reg_details: "rr45",
  company_reg_doc: null,
  original_screenplay_name: "jjjjjk",
  adapted_screenplay_name: "jjjjj",
  story_writer_name: "llllllllllllllll",
  work_under_public_domain: 1,
  original_work_copy: null,
  dialogue: "",
  cinemetographer: "",
  editor: "",
  costume_designer: "",
  animator: "",
  vfx_supervisor: null,
  stunt_choreographer: "",
  music_director: "",
  special_effect_creator: "",
  shot_digital_video_format: 0,
  production_designer: "",
  make_up_director: "",
  choreographer: "",
  return_name: "gggggggggggh",
  return_mobile: "7888888888",
  return_address: "gggggggggggggggg",
  return_fax: "",
  return_email: "kkg@gmail.com",
  return_pincode: "666666",
  return_website: "",
  declaration_one: 1,
  declaration_two: 1,
  declaration_three: 1,
  declaration_four: 1,
  declaration_five: 1,
  declaration_six: 1,
  declaration_seven: 1,
  declaration_eight: 1,
  declaration_nine: 1,
  declaration_ten: 1,
  declaration_eleven: 1,
  declaration_twelve: 1,
  created_at: "2025-05-19T17:53:49.000000Z",
  updated_at: "2025-05-25T06:26:24.000000Z",
  producers: [
    {
      id: 56,
      client_id: 10,
      nfa_feature_id: 9,
      nfa_non_feature_id: null,
      name: "hhhhhhhhhhgg",
      email: "john@gmail.com",
      contact_nom: "8966666666",
      address: "ugfgjftyy",
      pincode: "997778",
      producer_self_attested_doc: null,
      indian_national: 1,
      country_of_nationality: null,
      receive_producer_award: 0,
      production_company: "ghjj",
      created_at: "2025-05-24T06:33:57.000000Z",
      updated_at: "2025-05-24T06:33:57.000000Z",
      documents: [
        {
          id: 119,
          context_id: 56,
          form_type: 1,
          document_type: 4,
          website_type: 5,
          file: "Angular_assignment_1748068437.png",
          name: "Angular_assignment.png",
          created_by: null,
          created_at: "2025-05-24T06:33:57.000000Z",
          updated_at: "2025-05-24T06:33:57.000000Z",
        },
      ],
    },
  ],
  directors: [
    {
      id: 47,
      client_id: 10,
      nfa_feature_id: 9,
      nfa_non_feature_id: null,
      indian_national: 1,
      name: "Vivek Kumar ",
      email: "john.doe@example.com",
      contact_nom: "8555555555",
      address: "trgggggggggggggg",
      pincode: "777765",
      director_self_attested_doc: null,
      receive_director_award: null,
      production_company: null,
      country_of_nationality: null,
      created_at: "2025-05-24T18:05:18.000000Z",
      updated_at: "2025-05-24T18:05:18.000000Z",
      documents: [
        {
          id: 120,
          context_id: 47,
          form_type: 1,
          document_type: 5,
          website_type: 5,
          file: "invoice-ORD-2769_1748109918.pdf",
          name: "invoice-ORD-2769.pdf",
          created_by: null,
          created_at: "2025-05-24T18:05:18.000000Z",
          updated_at: "2025-05-24T18:05:18.000000Z",
        },
      ],
    },
  ],
  songs: [
    {
      id: 29,
      nfa_feature_id: 9,
      song_title: "jhgjjj",
      music_director: "uuuu",
      music_director_bkgd_music: "ityui",
      lyricist: "uiii",
      playback_singer_male: "uuui",
      playback_singer_female: "kkkkkkkkkoi",
      created_at: "2025-05-25T02:05:20.000000Z",
      updated_at: "2025-05-25T02:05:20.000000Z",
    },
  ],
  actors: [
    {
      id: 29,
      nfa_feature_id: 9,
      actor_category_id: 1,
      name: "hhhhhhhhhhgg",
      screen_name: "gggggggggggg",
      if_voice_dubbed: 1,
      created_at: "2025-05-24T18:49:32.000000Z",
      updated_at: "2025-05-24T18:49:32.000000Z",
    },
  ],
  audiographer: [
    {
      id: 32,
      nfa_feature_id: 9,
      production_sound_recordist: "ffffffddd",
      sound_designer: "hhh",
      re_recordist_filnal: "tggg",
      created_at: "2025-05-25T02:21:32.000000Z",
      updated_at: "2025-05-25T02:21:32.000000Z",
    },
  ],
  payment_response: null,
  documents: [
    {
      id: 104,
      context_id: 9,
      form_type: 1,
      document_type: 1,
      website_type: 5,
      file: "Angular_assignment_1747679168.png",
      name: "Angular_assignment.png",
      created_by: null,
      created_at: "2025-05-19T18:26:08.000000Z",
      updated_at: "2025-05-19T18:26:08.000000Z",
    },
  ],
};
const steps = [
  "Film Details",
  "Censor",
  "Company Registration",
  "Producer(s) Details",
  "Director(s) Details",
  "Actors",
  "Songs",
  "Audiographer",
  "ScreenPlay",
  "Return",
  "Declaration",
  "Payment",
];
const FeatureFilmPage = () => {
  const [activeSection, setActiveSection] = useState(1);
  const { id } = useParams();
  const { data: formData } = useQuery({
    queryKey: ["film/feature-entry-by", id],
    queryFn: () => getRequestById("film/feature-entry-by", id),
    enabled: !!id,
    // initialData: staticForms, // sets mock data
    refetchOnMount: true,
    staleTime: 0,
  });

  useEffect(() => {
    console.log("Form cards data:", formData);
    if (id && formData?.data?.active_step !== undefined) {
      setActiveSection(+formData?.data?.active_step + 1);
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
              />
              <div className="form-box">
                <h2 className="form-title">{steps[activeSection - 1]}</h2>
                <h3 className="form-subtitle">
                  Feature Film Registration | Step {activeSection}
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
                  <ActorSection
                    data={formData}
                    setActiveSection={setActiveSection}
                  />
                )}
                {activeSection == 7 && (
                  <SongsFormSection
                    data={formData}
                    setActiveSection={setActiveSection}
                  />
                )}
                {activeSection == 8 && (
                  <AudiographerSection
                    data={formData}
                    setActiveSection={setActiveSection}
                  />
                )}
                {activeSection == 9 && (
                  <ScreenPlaySection
                    data={formData}
                    setActiveSection={setActiveSection}
                  />
                )}
                {activeSection == 10 && (
                  <ReturnSection
                    data={formData}
                    setActiveSection={setActiveSection}
                  />
                )}
                {activeSection == 11 && (
                  <DeclarationSection
                    data={formData}
                    setActiveSection={setActiveSection}
                  />
                )}
                {activeSection == 12 && (
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

export default FeatureFilmPage;
