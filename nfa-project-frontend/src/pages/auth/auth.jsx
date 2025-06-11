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
    <div className="row form-div">
      {/* Left Column: Dynamic content (login/signup) */}
      <div className="col-lg-6 col-md-6 mt-5">
        <Outlet />
      </div>

      {/* Right Column - Carousel (shared for both login/signup) */}
      <div className="col-lg-6 col-md-6 p-0">
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
                alt={`slide-${index}`}
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
