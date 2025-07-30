import {
  Col,
  Row,
  Image,
  Form,
  Badge,
  Navbar,
  Nav,
  Container,
} from "react-bootstrap";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <>
      {/* =================== Header Logo + Cart + Login =================== */}
      <header className="header">
        <Row className="align-items-center">
          <Col className="logo-image" xs={3}>
            <Image
              src="/logo.png"
              alt="Logo"
              width={"120px"}
              height={"120px"}
            />
          </Col>
          <Col
            xs={6}
            className="container-fluid d-flex justify-content-between align-items-center"
            style={{ gap: "10px" }}>
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
              style={{ paddingLeft: "30px", marginRight: "1rem" }}>
              <Image
                className="cart-icon"
                src="../cart-icon.png"
                alt="Cart"
                width={"30px"}
                height={"30px"}
              />
              <Badge
                pill
                bg="danger"
                className="position-absolute top-0 start-100 translate-middle">
                {/* Placeholder for cart length, as context is removed */}0
                <span className="visually-hidden">items in cart</span>
              </Badge>
            </Link>
          </Col>
          <Col
            xs={3}
            className="container-fluid d-flex justify-content-center align-items-center">
            <Link className="user-link" to="/login">
              Login
            </Link>
            <Link
              className="user-link"
              to="/register"
              style={{
                marginLeft: "10px",
                marginRight: "10px",
              }}>
              Register
            </Link>
          </Col>
        </Row>
      </header>

      {/* =================== Navigation Menu =================== */}
      <Navbar
        className="custom-navbar"
        style={{
          fontSize: "18px",
          fontFamily: "sans-serif",
          padding: "2px",
        }}>
        <Container fluid>
          <Navbar.Toggle aria-controls="main-navbar" />
          <Navbar.Collapse id="main-navbar">
            <Nav className="navbar-links mx-auto">
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/about">
                About Us
              </Nav.Link>
              <Nav.Item className="dropdown">
                <Nav.Link
                  as={Link}
                  to="/activities"
                  className="dropdown-toggle">
                  Activities
                </Nav.Link>
                <div className="dropdown-menu">
                  <Link
                    to="/activities/mountaineering"
                    className="dropdown-item">
                    Mountaineering
                  </Link>
                  <Link to="/activities/climbing" className="dropdown-item">
                    Climbing
                  </Link>
                  <Link to="/activities/trekking" className="dropdown-item">
                    Trekking
                  </Link>
                </div>
              </Nav.Item>

              <Nav.Item className="dropdown">
                <Nav.Link as={Link} to="/posts" className="dropdown-toggle">
                  Posts
                </Nav.Link>
                <div className="dropdown-menu">
                  <Link to="/blog" className="dropdown-item">
                    Blog
                  </Link>
                  <Link to="/success" className="dropdown-item">
                    Success Stories
                  </Link>
                  <Link to="/news" className="dropdown-item">
                    Records
                  </Link>
                </div>
              </Nav.Item>

              <Nav.Item className="dropdown">
                <Nav.Link
                  as={Link}
                  to="/equipments"
                  className="dropdown-toggle">
                  Equipments
                </Nav.Link>
                <div className="dropdown-menu">
                  <Link to="/equipment/boots" className="dropdown-item">
                    Boots
                  </Link>
                  <Link to="/equipment/ropes" className="dropdown-item">
                    Ropes
                  </Link>
                  <Link to="/equipment/tents" className="dropdown-item">
                    Tents
                  </Link>
                </div>
              </Nav.Item>
              <Nav.Link as={Link} to="/contact">
                Contact Us
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
