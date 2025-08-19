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
      <Container style={{ paddingTop: "160px" }}>
        <Card>
          <h3 className="text-center text-danger p-3 mb-3 ">
            ⚠️ You do not have permission to access this page! ⚠️
          </h3>
        </Card>
      </Container>
    );
  }

  if (loading) return <div>Loading orders ...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!orders.length)
    return (
      <h3
        className="text-center"
        style={{
          color: "#ffff",
          textShadow: "1px 1px 2px #000",
          paddingTop: "160px",
        }}>
        {" "}
        There are no orders.
      </h3>
    );

  const SortableHeader = ({ column, label }) => {
    const isActive = sortBy === column;

    return (
      <th
        className="thStyle"
        style={{ cursor: "pointer", whiteSpace: "nowrap" }}
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

  return (
    <Container
      fluid
      style={{
        paddingTop: "160px",
        paddingBottom: "50px",
        paddingLeft: "50px",
        paddingRight: "50px",
      }}>
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
        <div className="tableContainerStyle">
          <table className="tableStyle">
            <thead className="theadStyle">
              <tr style={{ maxHeight: "80%" }}>
                <SortableHeader column="order_id" label="Order ID" />
                <th className="thStyle">PayPal Order ID</th>
                <SortableHeader column="full_name" label="Customer Name" />
                <th className="thStyle">Phone No.</th>
                <th className="thStyle">Address</th>
                <th className="thStyle">Notes</th>
                <th className="thStyle">Item</th>
                <th className="thStyle">Quantity</th>
                <th className="thStyle">Order Price</th>
                <th className="thStyle">Total Amount</th>
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
                  <td className="tdStyle">{row.order_id}</td>
                  <td className="tdStyle">{row.paypal_order_id}</td>
                  <td className="tdStyle">{row.full_name}</td>
                  <td className="tdStyle">{row.phone}</td>
                  <td className="tdStyle">{row.address}</td>
                  <td className="tdStyle">{row.note}</td>
                  <td className="tdStyle">
                    {row.activity_id
                      ? `Activity: ${row.activity_id}`
                      : row.equipment_id
                      ? `Equipment: ${row.equipment_id}`
                      : "-"}
                  </td>
                  <td className="tdStyle">{row.quantity}</td>
                  <td className="tdStyle">
                    ${parseFloat(row.price_at_time_of_purchase).toFixed(2)}
                  </td>
                  <td className="tdStyle">
                    ${parseFloat(row.total_amount).toFixed(2)}
                  </td>
                  <td className="tdStyle">{row.created_at}</td>
                  <td className="tdStyle">{row.status}</td>
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
