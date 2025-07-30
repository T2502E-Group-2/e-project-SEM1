import { Col, Nav, Container, NavLink, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "react-bootstrap-icons";

const Footer = () => {
  return (
    <footer className="footer">
      <Container fluid>
        <Row className="align-items-center">
          <Col md={5}>
            <p className="footer-opening-hours" style={{ marginTop: "1rem" }}>
              Alpine Ascents International | phone: 206.378.1927 <br /> 109 W.
              Mercer St. - Seattle, WA 98119
            </p>
            <p className="footer-opening-hours">
              Monday to Friday 9.00 am to 8.00 pm
            </p>
            <p className="footer-opening-hours">
              Saturday from 9.00 am to 12.00 pm
            </p>
          </Col>
          <Col md={7} className="footer-social-icons">
            <Nav className="footer-nav gap-2">
              <NavLink as={Link} to="/terms">
                Terms and Conditions
              </NavLink>
              <NavLink as={Link} to="/about">
                About Us
              </NavLink>
              <NavLink as={Link} to="/contact">
                Contacts
              </NavLink>
            </Nav>
            <Nav className="gap-2">
              <NavLink
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer">
                <Facebook />
              </NavLink>
              <NavLink
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer">
                <Twitter />
              </NavLink>
              <NavLink
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer">
                <Instagram />
              </NavLink>
            </Nav>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col className="text-center footer-copyright">
            <p>© 2024 Climb@AlpineAscents.com. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
