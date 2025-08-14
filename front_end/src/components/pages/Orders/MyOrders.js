import React, { useEffect, useContext } from "react";
import axios from "axios";
import UserContext from "../../../context/context"; // UserContext gốc để lấy user_id
import UserOrderContext, {
  FETCH_ORDERS_REQUEST,
  FETCH_ORDERS_SUCCESS,
  FETCH_ORDERS_FAILURE,
} from "../../../context/UserOrderContext";
import { Container, Spinner, Alert, Card } from "react-bootstrap";
import URL from "../../../util/url";

const MyOrders = () => {
  const { state: userState } = useContext(UserContext);
  const { state: orderState, dispatch } = useContext(UserOrderContext);

  //   console.log("Current userState:", userState);

  useEffect(() => {
    console.log("userState.user.user_id:", userState.user?.user_id);

    const fetchOrders = async (userId) => {
      dispatch({ type: FETCH_ORDERS_REQUEST });

      try {
        const apiUrl = `${URL.GET_USER_ORDERS}?user_id=${userId}`;
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
    };

    if (userState.user?.user_id) {
      fetchOrders(userState.user.user_id);
    } else if (!userState.isLoggedIn) {
      dispatch({
        type: FETCH_ORDERS_FAILURE,
        payload: "Please login to see your orders.",
      });
    }
  }, [userState.isLoggedIn, userState.user?.user_id, dispatch]);

  if (orderState.loading) {
    return (
      <Container className="text-center mt-5" style={{ paddingTop: "200px" }}>
        <Spinner animation="border" variant="primary" />
        <p>Loading...</p>
      </Container>
    );
  }

  if (orderState.error) {
    return (
      <Container className="mt-5" style={{ paddingTop: "200px" }}>
        <Alert variant="danger">{orderState.error}</Alert>
      </Container>
    );
  }

  if (!orderState.orders || orderState.orders.length === 0) {
    return (
      <Container className="mt-5" style={{ paddingTop: "200px" }}>
        <Alert variant="info">You do not have any orders yet.</Alert>
      </Container>
    );
  }

  return (
    <Container
      className="container-fluid post-detail-page-wrapper"
      style={{ paddingTop: "200px" }}>
      <h2 className="text-center mb-4">My Orders List</h2>
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
              <strong>Order Date:</strong>{" "}
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
                  <span>
                    Price at time of purchase: ${item.price_at_time_of_purchase}
                  </span>
                </li>
              ))}
          </ul>
        </Card>
      ))}
    </Container>
  );
};

export default MyOrders;
