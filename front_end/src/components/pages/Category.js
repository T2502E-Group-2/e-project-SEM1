import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios_instance from "../../util/axios_instance";
import { Col, Container, Row } from "react-bootstrap";
import Course from "../shared/course";
import URL from "../../util/url";

const Category = () => {
  const { id } = useParams();
  const [courses, setCourses] = useState([]);
  // get courses by category id
  const get_courses = async () => {
    const url = URL.CATEGORY_COURSES + id;
    const rs = await axios_instance.get(url);
    const data = rs.data.data;
    setCourses(data);
  };
  useEffect(() => {
    get_courses();
  }, [id]);

  return (
    <Container>
      <h1>Courses:</h1>
      <Row>
        {courses.map((e, k) => {
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
export default Category;
