import { useState } from "react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import FeatureModalComponent from "../features/components/modals/FeatureModal";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import { useAuth } from "../hooks/use-auth";
import { useEffect } from "react";
import { useDashboardEntriesQuery } from "../hooks/queries/useDashboardQueries";
import { entryWorkflowTypes, getDashboardEntryPath, getEntryWorkflowMeta, } from "../common/entry-workflow";

const slides = [
  { image: "/images/login-01.jpg" },
  { image: "/images/login-02.jpg" },
];

const DashboardPage = () => {
  const [showModal, setShowModal] = useState(false);
  const { user, logoutMutation } = useAuth();
  const navigate = useNavigate();

  const { data: formCards, isLoading, isError } = useDashboardEntriesQuery();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) return <p>Loading user...</p>;

  return (
    <div className="dashboard">
      <div className="dashboard-layout">
        <section className="dashboard-left">
          <div className="form-container scrolling-form p-5">
            <div className="top-logo d-flex justify-content-between">
              <div>
                <img src="/images/nfa-logo.png" alt="NFA Logo" />
              </div>
              <div>
                <img src="/images/mib.png" alt="MIB Logo" />
              </div>
            </div>

            <div className="user-details">
              <div className="mt-4">
                <div className="porfile-info dashboard-profile-card">
                  <div className="dashboard-profile-main">
                    <h4 className="mb-2">{user?.name}</h4>
                    <ul>
                      <li>
                        <i className="bi bi-telephone"></i>
                        <span>{user?.phone}</span>
                      </li>
                      <li>
                        <i className="bi bi-envelope"></i>
                        <span>{user?.email}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="dashboard-actions">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => logoutMutation.mutate()}
                    >
                      LOG OUT
                    </button>
                  </div>
                </div>

                {(!formCards ||
                  Object.keys(formCards).every(
                    (key) => !formCards[key] || formCards[key].length === 0,
                  )) && (
                    <div className="notification mt-4 col-out-div">
                      <h3>You have not created any form yet.</h3>
                      <p>Click Here to Create</p>
                      <p className="text-left">
                        <button
                          type="button"
                          className="btn btn-common-form"
                          onClick={() => setShowModal(true)}
                        >
                          CREATE YOUR FIRST PROJECT
                        </button>
                      </p>
                    </div>
                  )}

                {formCards &&
                  Object.keys(formCards).some(
                    (key) =>
                      Array.isArray(formCards[key]) &&
                      formCards[key].length > 0,
                  ) && (
                    <div className="mt-3 dashboard-actions">
                      <button
                        type="button"
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

              <div className="row mt-4 g-3">
                {entryWorkflowTypes.map(
                  (type) =>
                    formCards?.[type]?.map((card, index) => (
                      <div
                        className="col-12 col-md-6 col-xl-12"
                        key={`${type}-${index}`}
                      >
                        <div className="card h-100">
                          <div className="card-header">
                            <h5 className="card-title mb-0">
                              {card.film_title_english || card.author_name}
                            </h5>
                          </div>
                          <div className="card-body dashboard-card-content">
                            <div className="dashboard-card-meta">
                              <p className="card-text mb-0">
                                <b>Type of form:</b>{" "}
                                {getEntryWorkflowMeta(type)?.label || type}
                              </p>
                              <p className="card-text mb-2">
                                <b>Your Step:</b> {card.active_step} step
                              </p>
                              <div>
                                <NavLink
                                  to={getDashboardEntryPath(
                                    type,
                                    card.id,
                                    card.payment_status == 2,
                                  )}
                                  className="text-decoration-none"
                                >
                                  <i
                                    className={`bi bi-${card.payment_status != 2
                                      ? "pencil"
                                      : "eye"
                                      }`}
                                  ></i>{" "}
                                  {card.payment_status != 2 ? "Edit" : "View"}
                                </NavLink>
                              </div>
                            </div>
                            <div className="dashboard-card-status">
                              <p className="card-text mb-0">
                                <b>Payment:</b>{" "}
                                {card.payment_status != 2 ? "Unpaid" : "Paid"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )),
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className="dashboard-right">
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
                  alt=""
                  className="carousel-img"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </aside>
      </div>

      {user?.usertype == 1 ? (
        <FeatureModalComponent
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      ) : (
        <FeatureModalComponent
          title="Publisher"
          buttonLabel={{
            label1: "Best Book on Cinema Entry Form",
            label2: "Best Critic on Cinema Entry Form",
          }}
          buttonValue={{
            value1: "best-book",
            value2: "film-critic",
          }}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
