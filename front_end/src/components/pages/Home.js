import { Col, Container, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";
import Course from "../shared/course";
import Slider from "react-slick";

const Home = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [latestCourses, setLatestCourses] = useState([]);
  // get data featured courses
  const get_featured = async () => {
    const url = URL.FEATURED_COURSES;
    const rs = await axios_instance.get(url);
    const data = rs.data.data;
    setFeaturedCourses(data);
  };
  // get data latest courses
  const get_latest = async () => {
    const url = URL.LATEST_COURSES;
    const rs = await axios_instance.get(url);
    const data = rs.data.data;
    setLatestCourses(data);
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
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
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
    <Container>
      {/*Featured Courses */}
      <h2 className="mt-5">Featured Courses</h2>
      <Slider {...sliderSettings}>
        {featuredCourses.map((e, k) => {
          return (
            <div className="slider-item" key={k}>
              <Course course={e} />
            </div>
          );
        })}
      </Slider>

      {/*Latest Courses */}
      <h2 className="mt-5">Latest Courses</h2>
      <Slider {...sliderSettings}>
        {latestCourses.map((e, k) => {
          return (
            <div className="slider-item" key={k}>
              <Course course={e} />
            </div>
          );
        })}
      </Slider>
    </Container>
  );
};
export default Home;
