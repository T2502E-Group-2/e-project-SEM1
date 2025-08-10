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
        setError(response.data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Lỗi khi đăng nhập");
      console.error(err);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirm_password) {
      setRegisterMessage("Mật khẩu xác nhận không khớp!");
      return;
    }
    setRegisterMessage("");
    try {
      const response = await axios_instance.post(URL.REGISTER, registerData);
      if (response.data.success) {
        setRegisterMessage("Đăng ký thành công! Đang chuyển hướng...");

        // Dispatch action to save user to context and localStorage
        dispatch({ type: LOGIN_SUCCESS, payload: response.data.user });

        setTimeout(() => {
          onClose();
          setRegisterMessage("");
          navigate("/profile");
        }, 1500);
      } else {
        // This part is unlikely to be reached if the server uses proper HTTP status codes
        setRegisterMessage(response.data.message || "Đăng ký thất bại.");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // Hiển thị lỗi cụ thể từ server, ví dụ "Email đã tồn tại."
        setRegisterMessage(error.response.data.message);
      } else {
        setRegisterMessage("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.");
      }
      console.error(error);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Xác thực người dùng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          activeKey={mode}
          onSelect={(k) => setAuthMode(k)}
          className="mb-3">
          <Tab eventKey="login" title="Đăng nhập">
            {loginMessage && <Alert variant="success">{loginMessage}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleLoginSubmit}>
              <Form.Group className="mb-3" controlId="loginEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Nhập email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="loginPassword">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                Đăng nhập
              </Button>
            </Form>
          </Tab>
          <Tab eventKey="register" title="Đăng ký">
            {registerMessage && <Alert variant="info">{registerMessage}</Alert>}
            <Form onSubmit={handleRegisterSubmit}>
              <Form.Group className="mb-3" controlId="registerFirstName">
                <Form.Label>Họ</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập họ"
                  name="first_name"
                  value={registerData.first_name}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerLastName">
                <Form.Label>Tên</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập tên"
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
                  placeholder="Nhập email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerPhoneNumber">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  name="phone_number"
                  value={registerData.phone_number}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerAddress1">
                <Form.Label>Địa chỉ 1 (Tùy chọn)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập địa chỉ"
                  name="address_line1"
                  value={registerData.address_line1}
                  onChange={handleRegisterChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerAddress2">
                <Form.Label>Địa chỉ 2 (Tùy chọn)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập địa chỉ bổ sung"
                  name="address_line2"
                  value={registerData.address_line2}
                  onChange={handleRegisterChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerCity">
                <Form.Label>Thành phố (Tùy chọn)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập thành phố"
                  name="city"
                  value={registerData.city}
                  onChange={handleRegisterChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerState">
                <Form.Label>Tỉnh/Bang (Tùy chọn)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập tỉnh/bang"
                  name="state_province"
                  value={registerData.state_province}
                  onChange={handleRegisterChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerZip">
                <Form.Label>Mã ZIP (Tùy chọn)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập mã ZIP/bưu chính"
                  name="zip_code"
                  value={registerData.zip_code}
                  onChange={handleRegisterChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerCountry">
                <Form.Label>Quốc gia (Tùy chọn)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập quốc gia"
                  name="country"
                  value={registerData.country}
                  onChange={handleRegisterChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerPassword">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerConfirmPassword">
                <Form.Label>Xác nhận mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  name="confirm_password"
                  value={registerData.confirm_password}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>

              <Button variant="success" type="submit" className="w-100">
                Đăng ký
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;
