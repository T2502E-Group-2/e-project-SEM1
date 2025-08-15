import React, { useEffect, useState, useContext } from "react";
import UserContext from "../../context/context";
import URL from "../../util/url";
import {
  Container,
  Col,
  Row,
  Form,
  Button,
  InputGroup,
  Card,
} from "react-bootstrap";

function AdminOrder() {
  const { state } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    if (!state.user || state.user.role !== "admin") {
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({
      search: searchTerm,
      sort_by: sortBy,
      sort_order: sortOrder,
      start_date: startDate,
      end_date: endDate,
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
  }, [state.user, searchTerm, sortBy, sortOrder, startDate, endDate]);

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

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };

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

  if (loading) return <div>Loading orders ...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!orders.length) return <div>There are no orders.</div>;

  const SortableHeader = ({ column, label }) => {
    const isActive = sortBy === column;

    return (
      <th
        style={{ ...thStyle, cursor: "pointer", whiteSpace: "nowrap" }}
        onClick={() => handleSort(column)}>
        {label}
        <span style={{ marginLeft: "5px", fontSize: "0.8em" }}>
          {isActive ? (
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
      style={{ paddingTop: "200px" }}>
      <h1
        className="text-center mb-4"
        style={{
          color: "#ffff",
          fontWeight: "bold",
          textShadow: "1px 1px 2px #000",
        }}>
        Orders management (Admin)
      </h1>
      <Row className="mb-3">
        <Form onSubmit={handleSearchSubmit}>
          <Row>
            <Col xs={12} md={8} className="mb-2">
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
      <Row>
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr style={{ maxHeight: "80%" }}>
                <SortableHeader column="order_id" label="Order ID" />
                <th style={thStyle}>PayPal Order ID</th>
                <SortableHeader column="full_name" label="Customer Name" />
                <th style={thStyle}>Phone No.</th>
                <th style={thStyle}>Address</th>
                <th style={thStyle}>Notes</th>
                <th style={thStyle}>Item</th>
                <th style={thStyle}>Quantity</th>
                <th style={thStyle}>Order Price</th>
                <th style={thStyle}>Total Amount</th>
                <SortableHeader column="created_at" label="Order Date" />
                <SortableHeader column="status" label="Payment status" />
              </tr>
            </thead>
            <tbody>
              {orders.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                  }}>
                  <td style={tdStyle}>{row.order_id}</td>
                  <td style={tdStyle}>{row.paypal_order_id}</td>
                  <td style={tdStyle}>{row.full_name}</td>
                  <td style={tdStyle}>{row.phone}</td>
                  <td style={tdStyle}>{row.address}</td>
                  <td style={tdStyle}>{row.note}</td>
                  <td style={tdStyle}>
                    {row.activity_id
                      ? `Activity: ${row.activity_id}`
                      : row.equipment_id
                      ? `Equipment: ${row.equipment_id}`
                      : "-"}
                  </td>
                  <td style={tdStyle}>{row.quantity}</td>
                  <td style={tdStyle}>
                    ${parseFloat(row.price_at_time_of_purchase).toFixed(2)}
                  </td>
                  <td style={tdStyle}>
                    ${parseFloat(row.total_amount).toFixed(2)}
                  </td>
                  <td style={tdStyle}>{row.created_at}</td>
                  <td style={tdStyle}>{row.status}</td>
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
