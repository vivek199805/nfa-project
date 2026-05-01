// src/pages/auth/AuthPage.jsx
import { Outlet } from "react-router-dom";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const slides = [
  { image: "/images/login-01.jpg" },
  { image: "/images/login-02.jpg" },
];

const AuthPage = () => {
  return (
    <div className="row form-div auth-layout">
      <div className="col-lg-6 auth-main-pane mt-5">
        <Outlet />
      </div>

      <div className="col-lg-6 auth-carousel-pane d-none d-lg-flex p-0">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, EffectFade]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          // navigation={true}
          pagination={{ clickable: true }}
          effect="fade"
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
      </div>
    </div>
  );
};

export default AuthPage;
