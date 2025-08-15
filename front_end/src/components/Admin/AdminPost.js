import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Form, Button, InputGroup } from "react-bootstrap";
import UserContext from "../../context/context";
import URL from "../../util/url";

const PermissionWarning = () => (
  <Container style={{ paddingTop: "200px" }}>
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
      <span role="img" aria-label="warn">
        ⚠️
      </span>
      You do not have permission to access this page.
      <span role="img" aria-label="warn">
        ⚠️
      </span>
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

  useEffect(() => {
    if (!state.user || state.user.role !== "admin") return;

    setLoading(true);
    const params = new URLSearchParams({
      search: searchTerm,
      sort_by: sortBy,
      sort_order: sortOrder,
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
  }, [state.user, searchTerm, sortBy, sortOrder]);

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

  if (!state.user || state.user.role !== "admin") return <PermissionWarning />;
  if (loading) return <div className="text-center mt-5">Loading posts...</div>;
  if (error) return <div className="text-center text-danger mt-5">{error}</div>;

  const tableContainerStyle = {
    maxHeight: "70vh",
    overflowY: "auto",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#ffff",
  };
  const tableStyle = { width: "100%", borderCollapse: "collapse" };
  const theadStyle = {
    position: "sticky",
    top: 0,
    zIndex: 1,
    background: "#f2f2f2",
  };
  const thStyle = {
    borderBottom: "2px solid #ddd",
    padding: "12px",
    textAlign: "left",
    fontWeight: "bold",
  };
  const tdStyle = { borderBottom: "1px solid #ddd", padding: "12px" };

  const SortableHeader = ({ column, label }) => {
    const active = sortBy === column;
    return (
      <th
        style={{ ...thStyle, cursor: "pointer", whiteSpace: "nowrap" }}
        onClick={() => handleSort(column)}>
        {label}
        <span style={{ marginLeft: 6, fontSize: "0.85em" }}>
          {active ? (
            sortOrder === "asc" ? (
              "▲"
            ) : (
              "▼"
            )
          ) : (
            <span style={{ opacity: 0.3 }}>▲▼</span>
          )}
        </span>
      </th>
    );
  };

  return (
    <Container className="container-fluid" style={{ paddingTop: "200px" }}>
      <h1
        className="text-center mb-4"
        style={{ color: "#fff", textShadow: "1px 1px 2px #000" }}>
        Posts Management (Admin)
      </h1>

      <Row className="mb-3">
        <Form onSubmit={handleSearchSubmit}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by title or author..."
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
        </Form>
      </Row>

      <Row>
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <SortableHeader column="id" label="Post ID" />
                <SortableHeader column="title" label="Title" />
                <th style={thStyle}>Author</th>
                <SortableHeader column="status" label="Status" />
                <SortableHeader column="created_at" label="Created At" />
              </tr>
            </thead>
            <tbody>
              {rows.map((p, idx) => (
                <tr
                  key={idx}
                  style={{ background: idx % 2 ? "#f9f9f9" : "#fff" }}>
                  <td style={tdStyle}>{p.id}</td>
                  <td style={tdStyle}>{p.title}</td>
                  <td style={tdStyle}>{p.author_name}</td>
                  <td style={tdStyle}>{p.status}</td>
                  <td style={tdStyle}>{p.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Row>
    </Container>
  );
}

export default AdminPost;
