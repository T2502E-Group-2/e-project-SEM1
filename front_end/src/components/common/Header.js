import { useEffect, useState, useContext, useRef } from "react";
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
import axios_instance from "../../util/axios_instance";
import AuthModal from "./AuthModal";
import useClickOutside from "../hooks/useClickOutside";
import URL from "../../util/url";
import CartContext from "../../context/CartContext";
import UserContext from "../../context/context";
import { LOGIN_SUCCESS, LOGOUT } from "../../context/action";

const Header = () => {
  const { state, dispatch } = useContext(UserContext);
  const { cartItemCount } = useContext(CartContext);
  const [gearCategories, setGearCategories] = useState([]);
  const [activityCategories, setActivityCategories] = useState([]);
  const [postCategories, setPostCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  useClickOutside(searchRef, () => setSearchOpen(false));
  const searchBtnRef = useRef(null);

  const [expanded, setExpanded] = useState(false);

  const navRef = useRef(null);
  useClickOutside(navRef, () => setExpanded(false));

  const navigate = useNavigate();

  const handleNavSelect = () => {
    setExpanded(false);
  };

  const handleOpenAuthModal = (mode) => {
    setAuthMode(mode);
    setShowModal(true);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setSearchOpen(false);
    }
  };

  const handleCloseModal = () => setShowModal(false);
  const handleLogout = () => dispatch({ type: LOGOUT });

  // Restore login status
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        dispatch({ type: LOGIN_SUCCESS, payload: JSON.parse(storedUser) });
      } catch (e) {
        console.error("Failed to parse user", e);
        localStorage.removeItem("user");
      }
    }
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const [gears, activities, posts] = await Promise.all([
          axios_instance.get(URL.EQUIPMENT_CATEGORIES),
          axios_instance.get(URL.ACTIVITY_CATEGORIES),
          axios_instance.get(URL.POST_CATEGORIES),
        ]);

        if (gears.data.status) setGearCategories(gears.data.data);
        if (activities.data.status) setActivityCategories(activities.data.data);
        if (posts.data.status) setPostCategories(posts.data.data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchAllCategories();
  }, []);

  //

  return (
    <>
      {/* =================== Header =================== */}
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <Container fluid>
          <Row className="align-items-center justify-content-start">
            {/* Logo */}
            <Col className="logo-image" xs={2}>
              <Image
                src="/logo.png"
                alt="Logo"
                width={"110px"}
                height={"110px"}
                style={{ cursor: "pointer", paddingRight: "0px" }}
                onClick={() => navigate("/")}
              />
            </Col>

            <Col
              xs={7}
              className="d-flex justify-content-center align-items-center"
              style={{
                gap: "10px",
                position: "relative",
                paddingLeft: "50px",
                paddingRight: "30px",
                fontSize: "1.2rem",
                textAlign: "center",
                cursor: "pointer",
              }}>
              {/* Search icon button */}

              <Image
                ref={searchBtnRef}
                onClick={() => setSearchOpen(!searchOpen)}
                src="../search-circle-ico.png"
                alt="Search"
                width="40px"
                className={`search-icon ${
                  scrolled ? "dark" : "light"
                }`}></Image>

              {/* Form search overlay */}
              {searchOpen && (
                <Form
                  ref={searchRef}
                  onSubmit={handleSearchSubmit}
                  className="search-overlay"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    background: "white",
                    padding: "5px",
                    width: "500px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    borderRadius: "10px",
                    zIndex: 2000,
                  }}>
                  <Form.Control
                    type="text"
                    placeholder="Type what you are looking for..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    autoFocus
                  />
                </Form>
              )}

              {/* =================== Navbar =================== */}
              <Navbar
                ref={navRef}
                expanded={expanded}
                onToggle={(next) => setExpanded(next)}
                className={`custom-navbar flex-grow-1 ${
                  scrolled ? "scrolled" : ""
                }`}
                expand="xxl">
                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">
                  <Nav
                    className="navbar-links mx-auto align-items-start"
                    onSelect={handleNavSelect}>
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
                        {activityCategories.map((c) => (
                          <Link
                            key={c.category_id}
                            to={`/activities?category_id=${c.category_id}`}
                            className="dropdown-item">
                            {c.category_name}
                          </Link>
                        ))}
                      </div>
                    </Nav.Item>
                    <Nav.Item className="dropdown">
                      <Nav.Link
                        as={Link}
                        to="/posts"
                        className="dropdown-toggle">
                        Posts
                      </Nav.Link>
                      <div className="dropdown-menu">
                        {postCategories.map((c) => (
                          <Link
                            key={c.category_id}
                            to={`/posts?category=${c.category_id}`}
                            className="dropdown-item">
                            {c.category_name}
                          </Link>
                        ))}
                        <Link
                          to="/posts/photo-gallery"
                          className="dropdown-item">
                          Photos Gallery
                        </Link>
                        <Link to="/posts/my-posts" className="dropdown-item">
                          My Posts
                        </Link>
                      </div>
                    </Nav.Item>
                    <Nav.Item className="dropdown">
                      <Nav.Link
                        as={Link}
                        to="/equipment"
                        className="dropdown-toggle">
                        Gears
                      </Nav.Link>
                      <div className="dropdown-menu">
                        {gearCategories.map((c) => (
                          <Link
                            key={c.category_id}
                            to={`/equipment?category_id=${c.category_id}`}
                            className="dropdown-item">
                            {c.category_name}
                          </Link>
                        ))}
                      </div>
                    </Nav.Item>
                    <Nav.Link as={Link} to="/my-orders">
                      My Orders
                    </Nav.Link>
                    {state.user && state.user.role === "admin" && (
                      <Nav.Link as={Link} to="/admin">
                        Admin Functions
                      </Nav.Link>
                    )}
                  </Nav>
                </Navbar.Collapse>
              </Navbar>
            </Col>

            <Col
              xs={3}
              className="d-flex justify-content-end align-items-center">
              <div
                style={{
                  paddingLeft: "30px",
                  paddingRight: "50px",
                  position: "relative",
                }}>
                <Link className="nav-link position-relative" to={"/cart"}>
                  <Image
                    src="../cart-icon.png"
                    alt="Cart"
                    width={"30px"}
                    height={"30px"}
                    className={`cart-icon ${scrolled ? "dark" : "light"}`}
                  />
                  <Badge
                    pill
                    bg="danger"
                    className="position-absolute top-0 start-100 translate-middle">
                    {cartItemCount}
                  </Badge>
                </Link>
              </div>
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
                    style={{
                      cursor: "pointer",
                      transition: "color 0.3s ease",
                      fontSize: "1.2rem",
                    }}
                    onClick={() => navigate("/profile")}>
                    {state.user.first_name} {state.user.last_name}
                  </span>
                  <button
                    className="btn btn-outline"
                    onClick={handleLogout}
                    style={{ fontSize: "1.2rem" }}>
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
                    }}
                    onClick={() => handleOpenAuthModal("register")}>
                    Register
                  </button>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </header>

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
