import { useState } from "react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import FeatureModalComponent from "../common/modal/feature-modal";
import { useQuery } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import { useAuth } from "../hooks/use-auth";
import { useEffect } from "react";
import { getRequest } from "../common/services/requestService";
const slides = [
  { image: "/images/login-01.jpg" },
  { image: "/images/login-02.jpg" },
];
const staticForms = {
  feature: [
    {
      id: 9,
      step: 7,
      active_step: 11,
      payment_status: 2,
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
      updated_at: "2025-05-28T04:53:45.000000Z",
    },
    {
      id: 15,
      step: 1,
      active_step: 1,
      payment_status: null,
      status: 1,
      client_id: 10,
      film_title_roman: "ghh",
      film_title_devnagri: "htyu",
      film_title_english: "jkjhh",
      language_id: ["11", "10", "7"],
      english_subtitle: 1,
      director_debut: 1,
      nom_reels_tapes: null,
      aspect_ratio: "2:78",
      format: 1,
      sound_system: 1,
      running_time: "344",
      color_bw: 1,
      film_synopsis:
        "Thank you for your continued support and collaboration. We truly appreciate your trust in our work and the opportunities we've had to grow together. As we move forward, we're committed to delivering even greater value, enhancing our services, and ensuring your satisfaction every step of the way. Your feedback is vital to us, and we encourage you to share any ideas or concerns. Together, we can achieve even more. Please don't hesitate to reach out if there's anything you need. We're here for you, and we're excited about what the future holds. Thank you once again for being with us.",
      censor_certificate_nom: null,
      censor_certificate_date: null,
      censor_certificate_file: null,
      title_registratin_detils: null,
      payment_date: null,
      amount: null,
      reference_number: null,
      receipt: null,
      company_reg_details: null,
      company_reg_doc: null,
      original_screenplay_name: null,
      adapted_screenplay_name: null,
      story_writer_name: null,
      work_under_public_domain: null,
      original_work_copy: null,
      dialogue: null,
      cinemetographer: null,
      editor: null,
      costume_designer: null,
      animator: null,
      vfx_supervisor: null,
      stunt_choreographer: null,
      music_director: null,
      special_effect_creator: null,
      shot_digital_video_format: null,
      production_designer: null,
      make_up_director: null,
      choreographer: null,
      return_name: null,
      return_mobile: null,
      return_address: null,
      return_fax: null,
      return_email: null,
      return_pincode: null,
      return_website: null,
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
      created_at: "2025-05-28T05:01:22.000000Z",
      updated_at: "2025-05-28T05:01:22.000000Z",
    },
  ],
  "non-feature": [
    {
      id: 7,
      step: 1,
      active_step: 2,
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
      title_registratin_detils: null,
      payment_date: null,
      amount: null,
      reference_number: null,
      receipt: null,
      company_reg_details: null,
      company_reg_doc: null,
      original_screenplay_name: null,
      adapted_screenplay_name: null,
      story_writer_name: null,
      work_under_public_domain: null,
      original_work_copy: null,
      dialogue: null,
      cinemetographer: null,
      editor: null,
      audiographer: null,
      voice_over_artist: null,
      sound_recordist: null,
      costume_designer: null,
      animator: null,
      vfx_supervisor: null,
      stunt_choreographer: null,
      music_director: null,
      special_effect_creator: null,
      shot_digital_video_format: null,
      production_designer: null,
      make_up_artist: null,
      choreographer: null,
      return_name: null,
      return_mobile: null,
      return_address: null,
      return_fax: null,
      return_email: null,
      return_pincode: null,
      return_website: null,
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
      updated_at: "2025-05-28T04:41:03.000000Z",
    },
  ],
};
export const getUserForms = async () => {
  const res = await getRequest("/film/entry-list",); // Update this endpoint based on your backend
  return res.data;
};
const DashboardPage = () => {
  const [showModal, setShowModal] = useState(false);
  const { user, logoutMutation } = useAuth();
  const navigate = useNavigate();

  // Simulate skipping fetch and using static data
  const {
    data: formCards = staticForms,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/film/entry-list"],
    queryFn: getUserForms,
    // enabled: true, // disables automatic query
    // initialData: staticForms, // sets mock data
  });
  useEffect(() => {
    console.log('dashboard', user);

    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="dashboard">
      <div className="row">
        <div className="col-lg-6 col-md-6">
          <div className="form-container scrolling-form p-5">
            <div className="top-logo d-flex justify-content-between">
              <a href="#">
                <img src="/images/nfa-logo.png" alt="NFA Logo" />
              </a>
              <a href="#">
                <img src="/images/mib.png" alt="MIB Logo" />
              </a>
            </div>

            <div className="user-details">
              <div className="mt-4">
                <div className="porfile-info">
                  <h4 className="mb-2">{user?.name}</h4>
                  <ul>
                    <li>
                      <i className="bi bi-telephone"></i> {user?.phone}
                    </li>
                    <li>
                      <i className="bi bi-envelope"></i>{user?.email}
                    </li>
                  </ul>
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-danger mx-2"
                      onClick={() => logoutMutation.mutate()}
                    >
                      LOG OUT{" "}
                    </button>
                  </div>

                </div>

                <div className="notification mt-4 col-out-div">
                  <h3>You have not created any form yet.</h3>
                  <p>Click Here to Create</p>
                  <p className="text-left">
                    <a
                      href="#"
                      className="btn btn-common-form"
                      onClick={() => setShowModal(true)}
                    >
                      {formCards
                        ? "ADD NEW PROJECT"
                        : "CREATE YOUR FIRST PROJECT"}
                    </a>
                  </p>
                </div>
              </div>

              {isLoading && <p>Loading forms...</p>}
              {isError && <p>Failed to load forms.</p>}

              <div className="row mt-4">
                {["feature", "non-feature"].map((type) =>
                  formCards?.[type]?.map((card, index) => (
                    <div
                      className="col-md-6 col-lg-12"
                      key={`${type}-${index}`}
                    >
                      <div className="card mb-3">
                        <div className="card-header">
                          <h5 className="card-title mb-0">
                            {card.film_title_english}
                          </h5>
                        </div>
                        <div className="card-body">
                          <p className="card-text mb-0">
                            <b>Type of form:</b>{" "}
                            {type === "feature" ? "Feature" : "Non-Feature"}
                          </p>
                          <p className="card-text mb-2">
                            <b>Your Step:</b> {card.active_step} step
                          </p>
                          <div>
                            <NavLink
                              to={`/${type}/${card.id}`}
                              className="text-decoration-none"
                            >
                              <i
                                className={`bi bi-${card.payment_status !== 2 ? "pencil" : "eye"
                                  }`}
                              ></i>{" "}
                              {card.payment_status !== 2 ? "Edit" : "View"}
                            </NavLink>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-md-6 p-0">

          <Swiper
            modules={[Autoplay, Navigation, Pagination, EffectFade]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            // loop={true}  
            // navigation={true}
            pagination={{ clickable: true }}
            // effect="fade"
            spaceBetween={10}
            slidesPerView={1}
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={index}>
                <img
                  src={slide.image}
                  alt={`slide-${index}`}
                  className="carousel-img"
                />
              </SwiperSlide>
            ))}
          </Swiper>

        </div>
      </div>

      <FeatureModalComponent
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default DashboardPage;
