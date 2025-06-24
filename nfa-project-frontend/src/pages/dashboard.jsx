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

const getUserForms = async () => {
  const res = await getRequest("/film/entry-list",); // Update this endpoint based on your backend
  return res.data;
};
const DashboardPage = () => {
  const [showModal, setShowModal] = useState(false);
  const { user, logoutMutation } = useAuth();
  const navigate = useNavigate();

  // Simulate skipping fetch and using static data
  const {
    data: formCards,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/film/entry-list"],
    queryFn: getUserForms,
    // enabled: true, // disables automatic query
    // initialData: staticForms, // sets mock data
    refetchOnMount: true,
    staleTime: 0,
  });
  useEffect(() => {
    console.log("user", user);

    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) return <p>Loading user...</p>;

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
                      LOG OUT
                    </button>
                  </div>
                </div>

                {/* Show notification only if there are no forms */}
                {(!formCards ||
                  (!formCards.feature?.length && !formCards["non-feature"]?.length)) && (
                    <div className="notification mt-4 col-out-div">
                      <h3>You have not created any form yet.</h3>
                      <p>Click Here to Create</p>
                      <p className="text-left">
                        <a
                          href="#"
                          className="btn btn-common-form"
                          onClick={() => setShowModal(true)}
                        >
                          CREATE YOUR FIRST PROJECT
                        </a>
                      </p>
                    </div>
                  )}
                {/* Add button to create new project if forms exist */}
                {(formCards?.feature?.length > 0 ||
                  formCards?.["non-feature"]?.length > 0) && (
                    <div className="mt-3">
                      <button
                        className="btn btn-common-form"
                        onClick={() => setShowModal(true)}
                      >
                        ADD NEW PROJECT
                      </button>
                    </div>
                  )}
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
                          <div className="d-flex">
                            <div>
                              <p className="card-text mb-0">
                                <b>Type of form:</b>{" "}
                                {type === "feature" ? "Feature" : "Non-Feature"}
                              </p>
                              <p className="card-text mb-2">
                                <b>Your Step:</b> {card.active_step} step
                              </p>
                              <div>
                                <NavLink
                                  to={
                                    card.payment_status != 2
                                      ? `/${type}/${card.id}`
                                      : `/${type}/view/${card.id}`
                                  }
                                  className="text-decoration-none"
                                >
                                  <i
                                    className={`bi bi-${card.payment_status != 2 ? "pencil" : "eye"
                                      }`}
                                  ></i>{" "}
                                  {card.payment_status != 2 ? "Edit" : "View"}
                                </NavLink>
                              </div>
                            </div>
                            <div className="m-auto">
                              <p className="card-text mb-2">
                                <b>Payment:</b>{" "}
                                {card.payment_status != 2 ? "Unpaid" : "Paid"}
                              </p>
                            </div>
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
            pagination={{ clickable: true }}
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
