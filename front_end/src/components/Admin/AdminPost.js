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

function AdminPost() {
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

  const fetchPosts = React.useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      search: searchTerm,
      sort_by: sortBy,
      sort_order: sortOrder,
      start_date: startDate,
      end_date: endDate,
    });

    fetch(`${URL.ADMIN_POSTS}?${params.toString()}`, {
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
    fetchPosts();
  }, [state.user, fetchPosts]);

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
    fetchPosts();
  }, [startDate, endDate, fetchPosts]);

  const handleApprove = async (postId) => {
    if (!window.confirm("Are you sure you want to approve this post?")) return;

    try {
      const res = await fetch(URL.ADMIN_POSTS, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          action: "approve",
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert("Post approved successfully!");
        fetchPosts();
      } else {
        alert("Approve failed: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      alert("An error occurred while approving the post.");
    }
  };

  // EDIT
  const handleEdit = (post) => {
    setFormData({
      ...post,
      is_active: post.is_featured === "Featured" ? "1" : "0",
    });
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(URL.ADMIN_POSTS, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        alert("Updated successfully");
        setShowModal(false);
        fetchPosts();
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
    if (!window.confirm("Are you sure to delete this post?")) return;
    try {
      const res = await fetch(`${URL.ADMIN_POSTS}?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        alert("Deleted successfully");
        fetchPosts();
      } else {
        alert("Delete failed: " + result.message);
      }
    } catch (err) {
      alert("Error deleting post");
    }
  };

  if (!state.user || state.user.role !== "admin") return <PermissionWarning />;

  if (loading) return <div className="text-center mt-5">Loading Posts...</div>;
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
        Posts Management (Admin)
      </h1>

      {/* Search */}
      <Row className="mb-3">
        <Form onSubmit={handleSearchSubmit}>
          <Row>
            <Col xs={12} md={8} className="mb-2">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by title, author, featured or content..."
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
                  style={{ backgroundColor: "var(--primary-color)" }}
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
                <SortableHeader column="post_id" label="Post ID" />
                <SortableHeader column="title" label="Title" />
                <SortableHeader column="author" label="Author" />
                <th className="thStyle">Category</th>
                <SortableHeader column="published_at" label="Published At" />
                <SortableHeader column="status" label="Status" />
                <th className="thStyle">Thumbnail</th>
                <SortableHeader column="is_featured" label="Featured" />
                <SortableHeader column="created_at" label="Created At" />
                <SortableHeader column="updated_at" label="Updated At" />
                <th className="thStyle">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, idx) => (
                <tr
                  key={idx}
                  style={{ background: idx % 2 ? "#f9f9f9" : "#fff" }}>
                  <td className="tdStyle">{p.post_id}</td>
                  <td className="tdStyle">{p.title}</td>
                  <td className="tdStyle">{p.author_name}</td>
                  <td className="tdStyle">{p.category_name}</td>
                  <td className="tdStyle">{p.published_at}</td>
                  <td className="tdStyle">
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        color: "#fff",
                        fontWeight: "bold",
                        backgroundColor:
                          p.status === "published"
                            ? "#28a745"
                            : "var(--primary-color)",
                        fontSize: "0.8em",
                      }}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </td>
                  <td className="tdStyle">
                    <img
                      src={p.thumbnail_url}
                      alt={p.title}
                      style={{
                        maxWidth: "100px",
                        maxHeight: "100px",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                  </td>
                  <td className="tdStyle">{p.is_featured}</td>
                  <td className="tdStyle">{p.created_at}</td>
                  <td className="tdStyle">{p.updated_at}</td>
                  <td className="tdStyle">
                    <ButtonGroup>
                      {p.status === "draft" && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApprove(p.post_id)}
                          style={{ marginRight: "5px" }}>
                          Approve
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => handleEdit(p)}>
                        Edit
                      </Button>{" "}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(p.post_id)}>
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
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formData && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  name="title"
                  value={formData.title || ""}
                  onChange={handleModalChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Slug</Form.Label>
                <Form.Control
                  name="slug"
                  value={formData.slug || ""}
                  onChange={handleModalChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Content</Form.Label>
                <Form.Control
                  as="textarea"
                  name="content"
                  value={formData.content || ""}
                  onChange={handleModalChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status || "draft"}
                  onChange={handleModalChange}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>{" "}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="post_category_id"
                  value={formData.post_category_id || ""}
                  onChange={handleModalChange}>
                  <option value="">
                    --Select to change--{" "}
                    <p style={{ fontStyle: "italic" }}>
                      (current category: "{formData.category_name}")
                    </p>
                  </option>
                  <option value="8">News</option>
                  <option value="9">Success story</option>
                  <option value="10">Record</option>
                  <option value="11">Review</option>
                  <option value="12">Blog</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Thumbnail</Form.Label>
                <Form.Control
                  name="thumbnail"
                  value={formData.thumbnail_url || ""}
                  onChange={handleModalChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Featured</Form.Label>
                <Form.Select
                  name="is_featured"
                  value={formData.is_featured || "0"}
                  onChange={handleModalChange}>
                  <option value="1">Featured</option>
                  <option value="0">Non-featured</option>
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

export default AdminPost;
