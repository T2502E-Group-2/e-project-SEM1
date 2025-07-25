import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios_instance from "../../util/axios_instance";
import { Col, Container, Row } from "react-bootstrap";
import Activity from "../shared/activity";
import URL from "../../util/url";

const Category = () => {
  const { id } = useParams();
  const [activities, setActivities] = useState([]);
  // get activities by category id
  const get_activities = async () => {
    const url = URL.CATEGORY_ACTIVITIES + id;
    const rs = await axios_instance.get(url);
    const data = rs.data.data;
    setActivities(data);
  };
  useEffect(() => {
    get_activities();
  }, [id]);

  return (
    <Container>
      <h1>Activities:</h1>
      <Row>
        {activities.map((e, k) => {
          return (
            <Col xs={3} key={k}>
              <Activity activity={e} />
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};
export default Category;
