import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios_instance from "../../util/axios_instance";

import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import URL from "../../util/url";

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const get_menu = async () => {
    const url = URL.CATEGORY_LIST;
    const rs = await axios_instance.get(url);
    setCategories(rs.data.data);
  };
  useEffect(() => {
    get_menu();
  }, []);
  return (
    <Navbar
      bg="light"
      className="mb-2"
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "18px",
        fontFamily: "sans-serif",
        padding: "10px",
      }}>
      <Container>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/about">
              About Us
            </Nav.Link>
            <NavDropdown title="Courses & Activities" id="courses-dropdown">
              {categories.map((e, k) => {
                return (
                  <li key={k} className="nav-item">
                    <Link className="nav-link" to={"/category/" + e.id}>
                      {e.name}
                    </Link>
                  </li>
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

            <Nav.Link as={Link} to="/records">
              Records
            </Nav.Link>
            <Nav.Link as={Link} to="/contact">
              Contact Us
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
export default Menu;
