import { useState, useEffect, useContext, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Alert,
  Form,
  Modal,
  Table,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { PayPalButtons } from "@paypal/react-paypal-js";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";
import UserContext from "../../context/context";

// Component checkbox hỗ trợ indeterminate
const IndeterminateCheckbox = ({ indeterminate, ...rest }) => {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  return <Form.Check ref={ref} {...rest} />;
};

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const { state } = useContext(UserContext);
  const userInfo = state.user;
  const isLoggedIn = !!userInfo;
  const navigate = useNavigate();

  // Create a ref to hold the latest user info to avoid stale closures in callbacks.
  const userInfoRef = useRef(userInfo);
  useEffect(() => {
    // Always keep the ref updated with the latest userInfo.
    userInfoRef.current = userInfo;
  }, [userInfo]);

  const [checkoutInfo, setCheckoutInfo] = useState({
    fullName:
      userInfo?.first_name && userInfo?.last_name
        ? `${userInfo.first_name} ${userInfo.last_name}`
        : "",
    address: userInfo?.address_line1 || "",
    email: userInfo?.email || "",
    phone: userInfo?.phone_number || "",
    note: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [paymentError, setPaymentError] = useState(null);

  const calculateTotal = (cartData, selectedIds) => {
    return cartData.reduce((sum, item) => {
      if (selectedIds.includes(item.id)) {
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);
  };

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
    const initialSelectedItems = storedCart.map((item) => item.id);
    setSelectedItems(initialSelectedItems);
    const newTotal = calculateTotal(storedCart, initialSelectedItems);
    setTotal(newTotal);
  }, []);

  // Auto-fill checkout form when user logs in, preserving the note
  useEffect(() => {
    if (isLoggedIn && userInfo) {
      setCheckoutInfo((prevInfo) => ({
        ...prevInfo,
        fullName: `${userInfo.first_name} ${userInfo.last_name}`,
        address: userInfo.address_line1 || "",
        email: userInfo.email || "",
        phone: userInfo.phone_number || "",
      }));
    }
  }, [isLoggedIn, userInfo]);

  const handleSelect = (itemId) => {
    const isSelected = selectedItems.includes(itemId);
    let newSelectedItems;

    if (isSelected) {
      newSelectedItems = selectedItems.filter((id) => id !== itemId);
    } else {
      newSelectedItems = [...selectedItems, itemId];
    }
    setSelectedItems(newSelectedItems);
    const newTotal = calculateTotal(cart, newSelectedItems);
    setTotal(newTotal);
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
      setTotal(0);
    } else {
      const allItemIds = cart.map((item) => item.id);
      setSelectedItems(allItemIds);
      const newTotal = calculateTotal(cart, allItemIds);
      setTotal(newTotal);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!checkoutInfo.fullName) errors.fullName = "Full name is required.";
    if (!checkoutInfo.address) errors.address = "Address is required.";
    if (!checkoutInfo.phone) errors.phone = "Phone number is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to purchase.");
      return;
    }
    setShowModal(true);
    setFormErrors({});
    setPaymentError(null);
  };

  const createOrder = (data, actions) => {
    if (!validateForm()) {
      return actions.reject("Please fill in the required fields.");
    }

    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: total.toFixed(2),
          },
        },
      ],
    });
  };

  const onApprove = (data, actions) => {
    if (!validateForm()) {
      return;
    }

    return actions.order.capture().then(async (details) => {
      const selectedCartItems = cart.filter((item) =>
        selectedItems.includes(item.id)
      );

      // Read the latest user info from the ref to ensure it's not stale.
      const currentUserInfo = userInfoRef.current;

      const orderData = {
        type: "equipment", // Add type for backend validation
        user_id: currentUserInfo ? currentUserInfo.user_id : null,
        paypalOrderId: details.id,
        totalAmount: total,
        cartItems: selectedCartItems.map((item) => ({
          activity_id: null,
          equipment_id: item.id,
          quantity: item.quantity,
        })),
        userInfo: checkoutInfo,
      };

      try {
        const response = await axios_instance.post(URL.PAYMENT, orderData);
        if (response.data.success) {
          alert("Payment successful! Thank you for your purchase.");
          const remainingCart = cart.filter(
            (item) => !selectedItems.includes(item.id)
          );
          localStorage.setItem("cart", JSON.stringify(remainingCart));
          setCart(remainingCart);
          setSelectedItems([]);
          navigate("/equipment");
        } else {
          setPaymentError(response.data.message);
        }
      } catch (err) {
        console.error("Error processing payment:", err);
        setPaymentError(
          "An error occurred while processing your payment. Please try again."
        );
      }
    });
  };

  const handleRemoveFromCart = (itemId) => {
    const updatedCart = cart.filter((item) => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    const updatedSelected = selectedItems.filter((id) => id !== itemId);
    setSelectedItems(updatedSelected);

    const newTotal = calculateTotal(updatedCart, updatedSelected);
    setTotal(newTotal);
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) newQuantity = 1;

    const updatedCart = cart.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    const newTotal = calculateTotal(updatedCart, selectedItems);
    setTotal(newTotal);
  };

  return (
    <Container style={{ paddingTop: "200px", paddingBottom: "50px" }}>
      <h2
        className="mb-4"
        style={{ color: "white", textShadow: "1px 1px 2px #000" }}>
        Your Shopping Cart
      </h2>
      {cart.length === 0 ? (
        <Alert variant="info">
          Your cart is empty.<Link to="/equipment">Continue shopping</Link>
        </Alert>
      ) : (
        <>
          <Row>
            <Col md={8}>
              <div
                style={{
                  maxHeight: "65vh",
                  overflowY: "auto",
                  overflowX: "auto",
                  borderRadius: "10px",
                }}>
                <Table
                  bordered
                  hover
                  className="bg-white"
                  style={{ marginBottom: 0 }}>
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "white",
                      borderBottom: "1px solid lightgray",
                    }}>
                    <tr className="text-center align-middle">
                      <th className="text-center">
                        Check
                        <IndeterminateCheckbox
                          type="checkbox"
                          checked={
                            selectedItems.length > 0 &&
                            selectedItems.length === cart.length
                          }
                          indeterminate={
                            selectedItems.length > 0 &&
                            selectedItems.length < cart.length
                          }
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Items</th>
                      <th>Unit price</th>
                      <th>Quantity</th>
                      <th>Amount</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="align-middle">
                    {cart.map((item) => (
                      <tr key={item.id}>
                        <td className="text-center">
                          <Form.Check
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelect(item.id)}
                          />
                        </td>
                        <td>
                          <div className="d-flex align-items-center px-3 gap-5">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              style={{ maxWidth: "80px" }}
                            />
                            <div>
                              <p style={{ fontWeight: "bold", margin: 0 }}>
                                {item.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>${item.price}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }>
                              -
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }>
                              +
                            </Button>
                          </div>
                        </td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.id)}>
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Col>
            <Col md={4}>
              <Card
                className="order-summary-card"
                style={{ position: "sticky", top: "200px" }}>
                <Card.Body>
                  <Card.Title className="text-center fw-bolder">
                    ORDER SUMMARY
                  </Card.Title>
                  <div className="text-center">
                    <h5 className="mb-3">
                      Total Items: {selectedItems.length}
                    </h5>
                    <h5 className="mb-3">Total Price: ${total.toFixed(2)}</h5>
                  </div>
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={handleCheckout}
                    disabled={selectedItems.length === 0}>
                    Buy now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Modal Payment */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Payment Information</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {paymentError && <Alert variant="danger">{paymentError}</Alert>}
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Full name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={checkoutInfo.fullName}
                    onChange={(e) =>
                      setCheckoutInfo({
                        ...checkoutInfo,
                        fullName: e.target.value,
                      })
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
                    value={checkoutInfo.address}
                    onChange={(e) =>
                      setCheckoutInfo({
                        ...checkoutInfo,
                        address: e.target.value,
                      })
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
                    value={checkoutInfo.phone}
                    onChange={(e) =>
                      setCheckoutInfo({
                        ...checkoutInfo,
                        phone: e.target.value,
                      })
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
                    value={checkoutInfo.note}
                    onChange={(e) =>
                      setCheckoutInfo({ ...checkoutInfo, note: e.target.value })
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
                onCancel={() => navigate("/cart")}
              />
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default Cart;
