import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        // Giả định rằng API của bạn có một endpoint để lấy chi tiết
        // một hoạt động, ví dụ: /api/activities/:id
        // và URL.ACTIVITIES trong file util/url.js trỏ đến '/api/activities'
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
        style={{ backgroundImage: `url(${activity.thumbnail_url})` }}
      >
        <div className="detail-banner-overlay">
          <h1>{activity.title}</h1>
        </div>
      </div>
      <Container className="mt-5">
        <Row>
          <Col md={8}>
            <h2 className="detail-section-title">Description</h2>
            <p className="lead">{activity.description}</p>
          </Col>
          <Col md={4}>
            <Card className="detail-info-box">
              <Card.Header as="h5">Activity Info</Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Price:</strong> ${activity.price} / person
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Duration:</strong> {activity.duration} Days
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Group Size:</strong> Up to {activity.max_participants}{" "}
                  people
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Difficulty:</strong> {activity.difficulty_level}
                </ListGroup.Item>
              </ListGroup>
              <Card.Body>
                <h5 className="card-title mt-3">More Details</h5>
                <div
                  dangerouslySetInnerHTML={{ __html: activity.detail_content }}
                />
                <Button variant="warning" className="w-100 book-now-btn mt-4">
                  Book Now
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ActivityDetail;
