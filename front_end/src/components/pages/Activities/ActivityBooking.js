import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import axios_instance from "../../../util/axios_instance";
import URL from "../../../util/url";

const ActivityBooking = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    participants: 1,
  });
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const fetchActivity = async () => {
      const res = await axios_instance.get(URL.ACTIVITY_DETAIL + id);
      setActivity(res.data.data);
    };
    fetchActivity();
  }, [id]);

  useEffect(() => {
    if (activity) {
      setTotalCost(form.participants * activity.price);
    }
  }, [form.participants, activity]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const changeParticipants = (delta) => {
    setForm((prev) => {
      const newCount = Math.min(
        Math.max(1, prev.participants + delta),
        activity.max_participants
      );
      return { ...prev, participants: newCount };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Chuyển sang trang thanh toán (đặt cọc 30%)
    const deposit = totalCost * 0.3;
    console.log("Booking info:", { ...form, totalCost, deposit });
    // navigate("/payment", { state: { ...form, activity, totalCost, deposit } });
  };

  if (!activity) return <p>Loading...</p>;

  return (
    <Container
      className="container-fluid post-detail-page-wrapper"
      style={{ paddingTop: "200px" }}>
      <Row>
        <Col md={8}>
          <Card className="p-4">
            <h2>Register for {activity.title}</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Number of Participants</Form.Label>
                <InputGroup>
                  <Button
                    variant="outline-secondary"
                    onClick={() => changeParticipants(-1)}>
                    -
                  </Button>
                  <Form.Control
                    type="number"
                    name="participants"
                    value={form.participants}
                    min="1"
                    max={activity.max_participants}
                    onChange={(e) => {
                      const val = Math.min(
                        Math.max(1, parseInt(e.target.value) || 1),
                        activity.max_participants
                      );
                      setForm({ ...form, participants: val });
                    }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => changeParticipants(1)}>
                    +
                  </Button>
                </InputGroup>
                <Form.Text muted>
                  Maximum {activity.max_participants} people allowed.
                </Form.Text>
              </Form.Group>

              <h5>Total Estimated Cost: ${totalCost}</h5>
              <h6>Deposit (30%): ${Math.round(totalCost * 0.3)}</h6>

              <Button type="submit" variant="warning" className="mt-3 w-100">
                Proceed to Payment
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ActivityBooking;
