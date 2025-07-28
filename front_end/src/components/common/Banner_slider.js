import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios_instance from "../../util/axios_instance"; // Import axios_instance
import URL from "../../util/url"; // Import URL

const BannerSlider = () => {
  const [bannerData, setBannerData] = useState([]); // Sử dụng state để lưu dữ liệu banner

  // Hàm để lấy dữ liệu banner từ API
  const fetchBanners = async () => {
    try {
      const response = await axios_instance.get(URL.GET_BANNERS);
      if (response.data.status) {
        setBannerData(response.data.data);
      } else {
        console.error("Failed to fetch banners:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  useEffect(() => {
    fetchBanners(); // Gọi hàm fetchBanners khi component mount
  }, []); // [] đảm bảo chỉ chạy một lần khi component được render lần đầu

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

  // Hàm hỗ trợ chuyển \n thành <br />
  const renderMultilineText = (text) =>
    text
      ? text.split("\n").map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ))
      : null; // Xử lý trường hợp text là null hoặc undefined

  return (
    <div className="banner-slider fullpage-wrap">
      {bannerData.length > 0 ? ( // Chỉ render Slider khi có dữ liệu
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
          Loading banners...
        </div>
      )}
    </div>
  );
};

export default BannerSlider;
