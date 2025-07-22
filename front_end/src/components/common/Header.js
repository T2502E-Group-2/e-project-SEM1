import { Col, Row, Image, Button, Form, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import UserContext from "../../context/context";
import { useContext } from "react";

const Header = () => {
  const { state } = useContext(UserContext);
  return (
    <header className="header">
      <Row>
        <Col xs={2}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={"130px"}
            height={"130px"}
            fluid
          />
        </Col>
        <Col
          xs={7}
          className="container-fluid d-flex justify-content-between align-items-center"
          style={{ paddingTop: "10px", gap: "10px" }}>
          <Form className="flex-grow-1">
            <Form.Group controlId="search">
              <Form.Control
                type="text"
                placeholder="Type what you are looking for..."
                className="search-input"
              />
            </Form.Group>
          </Form>
          <Link
            className="nav-link position-relative"
            to={"/cart"}
            style={{ paddingLeft: "25px", marginRight: "1rem" }}>
            <Image
              src="../cart-icon.png"
              alt="Cart"
              width={"30px"}
              height={"30px"}
            />
            <Badge
              pill
              bg="danger"
              className="position-absolute top-0 start-100 translate-middle">
              {state.cart.length}
              <span className="visually-hidden">items in cart</span>
            </Badge>
          </Link>
        </Col>
        <Col
          xs={3}
          className="text-end"
          style={{ paddingTop: "50px", gap: "10px" }}>
          <Button
            as={Link}
            to="/login"
            style={{
              paddingTop: "5px",
              paddingBottom: "5px",
            }}>
            Login
          </Button>
          <Button
            as={Link}
            to="/register"
            style={{
              marginLeft: "10px",
              marginRight: "10px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
            className="btn btn-warning">
            Register
          </Button>
        </Col>
      </Row>
    </header>
  );
};

export default Header;
