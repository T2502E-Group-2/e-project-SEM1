import React, { useEffect, useState, useContext } from "react";
import UserContext from "../../context/context";
import URL from "../../util/url";
import { Container, Row, Form, Button, InputGroup } from "react-bootstrap";

function AdminOrder() {
  const { state } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      search: searchTerm,
      sort_by: sortBy,
      sort_order: sortOrder,
    });

    fetch(`${URL.ADMIN_ORDER}?${params.toString()}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Lỗi server: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchTerm, sortBy, sortOrder]);

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
  if (!state.user || state.user.role !== "admin") {
    return <div>Bạn không có quyền truy cập trang này.</div>;
  }

  if (loading) return <div>Đang tải đơn hàng...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!orders.length) return <div>Không có đơn hàng nào.</div>;

  const SortableHeader = ({ column, label }) => (
    <th style={thStyle} onClick={() => handleSort(column)}>
      {label}
      {sortBy === column && (
        <span style={{ marginLeft: "5px" }}>
          {sortOrder === "asc" ? "▲" : "▼"}
        </span>
      )}
    </th>
  );

  // --- START: STYLES FOR TABLE ---
  const tableContainerStyle = {
    maxHeight: "70vh", // Đặt chiều cao tối đa cho vùng cuộn
    overflowY: "auto", // Bật thanh cuộn dọc
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#ffff",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const theadStyle = {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: "#f2f2f2",
  };

  const thStyle = {
    borderBottom: "2px solid #ddd",
    padding: "12px",
    textAlign: "left",
    color: "#333",
    fontWeight: "bold",
  };

  const tdStyle = {
    borderBottom: "1px solid #ddd",
    padding: "12px",
    maxHeight: "80px",
    overflow: "hidden",
  };
  // --- END: STYLES FOR TABLE ---

  return (
    <Container
      className="container-fluid post-detail-page-wrapper"
      style={{ paddingTop: "200px" }}
    >
      <h1
        className="text-center mb-4"
        style={{
          color: "#ffff",
          fontWeight: "bold",
          textShadow: "1px 1px 2px #000",
        }}
      >
        Orders management (Admin)
      </h1>
      <Row className="mb-3">
        <Form onSubmit={handleSearchSubmit}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by name, PayPal ID, phone, address, or Order ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button variant="primary" type="submit">
              Search
            </Button>
            <Button variant="outline-secondary" onClick={clearSearch}>
              Clear
            </Button>
          </InputGroup>
        </Form>
      </Row>
      <Row>
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr style={{ maxHeight: "80%" }}>
                <SortableHeader column="order_id" label="Order ID" />
                <SortableHeader
                  column="paypal_order_id"
                  label="PayPal Order ID"
                />
                <SortableHeader column="full_name" label="Customer Name" />
                <th style={thStyle}>Phone No.</th>
                <th style={thStyle}>Add.</th>
                <th style={thStyle}>Notes</th>
                <th style={thStyle}>Product ID</th>
                <th style={thStyle}>Product Type</th>
                <th style={thStyle}>Quantity</th>
                <th style={thStyle}>Order Price</th>
                <SortableHeader column="total_amount" label="Total Amount" />
                <SortableHeader column="created_at" label="Order Date" />
              </tr>
            </thead>
            <tbody>
              {orders.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                  }}
                >
                  <td style={tdStyle}>{row.order_id}</td>
                  <td style={tdStyle}>{row.paypal_order_id}</td>
                  <td style={tdStyle}>{row.full_name}</td>
                  <td style={tdStyle}>{row.phone}</td>
                  <td style={tdStyle}>{row.address}</td>
                  <td style={tdStyle}>{row.note}</td>
                  <td style={tdStyle}>{row.product_id}</td>
                  <td style={tdStyle}>{row.product_type}</td>
                  <td style={tdStyle}>{row.quantity}</td>
                  <td style={tdStyle}>
                    ${parseFloat(row.price_at_time_of_purchase).toFixed(2)}
                  </td>
                  <td style={tdStyle}>
                    ${parseFloat(row.total_amount).toFixed(2)}
                  </td>
                  <td style={tdStyle}>{row.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Row>
    </Container>
  );
}

export default AdminOrder;
