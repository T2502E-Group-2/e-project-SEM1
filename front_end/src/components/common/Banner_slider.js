import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const bannerData = [
  {
    image: "/Banners/home_banner_1.jpg",
    title: "Wild nature\nsafe adventure",
    subtitle:
      "Take courses and extracurricular activities to expand knowledge.\nVeniam, facilis.",
    buttonText: "More info",
    buttonLink: "#",
  },
  {
    image: "/Banners/home_banner_2.jpg",
    title: "It's time to\nstart your adventures",
    subtitle:
      "Immerse yourself in unique and memorable experiences.\nLorem ipsum dolor sit amet, consectetur adipisicing elit.",
    buttonText: "More info",
    buttonLink: "#",
  },
  {
    image: "/Banners/home_banner_3.jpg",
    title: "Challenge yourself\nPush your limits",
    subtitle: "Adventure activities help you grow.\nVeniam, facilis.",
    buttonText: "More info",
    buttonLink: "#",
  },
  {
    image: "/Banners/home_banner_4.jpg",
    title: "New journey\nNew knowledge",
    subtitle:
      "Learn from the best and become an expert.\nLorem ipsum dolor sit amet, consectetur adipisicing elit.",
    buttonText: "More info",
    buttonLink: "#",
  },
  {
    image: "/Banners/home_banner_5.jpg",
    title: "Connect with the community\nAnd share your passion",
    subtitle: "Join events and meet like-minded people.\nVeniam, facilis.",
    buttonText: "More info",
    buttonLink: "#",
  },
  {
    image: "/Banners/home_banner_6.jpg",
    title: "Explore the unknown\nDiscover new horizons",
    subtitle:
      "Every adventure brings new discoveries.\nLorem ipsum dolor sit amet, consectetur adipisicing elit.",
    buttonText: "More info",
    buttonLink: "#",
  },
  {
    image: "/Banners/home_banner_7.jpg",
    title: "Mountain peaks await\nConquer your fears",
    subtitle: "Rise above challenges and reach new heights.\nVeniam, facilis.",
    buttonText: "More info",
    buttonLink: "#",
  },
];

const BannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    fade: true,
    cssEase: "ease-in-out",
    afterChange: (current) => setCurrentSlide(current),
  };

  const renderMultilineText = (text) =>
    text
      ? text.split("\n").map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < text.split("\n").length - 1 && <br />}
          </React.Fragment>
        ))
      : null;

  return (
    <div className="banner-slider">
      {bannerData.length > 0 ? (
        <Slider {...settings}>
          {bannerData.map((slide, index) => (
            <div
              key={index}
              className="banner-slide"
              style={{ backgroundImage: `url(${slide.image})` }}>
              <div className="gradient dark"></div>
              <div className="container text">
                <h1 className="white flex-animation">
                  {renderMultilineText(slide.title)}
                </h1>
                <h2 className="white flex-animation">
                  {renderMultilineText(slide.subtitle)}
                </h2>
                <a
                  href={slide.buttonLink}
                  className="shadow btn-alt small activetwo margin-bottom-null flex-animation"
                  tabIndex={currentSlide === index ? 0 : -1}>
                  {slide.buttonText}
                </a>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <div className="loading-banners">Đang tải banner...</div>
      )}
    </div>
  );
};

export default BannerSlider;
