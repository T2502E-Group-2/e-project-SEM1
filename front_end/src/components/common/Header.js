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
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios_instance from "../../util/axios_instance";
import AuthModal from "./AuthModal";
import URL from "../../util/url";
import CartContext from "../../context/CartContext";
import UserContext from "../../context/context";
import { LOGIN_SUCCESS, LOGOUT } from "../../context/action";

const Header = () => {
  const { state, dispatch } = useContext(UserContext);
  const { cartItemCount } = useContext(CartContext);
  const [gearCategories, setGearCategories] = useState([]);
  const [activityCategories, setActivityCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const handleOpenAuthModal = (mode) => {
    setAuthMode(mode);
    setShowModal(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  const handleCloseModal = () => setShowModal(false);

  const handleLogout = () => {
    dispatch({ type: LOGOUT });
  };

  // Restore login status from Localstorage when loading page
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        dispatch({ type: LOGIN_SUCCESS, payload: JSON.parse(storedUser) });
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem("user");
      }
    }
  }, [dispatch]);

  // Handle scroll event to change header style
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch the list of equipment
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const url = URL.EQUIPMENT_CATEGORIES;
        const rs = await axios_instance.get(url);
        if (rs.data.status && rs.data.data) {
          setGearCategories(rs.data.data);
        }
      } catch (error) {
        console.error("Failed to load gear categories:", error);
      }
    };
    fetchCategories();
  }, []);
  // Fetch the list of Activities
  const fetchActivities = async () => {
    try {
      const url = URL.ACTIVITY_CATEGORIES;
      const rs = await axios_instance.get(url);
      if (rs.data.status && rs.data.data) {
        setActivityCategories(rs.data.data);
      }
    } catch (error) {
      console.error("Failed to load activity categories:", error);
    }
  };
  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <>
      {/* =================== Header Logo + Cart + Login =================== */}
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <Row className="align-items-center">
          <Col className="logo-image" xs={3}>
            <Image
              src="/logo.png"
              alt="Logo"
              width={"120px"}
              height={"120px"}
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/")}
            />
          </Col>

          <Col
            xs={6}
            className="container-fluid d-flex justify-content-between align-items-center"
            style={{ gap: "10px" }}>
            <Form className="flex-grow-1" onSubmit={handleSearchSubmit}>
              <Form.Group controlId="search">
                <Form.Control
                  type="text"
                  placeholder="Type what you are looking for..."
                  className="search-input"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </Form.Group>
            </Form>
            <Navbar expand="lg" variant="light" className="navbar">
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
                  {cartItemCount}
                  <span className="visually-hidden">items in cart</span>
                </Badge>
              </Link>
            </Navbar>
          </Col>

          <Col
            xs={3}
            className="container-fluid d-flex justify-content-center align-items-center">
            {state.user ? (
              <div className="d-flex align-items-center">
                <Image
                  src={
                    state.user.avatar_url ||
                    "https://w7.pngwing.com/pngs/205/731/png-transparent-default-avatar-thumbnail.png"
                  }
                  alt="Avatar"
                  width="40px"
                  height="40px"
                  roundedCircle
                  className="me-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/profile")}
                />
                <span
                  className={`navbar-text me-2 ${
                    scrolled ? "text-dark" : "text-white"
                  }`}
                  style={{ cursor: "pointer", transition: "color 0.3s ease" }}
                  onClick={() => navigate("/profile")}>
                  {state.user.first_name} {state.user.last_name}
                </span>
                <button className="btn btn-outline" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex">
                <button
                  className="btn btn-primary me-2"
                  style={{
                    backgroundColor: "darkorange",
                    color: "white",
                    fontSize: "1.2rem",
                    borderColor: "darkorange",
                    transition: "background-color 0.3s ease",
                  }}
                  onClick={() => handleOpenAuthModal("login")}>
                  Login
                </button>
                <button
                  className="btn btn-success"
                  style={{
                    backgroundColor: "darkorange",
                    color: "white",
                    fontSize: "1.2rem",
                    borderColor: "darkorange",
                    transition: "background-color 0.3s ease",
                  }}
                  onClick={() => handleOpenAuthModal("register")}>
                  Register
                </button>
              </div>
            )}
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
                  {activityCategories.map((category) => (
                    <Link
                      key={category.category_id}
                      to={`/activities?category_id=${category.category_id}`}
                      className="dropdown-item">
                      {category.category_name}
                    </Link>
                  ))}
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
                  onClick={() => (window.location.href = "/equipment")}
                  className="dropdown-toggle">
                  Gears
                </Nav.Link>
                <div className="dropdown-menu">
                  {gearCategories.map((category) => (
                    <Link
                      key={category.category_id}
                      to={`/equipment?category_id=${category.category_id}`}
                      className="dropdown-item">
                      {category.category_name}
                    </Link>
                  ))}
                </div>
              </Nav.Item>
              {state.user && state.user.role === "admin" && (
                <Nav.Link as={Link} to="/admin/order">
                  Admin Functions
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <AuthModal
        show={showModal}
        onClose={handleCloseModal}
        mode={authMode}
        setAuthMode={setAuthMode}
      />
    </>
  );
};

export default Header;
