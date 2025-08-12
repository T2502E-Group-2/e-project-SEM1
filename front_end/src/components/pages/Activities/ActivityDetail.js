import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import URL from "../../../util/url";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Card,
  ListGroup,
  Button,
} from "react-bootstrap";
import axios_instance from "../../../util/axios_instance";

const ActivityDetail = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await axios_instance.get(URL.ACTIVITY_DETAIL + id);
        setActivity(response.data.data);
        setError(null);
      } catch (err) {
        setError("Could not fetch activity details. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" variant="warning">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!activity) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Activity not found.</Alert>
      </Container>
    );
  }

  return (
    <div className="activity-detail-page">
      <div
        className="detail-banner"
        style={{ backgroundImage: `url(${activity.thumbnail_url})` }}>
        <div className="detail-banner-overlay">
          <h1>{activity.title}</h1>
        </div>
      </div>
      <Container className="container-fluid d-flex mt-5">
        <Row>
          <Col md={8} className="mb-4">
            <Card
              className="post-content"
              dangerouslySetInnerHTML={{ __html: activity.detail }}
            />
          </Col>
          <Col md={4} className="mb-4">
            <div>
              <Card className="detail-info-box">
                <Card.Header as="h3">Activity Information</Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>Price:</strong> ${activity.price} / person
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Duration:</strong> {activity.duration}{" "}
                    {Number(activity.duration) === 1 ? "Day" : "Days"}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Start date: </strong> {activity.start_date}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>End date: </strong> {activity.end_date}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Group Size:</strong> Up to{" "}
                    {activity.max_participants}{" "}
                    {Number(activity.max_participants) === 1
                      ? "person"
                      : "people"}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Difficulty:</strong> {activity.difficulty_level}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Status:</strong> {activity.status}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Registration deadline: </strong>
                    {activity.registration_deadline}
                  </ListGroup.Item>
                </ListGroup>
                <Card.Body>
                  <Button
                    variant="warning"
                    className="w-100 book-now-btn mt-4"
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                    }}
                    onClick={() => navigate(`/activity/${id}/book`)}>
                    Book Now
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ActivityDetail;
