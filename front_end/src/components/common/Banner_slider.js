import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const bannerData = [
  {
    image: "../../../../public/Banners/banner_1.jp",
    title: "Chinh phục đỉnh cao\nVới chuyên gia",
    subtitle:
      "Tham gia các khóa học và hoạt động ngoại khóa để mở rộng kiến thức.",
    buttonText: "Khám phá ngay",
    buttonLink: "#",
  },
  {
    image: "../Banners/banner_2.jpg",
    title: "Khám phá thế giới\nTheo cách riêng của bạn",
    subtitle: "Đắm mình vào những trải nghiệm độc đáo và đáng nhớ.",
    buttonText: "Tìm hiểu thêm",
    buttonLink: "#",
  },
  {
    image: "/Banners/banner_3.jpg",
    title: "Thách thức bản thân\nVượt qua giới hạn",
    subtitle: "Các hoạt động mạo hiểm giúp bạn phát triển bản thân.",
    buttonText: "Đăng ký",
    buttonLink: "#",
  },
  {
    image: "/Banners/banner_4.jpg",
    title: "Hành trình mới\nKiến thức mới",
    subtitle: "Học hỏi từ những người giỏi nhất và trở thành chuyên gia.",
    buttonText: "Xem khóa học",
    buttonLink: "#",
  },
  {
    image: "/Banners/banner_5.jpg",
    title: "Kết nối cộng đồng\nVà chia sẻ đam mê",
    subtitle: "Tham gia các sự kiện và gặp gỡ những người cùng sở thích.",
    buttonText: "Tham gia",
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
