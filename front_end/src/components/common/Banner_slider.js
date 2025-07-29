import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const bannerData = [
  {
    image: "/Banners/home_banner_1.jpg",
    title: "Conquer the peak \n with experts",
    subtitle:
      "Take courses and extracurricular activities to expand knowledge.",
    buttonText: "Explore now",
    buttonLink: "#",
  },
  {
    image: "/Banners/home_banner_2.jpg",
    title: "Discover the world  in your own way",
    subtitle: "Immerse yourself in unique and memorable experiences.",
    buttonText: "Learn more",
    buttonLink: "#",
  },
  {
    image: "/Banners/home_banner_3.jpg",
    title: "Challenge yourself\nPush your limits",
    subtitle: "Adventure activities help you grow.",
    buttonText: "Sign up",
    buttonLink: "#",
  },
  {
    image: "/Banners/home_banner_4.jpg",
    title: "New journey\nNew knowledge",
    subtitle: "Learn from the best and become an expert.",
    buttonText: "View course",
    buttonLink: "#",
  },
  {
    image: "/Banners/home_banner_5.jpg",
    title: "Connect with the community\nAnd share your passion",
    subtitle: "Join events and meet like-minded people.",
    buttonText: "Join now",
    buttonLink: "#",
  },
];

const BannerSlider = () => {
  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    fade: true,
    cssEase: "ease-in-out",
  };

  const renderMultilineText = (text) =>
    text
      ? text.split("\n").map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ))
      : null;

  return (
    <div className="banner-slider fullpage-wrap">
      {bannerData.length > 0 ? (
        <Slider {...settings}>
          {bannerData.map((e, k) => (
            <div
              key={k}
              className="banner-slide"
              style={{ backgroundImage: `url(${e.image})` }}>
              <div className="overlay-gradient" />
              <div className="banner-content">
                <h1 className="banner-title animated fadeInUp">
                  {renderMultilineText(e.title)}
                </h1>
                <h2 className="banner-subtitle animated fadeInUp">
                  {renderMultilineText(e.subtitle)}
                </h2>
                <a
                  href={e.buttonLink}
                  className="btn btn-primary animated fadeInUp">
                  {e.buttonText}
                </a>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <div
          className="loading-banners"
          style={{
            height: "500px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f0f0f0",
          }}>
          Đang tải banner...
        </div>
      )}
    </div>
  );
};

export default BannerSlider;
