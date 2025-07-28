import {
  Col,
  Row,
  Image,
  Button,
  Form,
  Badge,
  Navbar,
  Nav,
  NavDropdown,
  Container,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import UserContext from "../../context/context";
import { useContext, useEffect, useState } from "react";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";

const Header = () => {
  const { state } = useContext(UserContext);
  const [categories, setCategories] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  const get_menu_categories = async () => {
    try {
      const url = URL.CATEGORY_LIST;
      const rs = await axios_instance.get(url);
      setCategories(rs.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    get_menu_categories();
  }, []);

  // Lắng nghe sự kiện scroll để áp dụng class scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`header-and-menu-container ${scrolled ? "scrolled" : ""}`}>
      {/* =================== Header Logo + Cart + Login =================== */}
      <header className="header">
        <Row className="align-items-center">
          <Col xs={2}>
            <Image
              className="logo-image"
              src="/logo.png"
              alt="Logo"
              width={"150px"}
              height={"150px"}
              fluid
            />
          </Col>
          <Col
            xs={7}
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
              style={{ paddingLeft: "25px", marginRight: "1rem" }}>
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
                {state.cart.length}
                <span className="visually-hidden">items in cart</span>
              </Badge>
            </Link>
          </Col>
          <Col
            xs={3}
            className="container-fluid d-flex justify-content-center align-items-center">
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

      {/* =================== Navigation Menu =================== */}
      <Navbar
        expand="lg"
        className="mb-2 custom-navbar "
        style={{
          fontSize: "18px",
          fontFamily: "sans-serif",
          padding: "10px",
        }}>
        <Container fluid>
          <Navbar.Toggle aria-controls="main-navbar" />
          <Navbar.Collapse id="main-navbar">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/about">
                About Us
              </Nav.Link>
              <NavDropdown
                title="Courses & Activities"
                id="activities-dropdown">
                {categories.map((e, k) => {
                  return (
                    <NavDropdown.Item
                      as={Link}
                      to={`/category/${e.id}`}
                      key={k}>
                      {e.name}
                    </NavDropdown.Item>
                  );
                })}
              </NavDropdown>

              <NavDropdown title="Posts" id="post-dropdown">
                <NavDropdown.Item as={Link} to="/blog">
                  Blog
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/success">
                  Success Stories
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/news">
                  Records
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Equipments" id="equipments-dropdown">
                <NavDropdown.Item as={Link} to="/equipment/boots">
                  Boots
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/equipment/ropes">
                  Ropes
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/equipment/tents">
                  Tents
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link as={Link} to="/contact">
                Contact Us
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Header;
