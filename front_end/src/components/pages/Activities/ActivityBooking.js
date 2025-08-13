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
  Alert,
} from "react-bootstrap";
import { PayPalButtons } from "@paypal/react-paypal-js";
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
  const [formErrors, setFormErrors] = useState({});
  const [totalCost, setTotalCost] = useState(0);
  const [validationError, setValidationError] = useState("");

  // Retrieve user info and login status from localStorage or context as needed
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!userInfo || !!storedUser;

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

  const handleValidation = () => {
    const errors = {};
    let valid = true;

    if (!form.fullName.trim()) {
      errors.fullName = "Full name is required";
      valid = false;
    }
    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
      valid = false;
    }
    if (!form.email.trim()) {
      errors.email = "Email is required";
      valid = false;
    }

    setFormErrors(errors);
    if (!valid) {
      setValidationError("Please fill in all required fields before booking.");
    } else {
      setValidationError("");
    }
    return valid;
  };

  if (!activity) return <p>Loading...</p>;

  return (
    <Container
      className="container-fluid post-detail-page-wrapper"
      style={{ paddingTop: "200px" }}>
      <Row>
        <Col md={12}>
          <Card className="p-4">
            <h2>Register for {activity.title}</h2>

            {validationError && (
              <Alert variant="danger">{validationError}</Alert>
            )}

            <Form>
              {/* Full Name */}
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  isInvalid={!!formErrors.fullName}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.fullName}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Phone */}
              <Form.Group className="mb-3">
                <Form.Label>Phone number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  isInvalid={!!formErrors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.phone}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Email */}
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  isInvalid={!!formErrors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.email}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Participants */}
              <Form.Group className="mb-3">
                <Form.Label>Number of Participants</Form.Label>
                <InputGroup style={{ width: "150px" }}>
                  <Button
                    variant="outline-secondary"
                    onClick={() => changeParticipants(-1)}>
                    -
                  </Button>
                  <Form.Control
                    type="number"
                    className="text-center "
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
              <h6
                className="mt-3"
                style={{ fontSize: "18px", fontWeight: "bold" }}>
                Pay in Deposit (30%): ${Math.round(totalCost * 0.3)}
              </h6>

              {/* PayPal Buttons */}
              <div className="d-flex justify-content-between mt-4">
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  createOrder={(data, actions) => {
                    if (!handleValidation()) {
                      return actions.reject();
                    }
                    return actions.order.create({
                      purchase_units: [
                        {
                          description: activity.title,
                          amount: {
                            value: (totalCost * 0.3).toFixed(2),
                            currency_code: "USD",
                          },
                        },
                      ],
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order.capture().then(async (details) => {
                      try {
                        console.log("userInfo", userInfo); //test
                        console.log("storedUser", storedUser); //test
                        console.log("isLoggedIn", isLoggedIn); //test

                        const res = await axios_instance.post(URL.PAYMENT, {
                          type: "activity",
                          user_id: isLoggedIn
                            ? userInfo?.user_id || storedUser?.user_id
                            : null,
                          paypalOrderId: details.id,
                          totalAmount: (totalCost * 0.3).toFixed(2),
                          cartItems: [
                            {
                              activity_id: activity.activity_id, // ✅ key khớp backend
                              equipment_id: null, // ✅ để rõ ràng
                              quantity: form.participants,
                              price: activity.price,
                            },
                          ],
                          userInfo: {
                            fullName: form.fullName,
                            phone: form.phone,
                            email: form.email,
                            address: form.address || "",
                            note: form.note || "",
                          },
                        });

                        if (res.data.success) {
                          alert("Payment successful! Booking saved.");
                        } else {
                          alert(
                            "Payment succeeded but failed to save booking!"
                          );
                        }
                      } catch (err) {
                        console.error(err);
                        alert(
                          "Payment succeeded but error occurred while saving booking!"
                        );
                      }
                    });
                  }}
                />
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ActivityBooking;
