import { Container } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";
import Activity from "../shared/Activity";
import Slider from "react-slick";
import BannerSlider from "../common/Banner_slider";

const Home = () => {
  const [featuredActivities, setFeaturedActivities] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  const featuredRef = useRef(null);
  const latestRef = useRef(null);
  const featuredTitleRef = useRef(null);
  const latestTitleRef = useRef(null);
  // get data featured activities
  const get_featured = async () => {
    const url = URL.FEATURED_ACTIVITIES;
    const rs = await axios_instance.get(url);
    const data = rs.data.data;
    setFeaturedActivities(data);
  };

  // get data latest activities
  const get_latest = async () => {
    const url = URL.LATEST_ACTIVITIES;
    const rs = await axios_instance.get(url);
    const data = rs.data.data;
    setLatestActivities(data);
  };
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
            // Animate slider items with staggered delay
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

    // Observe elements
    if (featuredTitleRef.current) observer.observe(featuredTitleRef.current);
    if (latestTitleRef.current) observer.observe(latestTitleRef.current);
    if (featuredRef.current) observer.observe(featuredRef.current);
    if (latestRef.current) observer.observe(latestRef.current);

    return () => observer.disconnect();
  }, [featuredActivities, latestActivities]);
  //*****/

  useEffect(() => {
    get_featured();
    get_latest();
  }, []);

  // Slider settings
  const sliderSettings = {
    className: "center-slider",
    centerMode: true,
    dots: true,
    arrows: true,
    infinite: true,
    speed: 200,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    responsive: [
      {
        breakpoint: 1400, // Tablets
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 992, // Mobile phones
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
      <BannerSlider />
      <Container fluid className="topic-card">
        {/*Featured Activities */}
        <h2 ref={featuredTitleRef} className="mt-4 topic-card-text">
          Featured Activities
        </h2>
        <div ref={featuredRef}>
          <Slider {...sliderSettings}>
            {featuredActivities.map((e, k) => {
              return (
                <div className="slider-item mt-2" key={k}>
                  <Activity activity={e} />
                </div>
              );
            })}
          </Slider>
        </div>

        {/*Latest Activities */}
        <h2 ref={latestTitleRef} className="mt-4 topic-card-text">
          Latest Activities
        </h2>
        <div ref={latestRef}>
          <Slider {...sliderSettings}>
            {latestActivities.map((e, k) => {
              return (
                <div className="slider-item mb-3" key={k}>
                  <Activity activity={e} />
                </div>
              );
            })}
          </Slider>
        </div>
      </Container>
    </>
  );
};

export default Home;
