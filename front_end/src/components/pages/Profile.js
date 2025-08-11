// Profile.js
import React, { useContext, useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/context";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";
import { UPDATE_USER_SUCCESS } from "../../context/action";

const Profile = () => {
  const { state, dispatch } = useContext(UserContext);
  const { user } = state;
  const navigate = useNavigate();

  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios_instance.get(
          "/Users/get_user_details.php"
        );
        if (response.data.success) {
          setFormData(response.data.user);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await axios_instance.post(URL.UPDATE_PROFILE, formData);
      if (response.data.success) {
        dispatch({ type: UPDATE_USER_SUCCESS, payload: response.data.user });
        setSuccessMessage("Cập nhật thông tin thành công!");
        setIsEditMode(false);
      } else {
        setError(response.data.message || "Cập nhật thất bại.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi cập nhật.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditMode(false);
    setError("");
    setSuccessMessage("");
  };

  if (!user) {
    return (
      <Container
        className="text-center user-details-page-wrapper"
        style={{
          paddingTop: "250px",
          color: "white",
          textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7)",
        }}>
        <h2>Bạn chưa đăng nhập</h2>
        <p>Vui lòng đăng nhập để xem thông tin tài khoản.</p>
        <Button onClick={() => navigate("/")}>Về trang chủ</Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container
        className="my-5 text-center"
        style={{ paddingTop: "150px", minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải thông tin...</p>
      </Container>
    );
  }

  if (!formData) {
    return (
      <Container
        className="my-5"
        style={{ paddingTop: "150px", minHeight: "60vh" }}>
        <Alert variant="danger">{error || "Không thể tải dữ liệu."}</Alert>
      </Container>
    );
  }

  return (
    <Container
      className="container-fluid user-details-page-wrapper"
      style={{ paddingTop: "200px" }}>
      <Row className="justify-content-center">
        <Col md={12} lg={10}>
          <h1 className="mb-4 topic-card-text animate-in">
            Account information
          </h1>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Card>
            <Card.Body>
              <Form onSubmit={handleFormSubmit}>
                {/* Basic Info */}
                <h5 className="mb-3">General information</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="firstName">
                      <Form.Label className="label-title">
                        First name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={formData.first_name || ""}
                        onChange={handleChange}
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="lastName">
                      <Form.Label className="label-title">Last name</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={formData.last_name || ""}
                        onChange={handleChange}
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label className="label-title">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                </Form.Group>
                <Form.Group className="mb-4" controlId="phoneNumber">
                  <Form.Label className="label-title">Phone number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number || ""}
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                </Form.Group>

                <hr />

                {/* Address Info */}
                <h5 className="mb-3">Address information</h5>
                <Form.Group className="mb-3" controlId="address1">
                  <Form.Label className="label-title">
                    Address line 1
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="address_line1"
                    value={formData.address_line1 || ""}
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="address2">
                  <Form.Label className="label-title">
                    Address line 2
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="address_line2"
                    value={formData.address_line2 || ""}
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="city">
                      <Form.Label className="label-title">
                        City/District
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city || ""}
                        onChange={handleChange}
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="state">
                      <Form.Label className="label-title">
                        Province/State
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="state_province"
                        value={formData.state_province || ""}
                        onChange={handleChange}
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="zip">
                      <Form.Label className="label-title">ZIP code</Form.Label>
                      <Form.Control
                        type="text"
                        name="zip_code"
                        value={formData.zip_code || ""}
                        onChange={handleChange}
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="country">
                      <Form.Label className="label-title">Country</Form.Label>
                      <Form.Control
                        type="text"
                        name="country"
                        value={formData.country || ""}
                        onChange={handleChange}
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Action Buttons */}
                <div className="mt-4 d-flex justify-content-end">
                  {isEditMode ? (
                    <>
                      <Button
                        variant="secondary"
                        onClick={handleCancel}
                        className="me-2"
                        disabled={submitting}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={submitting}>
                        {submitting ? (
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                        ) : (
                          "Save changes"
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline-primary"
                      onClick={() => setIsEditMode(true)}>
                      Edit information
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
