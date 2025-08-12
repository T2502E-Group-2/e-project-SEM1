import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios_instance from "../../../util/axios_instance";
import URL from "../../../util/url";

import {
  Col,
  Container,
  Row,
  Spinner,
  Alert,
  Modal,
  Button,
  Form,
} from "react-bootstrap";

import { PayPalButtons } from "@paypal/react-paypal-js";

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    address: "",
    email: "",
    phone: "",
    note: "",
  });

  const [validationError, setValidationError] = useState("");
  // Thêm một state để lưu các lỗi của từng trường
  const [formErrors, setFormErrors] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const get_detail = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = URL.EQUIPMENT_DETAIL + id;
        const rs = await axios_instance.get(url);
        if (rs.data && rs.data.data) {
          setEquipment(rs.data.data);
          console.log(rs.data.data);

          // Lấy thông tin người dùng từ localStorage để kiểm tra đăng nhập
          const loggedInUser = JSON.parse(localStorage.getItem("user"));
          if (loggedInUser) {
            setIsLoggedIn(true);
            setUserInfo(loggedInUser);
          } else {
            setIsLoggedIn(false);
          }
          console.log(loggedInUser);
        } else {
          setError("Equipment not found.");
        }
      } catch (err) {
        setError("Could not fetch equipment details. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    get_detail();
  }, [id]);

  const handleAddToCart = () => {
    const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = currentCart.find((item) => item.id === equipment.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentCart.push({
        ...equipment,
        quantity: quantity,
      });
    }

    // Save updated shopping cart into localstorage
    localStorage.setItem("cart", JSON.stringify(currentCart));
    alert(`${equipment.name} Already added to the cart!`);
    navigate("/cart");
  };

  const handleBuyNow = () => {
    // Reset lỗi validation khi mở modal
    setValidationError("");
    setFormErrors({});
    setShowModal(true);
  };

  const handleValidation = () => {
    if (isLoggedIn) {
      setValidationError("");
      setFormErrors({});
      return true;
    }

    const errors = {};
    let formIsValid = true;

    if (!userInfo.fullName) {
      formIsValid = false;
      errors.fullName = "Full name is not allowed to leave blank";
    }
    if (!userInfo.address) {
      formIsValid = false;
      errors.address = "The address is not allowed to leave blank";
    }
    if (!userInfo.phone) {
      formIsValid = false;
      errors.phone = "The phone number is not allowed to leave blank";
    }

    setFormErrors(errors);

    if (!formIsValid) {
      setValidationError("Please fill in mandatory information.");
    } else {
      setValidationError("");
    }
    return formIsValid;
  };

  // Logic to create orders on Paypal
  const createOrder = (data, actions) => {
    if (!handleValidation()) {
      return actions.reject("User information has not been completed.");
    }

    // Nếu validation thành công, tạo đơn hàng
    return actions.order.create({
      purchase_units: [
        {
          description: equipment.name,
          amount: {
            value: (equipment.price * quantity).toFixed(2),
            currency_code: "USD",
          },
        },
      ],
    });
  };

  // Logic after successful payment
  const onApprove = (data, actions) => {
    if (!handleValidation()) {
      return;
    }

    return actions.order.capture().then((details) => {
      const orderData = {
        type: "equipment",
        userId: isLoggedIn ? userInfo.user_id : null,
        paypalOrderId: details.id,
        totalAmount: (equipment.price * quantity).toFixed(2),
        cartItems: [
          {
            activity_id: null,
            equipment_id: equipment.id,
            quantity: quantity,
          },
        ],
        userInfo: {
          fullName: userInfo.fullName,
          address: userInfo.address,
          phone: userInfo.phone,
          note: userInfo.note,
        },
      };

      axios_instance
        .post(URL.PAYMENT, orderData)
        .then((res) => {
          if (res.data.success) {
            alert(`Successful payment! Order code: ${res.data.order_id}`);
          } else {
            alert(`Thanh toán thất bại: ${res.data.message}`);
          }
        })
        .catch((err) => {
          console.error("Error when recording orders into database:", err);
          alert(
            "Successfully paid but errors when saving orders. Please contact support."
          );
        });
    });
  };

  if (loading) {
    return (
      <Container
        className="text-center mt-5 vh-100"
        style={{ paddingTop: "140px" }}>
        <Spinner animation="border" variant="primary" />
        <p>Loading Equipment Details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5" style={{ paddingTop: "140px" }}>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!equipment) {
    return null;
  }

  return (
    <Container style={{ paddingTop: "200px", paddingBottom: "50px" }}>
      <Row className="bg-white p-3 rounded">
        <Row>
          <Col md={4}>
            <img
              className="img-thumbnail mx-3 my-3 border-0"
              style={{ width: "300px", cursor: "pointer" }}
              src={equipment.image_url}
              alt={equipment.name}
              onClick={() => setShowModal(true)}
            />
          </Col>

          <Col md={8} className="mt-2 px-5">
            <div className="mt-3">
              <h1>
                <strong>{equipment.name}</strong>
              </h1>
              <h5 className="text-secondary">{equipment.brand}</h5>
              <h5 className="mt-3" style={{ fontSize: "26px" }}>
                <strong>${equipment.price}</strong>
              </h5>
            </div>
            <div className="d-flex align-items-center my-3">
              {" "}
              <Button
                variant="outline-secondary"
                onClick={() =>
                  setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
                }>
                -
              </Button>
              <span className="mx-2 fs-5">{quantity}</span>
              <Button
                variant="outline-secondary"
                onClick={() => setQuantity((prev) => prev + 1)}>
                +
              </Button>
            </div>
            <div className="d-flex mt-3">
              <Button
                variant="primary"
                className="me-2"
                style={{
                  backgroundColor: "darkorange",
                  borderColor: "darkorange",
                }}
                onClick={handleBuyNow}>
                Buy now
              </Button>
              <Button
                variant="outline-primary"
                style={{
                  borderColor: "darkorange",
                  color: "black",
                }}
                onClick={handleAddToCart}>
                Add to cart
              </Button>
            </div>
          </Col>
        </Row>
        <div className="lead mt-3">
          <strong className="fw-bold">Descriptions:</strong>
          <div
            className="mt-2"
            dangerouslySetInnerHTML={{ __html: equipment.description }}
          />
        </div>
      </Row>
      {/*Purchase Now Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Confirm order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={4}>
              <img
                className="img-thumbnail mx-3 my-3 border-0"
                style={{ width: "200px", cursor: "pointer" }}
                src={equipment.image_url}
                alt={equipment.name}></img>
            </Col>
            <Col
              md={8}
              style={{
                fontSize: "lg",
                alignContent: "center",
              }}>
              <h4 style={{ fontWeight: "bold", paddingBottom: "10px" }}>
                You're Purchasing for:
              </h4>
              <h5 style={{ fontWeight: "bold", paddingBottom: "10px" }}>
                {equipment.name}
              </h5>
              <p>
                <strong>Quantity: </strong>
                {quantity}
              </p>
              <p>
                <strong>Total amount: </strong>$
                {(equipment.price * quantity).toFixed(2)}
              </p>
            </Col>
          </Row>
          <hr />
          <h4 style={{ fontWeight: "bold", paddingBottom: "15px" }}>
            Personal Information
          </h4>
          {validationError && <Alert variant="danger">{validationError}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Full name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={userInfo.fullName || ""}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, fullName: e.target.value })
                }
                isInvalid={!!formErrors.fullName}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.fullName}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Address <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={userInfo.address || ""}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, address: e.target.value })
                }
                isInvalid={!!formErrors.address}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.address}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Phone number<span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={userInfo.phone || ""}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, phone: e.target.value })
                }
                isInvalid={!!formErrors.phone}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.phone}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes for the seller</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={userInfo.note || ""}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, note: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={createOrder}
            onApprove={onApprove}
          />
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EquipmentDetail;
