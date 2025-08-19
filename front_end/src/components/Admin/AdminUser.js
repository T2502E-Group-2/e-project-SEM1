import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Row,
  Form,
  Button,
  InputGroup,
  Modal,
  Spinner,
  ButtonGroup,
  Col,
} from "react-bootstrap";
import UserContext from "../../context/context";
import URL from "../../util/url";

const PermissionWarning = () => (
  <Container style={{ paddingTop: "160px" }}>
    <h3
      className="text-center text-danger p-5"
      style={{
        background: "#ffff",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px",
        animation: "blink 1.2s infinite",
      }}>
      ⚠️ You do not have permission to access this page. ⚠️
    </h3>
    <style>{`@keyframes blink { 50% { opacity: 0.35; } }`}</style>
  </Container>
);

function AdminUser() {
  const { state } = useContext(UserContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = React.useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      search: searchTerm,
      sort_by: sortBy,
      sort_order: sortOrder,
      start_date: startDate,
      end_date: endDate,
    });

    fetch(`${URL.ADMIN_USERS}?${params.toString()}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(`Server: ${r.status}`)))
      .then((data) => setRows(data))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [searchTerm, sortBy, sortOrder, startDate, endDate]);

  useEffect(() => {
    if (!state.user || state.user.role !== "admin") return;
    fetchUsers();
  }, [state.user, fetchUsers]);

  const handleSort = (column) => {
    if (sortBy === column) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  useEffect(() => {
    fetchUsers();
  }, [startDate, endDate, fetchUsers]);

  // EDIT
  const handleEdit = (user) => {
    setFormData({
      ...user,
      is_active: user.is_active === "Active" ? "1" : "0",
    });
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(URL.ADMIN_USERS, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        alert("Updated successfully");
        setShowModal(false);
        fetchUsers();
      } else {
        alert("Update failed: " + result.message);
      }
    } catch (err) {
      alert("Error updating user");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this user?")) return;
    try {
      const res = await fetch(`${URL.ADMIN_USERS}?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        alert("Deleted successfully");
        fetchUsers();
      } else {
        alert("Delete failed: " + result.message);
      }
    } catch (err) {
      alert("Error deleting user");
    }
  };

  if (!state.user || state.user.role !== "admin") return <PermissionWarning />;

  if (loading) return <div className="text-center mt-5">Loading users...</div>;
  if (error) return <div className="text-center text-danger mt-5">{error}</div>;

  const SortableHeader = ({ column, label }) => {
    const active = sortBy === column;
    return (
      <th
        className="thStyle"
        style={{ cursor: "pointer", whiteSpace: "nowrap" }}
        onClick={() => handleSort(column)}>
        {label}
        <span style={{ marginLeft: 6, fontSize: "0.85em" }}>
          {active ? sortOrder === "asc" ? "▲" : "▼" : <span>▲▼</span>}
        </span>
      </th>
    );
  };

  return (
    <Container
      fluid
      className="container-fluid"
      style={{
        paddingTop: "160px",
        paddingBottom: "50px",
        paddingLeft: "50px",
        paddingRight: "50px",
      }}>
      <h1
        className="text-center mb-4"
        style={{ color: "#fff", textShadow: "1px 1px 2px #000" }}>
        Users Management (Admin)
      </h1>

      {/* Search */}
      <Row className="mb-3">
        <Form onSubmit={handleSearchSubmit}>
          <Row>
            <Col xs={12} md={8} className="mb-2">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by name, email, phone or address..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Button type="submit">Search</Button>
                <Button
                  variant="secondary"
                  style={{ backgroundColor: "darkorange" }}
                  onClick={clearSearch}>
                  Clear
                </Button>
              </InputGroup>
            </Col>
            <Col xs={12} md={4} className="mb-2">
              <InputGroup>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <Button
                  variant="secondary"
                  style={{ backgroundColor: "darkorange" }}
                  onClick={clearDateFilters}>
                  Clear
                </Button>
              </InputGroup>
            </Col>
          </Row>
        </Form>
      </Row>

      {/* Table */}
      <Row>
        <div className="tableContainerStyle">
          <table className="tableStyle">
            <thead className="theadStyle">
              <tr style={{ maxHeight: "80%" }}>
                <SortableHeader column="user_id" label="User ID" />
                <SortableHeader column="full_name" label="Full Name" />
                <SortableHeader column="email" label="Email" />
                <th className="thStyle">Phone</th>
                <th className="thStyle">Address</th>
                <SortableHeader column="role" label="Role" />
                <SortableHeader column="is_active" label="Status" />
                <SortableHeader column="created_at" label="Created At" />
                <SortableHeader column="updated_at" label="Updated At" />
                <th className="thStyle">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u, idx) => (
                <tr
                  key={idx}
                  style={{ background: idx % 2 ? "#f9f9f9" : "#fff" }}>
                  <td className="tdStyle">{u.user_id}</td>
                  <td className="tdStyle">{u.full_name}</td>
                  <td className="tdStyle">{u.email}</td>
                  <td className="tdStyle">{u.phone_number}</td>
                  <td className="tdStyle">{u.address}</td>
                  <td className="tdStyle">{u.role}</td>
                  <td className="tdStyle">{u.is_active}</td>
                  <td className="tdStyle">{u.created_at}</td>
                  <td className="tdStyle">{u.updated_at}</td>
                  <td className="tdStyle">
                    <ButtonGroup>
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => handleEdit(u)}>
                        Edit
                      </Button>{" "}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(u.user_id)}>
                        Delete
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Row>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formData && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  name="first_name"
                  value={formData.first_name || ""}
                  onChange={handleModalChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  name="last_name"
                  value={formData.last_name || ""}
                  onChange={handleModalChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  value={formData.email || ""}
                  onChange={handleModalChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  name="phone_number"
                  value={formData.phone_number || ""}
                  onChange={handleModalChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Control
                  name="role"
                  value={formData.role || ""}
                  onChange={handleModalChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="is_active"
                  value={formData.is_active || "0"}
                  onChange={handleModalChange}>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={submitting}>
            {submitting ? <Spinner animation="border" size="sm" /> : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminUser;
