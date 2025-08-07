import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Get shopping cart data from localstorage
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);

    // Calculate the total amount
    const newTotal = storedCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(newTotal);
  }, []);

  // Delete a product from the cart
  const handleRemoveFromCart = (itemId) => {
    const updatedCart = cart.filter((item) => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Update the total money
    const newTotal = updatedCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(newTotal);
  };

  // Update the number of products
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) newQuantity = 1;

    const updatedCart = cart.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Update the total money
    const newTotal = updatedCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(newTotal);
  };

  return (
    <Container style={{ paddingTop: "200px", paddingBottom: "50px" }}>
      <h2 className="mb-4">Your shopping cart</h2>
      {cart.length === 0 ? (
        <Alert variant="info">
          Your cart is empty.<Link to="/">Continue shopping</Link>
        </Alert>
      ) : (
        <>
          <Row>
            <Col md={8}>
              {cart.map((item) => (
                <Card key={item.id} className="mb-3">
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col xs={3}>
                        <img
                          src={item.image_url}
                          alt={item.name}
                          style={{ maxWidth: "100px" }}
                        />
                      </Col>
                      <Col xs={5}>
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Text>Price: ${item.price}</Card.Text>
                      </Col>
                      <Col xs={2}>
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
                      </Col>
                      <Col xs={2} className="text-end">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveFromCart(item.id)}>
                          Delete
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Total order</Card.Title>
                  <Card.Text>
                    ({cart.length} items in total): ${total.toFixed(2)}
                  </Card.Text>
                  <Button variant="primary" className="w-100">
                    Buy now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Cart;
