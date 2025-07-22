import { Col, Container, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";
import Course from "../shared/course";

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
  return (
    <Container>
      <h2>Featured Courses</h2>
      <Row>
        {featuredCourses.map((e, k) => {
          return (
            <Col xs={3} key={k}>
              <Course course={e} />
            </Col>
          );
        })}
      </Row>
      <h2>Latest Courses</h2>
      <Row>
        {latestCourses.map((e, k) => {
          return (
            <Col xs={3} key={k}>
              <Course course={e} />
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};
export default Home;
