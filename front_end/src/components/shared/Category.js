import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios_instance from "../../util/axios_instance";
import { Col, Container, Row } from "react-bootstrap";
import Activity from "./Activity";
import URL from "../../util/url";

const Category = () => {
  const { name } = useParams();
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    // get activities by category id
    const get_activities = async () => {
      const url = URL.CATEGORY_ACTIVITIES + "?category_name=" + name;
      const rs = await axios_instance.get(url);
      const data = rs.data.data;
      setActivities(data);
    };
    get_activities();
  }, [name]);

  return (
    <Container>
      <h1>Activities:</h1>
      <Row>
        {activities.map((e, k) => {
          return (
            <Col xs={12} sm={6} md={4} lg={3} key={k} className="mb-4">
              <Activity activity={e} />
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};
export default Category;
