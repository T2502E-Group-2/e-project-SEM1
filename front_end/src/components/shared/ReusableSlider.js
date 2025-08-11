import React, { useEffect, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// --- START: CUSTOM HOOK FOR ANIMATION ---
const useAnimateOnScroll = (refs) => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains("topic-card-text")) {
            entry.target.classList.add("animate-in");
          } else {
            const sliderItems = entry.target.querySelectorAll(".slider-item");
            sliderItems.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add("animate-in");
              }, index * 100);
            });
          }
        }
      });
    }, observerOptions);

    refs.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [refs]);
};
// --- END: CUSTOM HOOK FOR ANIMATION ---
const ReusableSlider = ({ title, data, renderItem, settings }) => {
  const sliderRef = useRef(null);
  const titleRef = useRef(null);
  useAnimateOnScroll([titleRef, sliderRef]);

  // --- START: DEFAULT SETTINGS ---
  const defaultSettings = {
    className: "center-slider",
    centerMode: true,
    dots: true,
    arrows: true,
    infinite: true,
    speed: 200,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    // autoplaySpeed: 3000,
    lazyLoad: true,
    cssEase: "linear",
    responsiveBaseHeight: 600,
    responsive: [
      { breakpoint: 1400, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 992, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };
  // --- END: DEFAULT SETTINGS ---
  return (
    <div className="my-8">
      <h2 ref={titleRef} className="mt-4 topic-card-text">
        {title}
      </h2>
      <div ref={sliderRef} className="mt-2">
        <Slider {...defaultSettings}>
          {data.map((item, index) => (
            <div className="slider-item" key={index}>
              {renderItem(item)}
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default ReusableSlider;
