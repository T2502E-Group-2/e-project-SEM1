import { Container } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";
import Activity from "../shared/activity";
import Slider from "react-slick";
import BannerSlider from "../common/Banner_slider";

const Home = () => {
  const [featuredActivities, setFeaturedActivities] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  // get data featured activities
  const get_featured = async () => {
    const url = URL.FEATURED_ACTIVITIES;
    const rs = await axios_instance.get(url);
    const data = rs.data.data;
    setFeaturedActivities(data);
  };
  // get banners
  const [banners, setBanners] = useState([]);

  const get_banners = async () => {
    const url = URL.GET_BANNERS;
    const rs = await axios_instance.get(url);
    const data = rs.data.data;
    setBanners(data);
  };

  useEffect(() => {
    get_featured();
    get_latest();
    get_banners(); // gọi thêm
  }, []);

  // get data latest activities
  const get_latest = async () => {
    const url = URL.LATEST_ACTIVITIES;
    const rs = await axios_instance.get(url);
    const data = rs.data.data;
    setLatestActivities(data);
  };
  useEffect(() => {
    get_featured();
    get_latest();
  }, []);

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    responsive: [
      // Display settings for different screen sizes
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  //*****/
  return (
    <>
      <BannerSlider banners={banners} />
      <Container fluid className="topic-card">
        {/*Featured Activities */}
        <h2 className="mt-5 topic-card-text">Featured Activities</h2>
        <Slider {...sliderSettings}>
          {featuredActivities.map((e, k) => {
            return (
              <div className="slider-item" key={k}>
                <Activity activity={e} />
              </div>
            );
          })}
        </Slider>

        {/*Latest Activities */}
        <h2 className="mt-5 topic-card-text">Latest Activities</h2>
        <Slider {...sliderSettings}>
          {latestActivities.map((e, k) => {
            return (
              <div className="slider-item" key={k}>
                <Activity activity={e} />
              </div>
            );
          })}
        </Slider>
      </Container>
    </>
  );
};

export default Home;
