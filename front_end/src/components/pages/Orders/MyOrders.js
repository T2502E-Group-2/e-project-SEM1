import React, { useEffect, useContext, useState } from "react";
import axios from "axios";
import UserContext from "../../../context/context";
import UserOrderContext, {
  FETCH_ORDERS_REQUEST,
  FETCH_ORDERS_SUCCESS,
  FETCH_ORDERS_FAILURE,
} from "../../../context/UserOrderContext";
import { Container, Spinner, Alert, Card, Form, Button } from "react-bootstrap";
import URL from "../../../util/url";

const MyOrders = () => {
  const { state: userState } = useContext(UserContext);
  const { state: orderState, dispatch } = useContext(UserOrderContext);
  const [searchParams, setSearchParams] = useState({
    paypal_order_id: "",
    email: "",
    phone: "",
  });

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
  };

  const fetchOrders = React.useCallback(
    async (params) => {
      dispatch({ type: FETCH_ORDERS_REQUEST });
      let apiUrl = `${URL.GET_USER_ORDERS}?`;
      const queryParams = new URLSearchParams(params).toString();
      apiUrl += queryParams;

      try {
        const response = await axios.get(apiUrl);

        if (response.data.success) {
          const ordersData = Array.isArray(response.data.data)
            ? response.data.data
            : [];
          dispatch({ type: FETCH_ORDERS_SUCCESS, payload: ordersData });
        } else {
          dispatch({
            type: FETCH_ORDERS_FAILURE,
            payload: response.data.message || "Unable to get order data.",
          });
        }
      } catch (err) {
        dispatch({
          type: FETCH_ORDERS_FAILURE,
          payload: "Error occurs when connected to the server.",
        });
        console.error("Error fetching orders:", err);
      }
    },
    [dispatch]
  );

  // Automatically fetch orders for logged in users
  useEffect(() => {
    if (userState.user?.user_id) {
      fetchOrders({ user_id: userState.user.user_id });
    } else {
      dispatch({ type: FETCH_ORDERS_SUCCESS, payload: [] });
    }
  }, [userState.user?.user_id, dispatch, fetchOrders]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const { paypal_order_id, email, phone } = searchParams;
    if (!paypal_order_id && (!email || !phone)) {
      dispatch({
        type: FETCH_ORDERS_FAILURE,
        payload:
          "Please enter Paypal order code, or both email and phone number to look up.",
      });
      return;
    }

    if (paypal_order_id) {
      fetchOrders({ paypal_order_id: paypal_order_id });
    } else {
      // If there is no code, use email and phone number
      fetchOrders({ email, phone });
    }
  };

  const renderSearchForm = () => (
    <Container
      className="container-fluid post-detail-page-wrapper"
      style={{ paddingTop: "160px" }}>
      <h2
        className="text-center mb-4"
        style={{
          color: "#ffff",
          fontWeight: "bold",
          textShadow: "1px 1px 2px #000",
        }}>
        Search for your order
      </h2>

      <Card onSubmit={handleSearchSubmit} className="p-4 border rounded p-3">
        <Form.Group className="mb-3">
          <Form.Label>
            <strong>Option 1: Search by Paypal order code</strong>
          </Form.Label>
          <Form.Control
            typ="text"
            name="paypal_order_id"
            value={searchParams.paypal_order_id}
            onChange={handleSearchChange}
            placeholder="Enter your Paypal Order ID"
          />
        </Form.Group>
        <p className="text-center" style={{ fontSize: "1.2rem" }}>
          <strong>OR</strong>
        </p>
        <Form.Group className="mb-3">
          <Form.Label>
            <strong>Option 2: Search by Email and Phone number</strong>
          </Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={searchParams.email}
            onChange={handleSearchChange}
            className="mb-2"
            placeholder="Enter your email"
          />
          <Form.Control
            type="tel"
            name="phone"
            value={searchParams.phone}
            onChange={handleSearchChange}
            placeholder="Enter your phone number"
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={orderState.loading}>
          {orderState.loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Search"
          )}
        </Button>
      </Card>

      {orderState.error && (
        <Alert variant="danger" className="mt-3">
          {orderState.error}
        </Alert>
      )}
    </Container>
  );

  if (userState.user?.user_id) {
    if (orderState.loading) {
      return (
        <Container className="text-center mt-5" style={{ paddingTop: "160px" }}>
          <Spinner animation="border" variant="primary" />
          <p>Loading...</p>
        </Container>
      );
    }

    if (orderState.error) {
      return (
        <Container className="mt-5" style={{ paddingTop: "160px" }}>
          <Alert variant="danger">{orderState.error}</Alert>
        </Container>
      );
    }

    if (!orderState.orders || orderState.orders.length === 0) {
      return (
        <Container
          className="container-fluid post-detail-page-wrapper"
          style={{ paddingTop: "160px" }}>
          <Alert variant="info">You do not have any orders yet.</Alert>
        </Container>
      );
    }
  } else {
    //Show the search form if the user has not logged in
    if (orderState.orders.length === 0) {
      return renderSearchForm();
    }
  }

  //Display the list of orders for both cases
  return (
    <Container
      className="container-fluid post-detail-page-wrapper"
      style={{
        paddingTop: "160px",
      }}>
      <h2
        className="text-center mb-4"
        style={{
          color: "white",
          textShadow: "1px 1px 2px #000",
        }}>
        {userState.user?.user_id ? "My Orders" : "Search Results"}
      </h2>
      {orderState.orders.map((order) => (
        <Card key={order.id} className="order-card mb-4 p-4 border rounded">
          <div className="order-header d-flex justify-content-between align-items-center mb-3">
            <h4 className="m-0">Order ID: {order.id}</h4>
            <span
              className={`order-status badge bg-${
                order.status === "completed" ? "success" : "warning"
              }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <div className="order-details mb-3">
            <p>
              <strong>OrderDate:</strong>{" "}
              {new Date(order.created_at).toLocaleDateString()}
            </p>
            <p>
              <strong>Total Amount:</strong> ${order.total_amount}
            </p>
            <p>
              <strong>PayPal Order ID:</strong> {order.paypal_order_id}
            </p>
          </div>
          <p>Order Items:</p>
          <ul className="list-group list-group-flush">
            {order.items &&
              order.items.map((item, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between">
                  <span>{item.product_name}</span>
                  <span>Quantity: {item.quantity}</span>
                  <span>Unit Price: ${item.price_at_time_of_purchase}</span>
                </li>
              ))}
          </ul>
        </Card>
      ))}
    </Container>
  );
};

export default MyOrders;
