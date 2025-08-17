import React, { useContext } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import UserContext from "../../context/context";

function AdminFunction() {
  const { state } = useContext(UserContext);

  // Prevent access if user is not an admin
  if (!state.user || state.user.role !== "admin") {
    return (
      <Container style={{ paddingTop: "200px" }}>
        <Card>
          <h3 className="text-center text-danger p-3 mb-3 ">
            ⚠️ You do not have permission to access this page! ⚠️
          </h3>
        </Card>
      </Container>
    );
  }

  const adminLinks = [
    { path: "/admin/order-management", label: "Orders Management" },
    { path: "/admin/user-management", label: "Users Management" },
    { path: "/admin/post-management", label: "Posts Management" },
    {
      path: "/admin/activity-management",
      label: "Activities Management",
    },
    {
      path: "/admin/equipment-management",
      label: "Equipments Management",
    },
  ];

  const linkStyle = {
    display: "block",
    padding: "10px 15px",
    textDecoration: "none",
    fontWeight: "bold",
    color: "#333",
    borderRadius: "5px",
  };

  const activeStyle = {
    backgroundColor: "#007bff",
    color: "#fff",
  };

  return (
    <Container style={{ paddingTop: "200px" }}>
      <h1
        className="text-center mb-4"
        style={{
          color: "#ffff",
          fontWeight: "bold",
          textShadow: "1px 1px 2px #000",
        }}>
        Admin Functions
      </h1>
      <Row>
        {adminLinks.map((link, index) => (
          <Col xs={12} md={6} lg={4} key={index} className="mb-3">
            <Card className="text-center p-0">
              <Card.Body>
                <NavLink
                  to={link.path}
                  style={({ isActive }) =>
                    isActive ? { ...linkStyle, ...activeStyle } : linkStyle
                  }>
                  {link.label}
                </NavLink>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default AdminFunction;
