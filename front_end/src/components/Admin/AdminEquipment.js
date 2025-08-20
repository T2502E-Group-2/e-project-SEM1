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

function AdminEquipment() {
  const { state } = useContext(UserContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("equipment_id");
  const [sortOrder, setSortOrder] = useState("desc");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchEquipments = React.useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      search: searchTerm,
      sort_by: sortBy,
      sort_order: sortOrder,
    });

    fetch(`${URL.ADMIN_EQUIPMENTS}?${params.toString()}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(`Server: ${r.status}`)))
      .then((data) => setRows(data))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    if (!state.user || state.user.role !== "admin") return;
    fetchEquipments();
  }, [state.user, fetchEquipments]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
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

  // EDIT
  const handleEdit = (equipment) => {
    setFormData(equipment);
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(URL.ADMIN_EQUIPMENTS, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        alert("Updated successfully");
        setShowModal(false);
        fetchEquipments();
      } else {
        alert("Update failed: " + result.message);
      }
    } catch (err) {
      alert("Error updating equipment");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this equipment?")) return;
    try {
      const res = await fetch(`${URL.ADMIN_EQUIPMENTS}?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        alert("Deleted successfully");
        fetchEquipments();
      } else {
        alert("Delete failed: " + result.message);
      }
    } catch (err) {
      alert("Error deleting equipment");
    }
  };

  if (!state.user || state.user.role !== "admin") return <PermissionWarning />;
  if (loading)
    return <div className="text-center mt-5">Loading Equipments...</div>;
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
        Equipments Management (Admin)
      </h1>

      {/* Search */}
      <Row className="mb-3">
        <Form onSubmit={handleSearchSubmit}>
          <Row>
            <Col xs={12} md={8} className="mb-2">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by name, brand, category, or description..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Button type="submit">Search</Button>
                <Button
                  variant="secondary"
                  style={{ backgroundColor: "var(--primary-color)" }}
                  onClick={clearSearch}>
                  Clear
                </Button>
              </InputGroup>
            </Col>
          </Row>
        </Form>
      </Row>

      <Row>
        <div className="tableContainerStyle" style={{ overflowX: "auto" }}>
          <table className="tableStyle">
            <thead className="theadStyle">
              <tr>
                <SortableHeader column="equipment_id" label="ID" />
                <th className="thStyle">Image</th>
                <SortableHeader column="name" label="Name" />
                <th className="thStyle">Category</th>
                <SortableHeader column="brand" label="Brand" />
                <SortableHeader column="price" label="Price" />
                <SortableHeader column="stock" label="Stock" />
                <SortableHeader column="is_featured" label="Featured" />
                <th className="thStyle">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((equipment, idx) => (
                <tr
                  key={idx}
                  style={{ background: idx % 2 ? "#f9f9f9" : "#fff" }}>
                  <td className="tdStyle">{equipment.equipment_id}</td>
                  <td className="tdStyle">
                    <img
                      src={equipment.image_url}
                      alt={equipment.name}
                      style={{ width: "80px", height: "auto" }}
                    />
                  </td>
                  <td className="tdStyle">{equipment.name}</td>
                  <td className="tdStyle">{equipment.category}</td>
                  <td className="tdStyle">{equipment.brand}</td>
                  <td className="tdStyle">${equipment.price}</td>
                  <td className="tdStyle">{equipment.stock}</td>
                  <td className="tdStyle">
                    {equipment.is_featured ? "Yes" : "No"}
                  </td>
                  <td className="tdStyle">
                    <ButtonGroup>
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => handleEdit(equipment)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(equipment.equipment_id)}>
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
          <Modal.Title>Edit Equipment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formData && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  name="name"
                  value={formData.name || ""}
                  onChange={handleModalChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="description"
                  value={formData.description || ""}
                  onChange={handleModalChange}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="equipment_category_id"
                      value={formData.equipment_category_id || ""}
                      onChange={handleModalChange}>
                      <option value="">-- Select Category --</option>
                      <option value="4">Footwear</option>
                      <option value="5">Accessories</option>
                      <option value="6">Equipment</option>
                      <option value="7">Clothing</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sub Category</Form.Label>
                    <Form.Control
                      name="sub_category"
                      value={formData.sub_category || ""}
                      onChange={handleModalChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  name="image_url"
                  value={formData.image_url || ""}
                  onChange={handleModalChange}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Brand</Form.Label>
                    <Form.Control
                      name="brand"
                      value={formData.brand || ""}
                      onChange={handleModalChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Model</Form.Label>
                    <Form.Control
                      name="model"
                      value={formData.model || ""}
                      onChange={handleModalChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={formData.price || ""}
                      onChange={handleModalChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Stock</Form.Label>
                    <Form.Control
                      type="number"
                      name="stock"
                      value={formData.stock || ""}
                      onChange={handleModalChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Featured</Form.Label>
                    <Form.Select
                      name="is_featured"
                      value={formData.is_featured || "0"}
                      onChange={handleModalChange}>
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={submitting}>
            {submitting ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminEquipment;
