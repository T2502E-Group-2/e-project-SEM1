import React, { useState, useContext } from "react";
import { Modal, Tabs, Tab, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";
import UserContext from "../../context/context";
import { LOGIN_SUCCESS } from "../../context/action";

const AuthModal = ({ show, onClose, mode, setAuthMode }) => {
  const navigate = useNavigate();
  const { dispatch } = useContext(UserContext);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state_province: "",
    zip_code: "",
    country: "",
  });

  const [loginMessage, setLoginMessage] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [error, setError] = useState("");

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginMessage("");
    setError("");

    try {
      const response = await axios_instance.post("/auth/login.php", loginData);

      if (response.data.success) {
        setLoginMessage(response.data.message);
        dispatch({ type: LOGIN_SUCCESS, payload: response.data.user });
        localStorage.setItem("user", JSON.stringify(response.data.user));

        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(response.data.message || "Log in failed.");
      }
    } catch (err) {
      setError(
        "An error occurred while attempting to log in. Please try again."
      );
      console.error(err);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirm_password) {
      setRegisterMessage("Passwords do not match!");
      return;
    }
    setRegisterMessage("");
    try {
      const response = await axios_instance.post(URL.REGISTER, registerData);
      if (response.data.success) {
        setRegisterMessage(
          "Registration successfully! Redirecting to you profile..."
        );

        // Dispatch action to save user to context and localStorage
        dispatch({ type: LOGIN_SUCCESS, payload: response.data.user });

        setTimeout(() => {
          onClose();
          setRegisterMessage("");
          navigate("/profile");
        }, 1500);
      } else {
        setRegisterMessage(response.data.message || "Register failure.");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setRegisterMessage(error.response.data.message);
      } else {
        setRegisterMessage("Error occurs when registering. Please try again.");
      }
      console.error(error);
    }
  };

  return (
    <Modal show={show} onHide={onClose} style={{ paddingTop: "100px" }}>
      <Modal.Header closeButton>
        <Modal.Title>User authentication</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          activeKey={mode}
          onSelect={(k) => setAuthMode(k)}
          className="mb-3">
          <Tab eventKey="login" title="Log in">
            {loginMessage && <Alert variant="success">{loginMessage}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleLoginSubmit}>
              <Form.Group className="mb-3" controlId="loginEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="loginPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter the password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                style={{
                  backgroundColor: "var(--primary-color)",
                  borderColor: "var(--primary-color)",
                }}>
                Log in
              </Button>
            </Form>
          </Tab>
          <Tab eventKey="register" title="Register">
            {registerMessage && <Alert variant="info">{registerMessage}</Alert>}
            <Form onSubmit={handleRegisterSubmit}>
              <Form.Group className="mb-3" controlId="registerFirstName">
                <Form.Label>First name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your first name"
                  name="first_name"
                  value={registerData.first_name}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerLastName">
                <Form.Label>Last name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your last name"
                  name="last_name"
                  value={registerData.last_name}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerPhoneNumber">
                <Form.Label>Phone number</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Enter your phone number"
                  name="phone_number"
                  value={registerData.phone_number}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerAddress1">
                <Form.Label>
                  Address line 1 (Optional: No., Street, Building, Apartment)
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your address line 1"
                  name="address_line1"
                  value={registerData.address_line1}
                  onChange={handleRegisterChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerAddress2">
                <Form.Label>
                  Address line 2 (Optional: Ward, Community, District)
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your address line 2"
                  name="address_line2"
                  value={registerData.address_line2}
                  onChange={handleRegisterChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerCity">
                <Form.Label>City (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your city"
                  name="city"
                  value={registerData.city}
                  onChange={handleRegisterChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerState">
                <Form.Label>Province/State (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your province/state"
                  name="state_province"
                  value={registerData.state_province}
                  onChange={handleRegisterChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerZip">
                <Form.Label>ZIP code (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Zip code"
                  name="zip_code"
                  value={registerData.zip_code}
                  onChange={handleRegisterChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerCountry">
                <Form.Label>Country (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your country"
                  name="country"
                  value={registerData.country}
                  onChange={handleRegisterChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerConfirmPassword">
                <Form.Label>Password confirmation</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Please input your password again"
                  name="confirm_password"
                  value={registerData.confirm_password}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>

              <Button
                variant="success"
                type="submit"
                className="w-100"
                style={{
                  backgroundColor: "var(--primary-color)",
                  borderColor: "var(--primary-color)",
                }}>
                Register
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;
